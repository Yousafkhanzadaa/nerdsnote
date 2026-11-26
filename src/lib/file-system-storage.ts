import { delMany, getMany, setMany, update } from 'idb-keyval';
import { normalizeNoteContent } from '@/lib/note-content';

export interface Note {
    id: string;
    title: string;
    content: string;
    lastModified: Date;
}

const DIRECTORY_HANDLE_KEY = 'nerds-note-directory-handle';
const FILE_INDEX_KEY = 'nerds-note-directory-index';

interface FileRecord {
    id: string;
    title: string;
    filename: string;
}

interface FileIndex {
    directory: FileSystemDirectoryHandle;
    directoryId: string;
    revision: number;
    files: FileRecord[];
    removedIds: string[];
}

interface ScannedFile extends FileRecord {
    handle: FileSystemFileHandle;
    text: string;
}

function hasName(error: unknown, name: string) {
    return typeof error === 'object' && error !== null && 'name' in error && error.name === name;
}

export class FileSystemStorage {
    private index: FileIndex | null = null;
    private files = new Map<string, ScannedFile>();
    private removedIds = new Set<string>();
    private pending = Promise.resolve();
    private scanned = false;
    private indexNeedsSave = false;

    // Filename allocation, rename, delete and folder switches must finish in order.
    private enqueue<T>(operation: () => Promise<T>): Promise<T> {
        const result = this.pending.then(operation);
        this.pending = result.then(() => {}, () => {});
        return result;
    }

    static isSupported(): boolean {
        return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
    }

    private async indexFor(directory: FileSystemDirectoryHandle, stored?: FileIndex): Promise<FileIndex> {
        if (stored && await directory.isSameEntry(stored.directory)) {
            if (this.index?.directoryId === stored.directoryId && this.index.revision === stored.revision) {
                return this.index;
            }
            return { ...stored, directory };
        }
        if (this.index && await directory.isSameEntry(this.index.directory)) return this.index;
        return {
            directory,
            directoryId: crypto.randomUUID(),
            revision: 0,
            files: [],
            removedIds: [],
        };
    }

    private useIndex(index: FileIndex | null) {
        if (index === this.index) return;
        this.index = index;
        this.files.clear();
        this.removedIds = new Set(index?.removedIds);
        this.scanned = false;
        this.indexNeedsSave = false;
    }

    async loadHandle(): Promise<boolean> {
        return this.enqueue(async () => {
            // The original version saved only a directory handle under the first key.
            const [directory, index] = await getMany([DIRECTORY_HANDLE_KEY, FILE_INDEX_KEY]) as
                [FileSystemDirectoryHandle | undefined, FileIndex | undefined];
            this.useIndex(directory ? await this.indexFor(directory, index) : null);
            return !!directory;
        });
    }

    async connectDirectory(): Promise<boolean> {
        let directory: FileSystemDirectoryHandle;
        try {
            // Start the picker synchronously while the user gesture is active.
            directory = await window.showDirectoryPicker({ mode: 'readwrite', id: 'nerds-note-storage' });
        } catch (error) {
            if (hasName(error, 'AbortError')) return false;
            throw error;
        }
        return this.enqueue(async () => {
            const [index] = await getMany<FileIndex | undefined>([FILE_INDEX_KEY]);
            const next = await this.indexFor(directory, index);
            await setMany([[DIRECTORY_HANDLE_KEY, directory], [FILE_INDEX_KEY, next]]);
            this.useIndex(next);
            return true;
        });
    }

    async disconnectDirectory(): Promise<void> {
        return this.enqueue(async () => {
            const [selected] = await getMany<FileSystemDirectoryHandle | undefined>([DIRECTORY_HANDLE_KEY]);
            if (selected && this.index && await selected.isSameEntry(this.index.directory)) {
                await delMany([DIRECTORY_HANDLE_KEY, FILE_INDEX_KEY]);
            }
            this.useIndex(null);
        });
    }

    async verifyPermission(mode: 'read' | 'readwrite' = 'readwrite'): Promise<boolean> {
        const directory = this.index?.directory;
        if (!directory) return false;
        return await directory.queryPermission({ mode }) === 'granted'
            || await directory.requestPermission({ mode }) === 'granted';
    }

    async hasPermission(mode: 'read' | 'readwrite' = 'readwrite'): Promise<boolean> {
        return await this.index?.directory.queryPermission({ mode }) === 'granted';
    }

    getDirectoryName(): string | null {
        return this.index?.directory.name ?? null;
    }

    wasRemoved(id: string): boolean {
        return this.removedIds.has(id);
    }

    private async storeIndex() {
        if (!this.index) return;
        const current = this.index;
        const files = Array.from(this.files.values(), ({ id, title, filename }) => ({ id, title, filename }));
        const next = { ...current, files, removedIds: [...this.removedIds], revision: current.revision + 1 };
        this.indexNeedsSave = true;
        await update<FileIndex>(FILE_INDEX_KEY, stored => {
            if (stored && (stored.directoryId !== current.directoryId || stored.revision !== current.revision)) {
                throw new Error('Folder information changed in another tab. Reopen the folder to continue.');
            }
            return next;
        });
        this.index = next;
        this.indexNeedsSave = false;
    }

    private async checkConnection() {
        const [selected, stored] = await getMany([DIRECTORY_HANDLE_KEY, FILE_INDEX_KEY]) as
            [FileSystemDirectoryHandle | undefined, FileIndex | undefined];
        const index = this.index;
        if (!index || !selected || !await selected.isSameEntry(index.directory) ||
            (stored && (index.directoryId !== stored.directoryId || index.revision !== stored.revision))) {
            throw new Error('The connected folder changed in another tab. Reopen the folder to continue.');
        }
        if (this.indexNeedsSave) await this.storeIndex();
    }

    private async scan(): Promise<Note[]> {
        if (!this.index) return [];
        const { directory, directoryId } = this.index;
        const recorded = new Map(this.index.files.map((record) => [record.filename, record]));
        const ids = new Set([...this.removedIds, ...this.index.files.map((record) => record.id)]);
        const scanned = new Map<string, ScannedFile>();
        const notes: Note[] = [];
        let indexChanged = false;
        for await (const entry of directory.values()) {
            if (entry.kind !== 'file' || !/\.(txt|md)$/i.test(entry.name)) continue;
            const handle = entry as FileSystemFileHandle;
            const file = await handle.getFile();
            const text = await file.text();
            let record = recorded.get(entry.name);
            if (!record || this.wasRemoved(record.id)) {
                indexChanged = true;
                const candidate = `file:${directoryId}:${entry.name}`;
                record = {
                    id: ids.has(candidate) ? crypto.randomUUID() : candidate,
                    filename: entry.name,
                    title: entry.name.replace(/\.(txt|md)$/i, ''),
                };
            }
            ids.add(record.id);
            scanned.set(record.id, { ...record, handle, text });
            notes.push({
                id: record.id, title: record.title,
                content: normalizeNoteContent(text), lastModified: new Date(file.lastModified),
            });
        }
        // A read failure leaves the last complete scan intact.
        for (const record of recorded.values()) {
            if (!scanned.has(record.id)) this.removedIds.add(record.id);
        }
        this.files = scanned;
        if (indexChanged || scanned.size !== recorded.size || this.indexNeedsSave) {
            try {
                await this.storeIndex();
            } catch {
                // The file contents are still readable if IndexedDB rejects an
                // upgrade. Mutations must retry the index before touching disk.
            }
        }
        this.scanned = true;
        return notes.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    }

    loadNotes(): Promise<Note[]> {
        return this.enqueue(() => this.scan());
    }

    private async availableName(directory: FileSystemDirectoryHandle, title: string, extension: string) {
        const stem = title.replace(/[\\/:*?"<>|]/g, '-').trim() || 'Untitled Note';
        let count = 1;
        for (;;) {
            const filename = count === 1 ? `${stem}${extension}` : `${stem} (${count})${extension}`;
            try {
                await directory.getFileHandle(filename);
            } catch (error) {
                if (hasName(error, 'NotFoundError')) return filename;
                // A subdirectory also occupies this name.
                if (!hasName(error, 'TypeMismatchError')) throw error;
            }
            count++;
        }
    }

    private async checkOriginal(directory: FileSystemDirectoryHandle, original: ScannedFile) {
        const current = await directory.getFileHandle(original.filename);
        const text = await (await current.getFile()).text();
        if (!await current.isSameEntry(original.handle) || text !== original.text) {
            throw new Error('The file changed outside NerdsNote. Reopen the folder to review both versions.');
        }
    }

    saveNote(note: Note): Promise<void> {
        return this.enqueue(async () => {
            const directory = this.index?.directory;
            if (!directory) throw new Error('No directory connected');
            if (!this.scanned) await this.scan();
            await this.checkConnection();
            if (this.wasRemoved(note.id)) throw new Error('This file was removed from the folder.');
            const original = this.files.get(note.id);
            if (original) await this.checkOriginal(directory, original);

            const content = normalizeNoteContent(note.content);
            const sameContent = original && normalizeNoteContent(original.text) === content;
            const sameName = original && original.title === note.title;
            if (sameContent && sameName) return;

            const extension = original?.filename.match(/\.(txt|md)$/i)?.[0] ?? '.txt';
            const filename = sameName ? original.filename : await this.availableName(directory, note.title, extension);
            const handle = sameName ? original.handle : await directory.getFileHandle(filename, { create: true });
            const text = sameContent ? original.text : content;
            const saved = { id: note.id, title: note.title, filename, handle, text: '' };
            try {
                if (!sameName) await this.checkOriginal(directory, saved);
                const writable = await handle.createWritable();
                try {
                    await writable.write(text);
                    // Writes are staged until close. Recheck before committing them.
                    await this.checkOriginal(directory, sameName ? original : saved);
                    await writable.close();
                } catch (error) {
                    await writable.abort().catch(() => {});
                    throw error;
                }
                saved.text = text;
                if (original && !sameName) {
                    await this.checkOriginal(directory, original);
                    await directory.removeEntry(original.filename);
                }
            } catch (error) {
                if (!sameName) {
                    // A failed rename leaves the original in place. Remove our new
                    // file only if nobody has changed or replaced it in the meantime.
                    await this.checkOriginal(directory, saved)
                        .then(() => directory.removeEntry(filename))
                        .catch(() => {});
                }
                throw error;
            }
            this.files.set(note.id, saved);
            if (!sameName) await this.storeIndex();
        });
    }

    deleteNote(noteId: string): Promise<void> {
        return this.enqueue(async () => {
            const directory = this.index?.directory;
            if (!directory) return;
            if (!this.scanned) await this.scan();
            await this.checkConnection();
            const original = this.files.get(noteId);
            if (!original) return;
            try {
                await this.checkOriginal(directory, original);
                await directory.removeEntry(original.filename);
            } catch (error) {
                if (!hasName(error, 'NotFoundError')) throw error;
            }
            this.files.delete(noteId);
            this.removedIds.add(noteId);
            await this.storeIndex();
        });
    }
}

export const fileSystemStorage = new FileSystemStorage();
