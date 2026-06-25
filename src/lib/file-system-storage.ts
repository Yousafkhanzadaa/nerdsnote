
import { get, set, del } from 'idb-keyval';
import { normalizeNoteContent } from '@/lib/note-content';

export interface Note {
    id: string;
    title: string;
    content: string;
    lastModified: Date;
}

const DIRECTORY_HANDLE_KEY = 'nerds-note-directory-handle';

export class FileSystemStorage {
    private directoryHandle: FileSystemDirectoryHandle | null = null;

    // Track currently managed filenames to help with sync
    private managedFiles: Set<string> = new Set();

    // Authoritative mapping of note id -> on-disk filename. This lets us rename
    // and delete the correct file even when two notes share a title, instead of
    // resolving the filename from the (non-unique) title every time.
    private fileNames: Map<string, string> = new Map();

    /**
     * Checks if the File System Access API is supported in this browser.
     */
    static isSupported(): boolean {
        return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
    }

    /**
     * Tries to load a previously saved directory handle from IndexedDB.
     */
    async loadHandle(): Promise<boolean> {
        try {
            const handle = await get<FileSystemDirectoryHandle>(DIRECTORY_HANDLE_KEY);
            if (handle) {
                // Verify permissions - we might need to request them again
                // but we can't request 'readwrite' immediately without user gesture usually.
                // We'll return true and let the UI prompt if needed.
                this.directoryHandle = handle;
                return true;
            }
        } catch (error) {
            console.error('Failed to load directory handle:', error);
        }
        return false;
    }

    /**
     * prompts the user to select a directory and saves the handle.
     */
    async connectDirectory(): Promise<void> {
        try {
            const handle = await window.showDirectoryPicker({
                mode: 'readwrite',
                id: 'nerds-note-storage', // remembers the directory preference
            });
            this.directoryHandle = handle;
            await set(DIRECTORY_HANDLE_KEY, handle);
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Failed to connect directory:', error);
                throw error;
            }
        }
    }

    /**
     * Disconnects the current directory handle.
     */
    async disconnectDirectory(): Promise<void> {
        this.directoryHandle = null;
        this.managedFiles.clear();
        this.fileNames.clear();
        await del(DIRECTORY_HANDLE_KEY);
    }

    /**
     * Verifies if we have permission to read/write to the directory.
     */
    async verifyPermission(mode: 'read' | 'readwrite' = 'readwrite'): Promise<boolean> {
        if (!this.directoryHandle) return false;

        // Check if we already have permission
        if ((await this.directoryHandle.queryPermission({ mode })) === 'granted') {
            return true;
        }

        // Request permission
        if ((await this.directoryHandle.requestPermission({ mode })) === 'granted') {
            return true;
        }

        return false;
    }

    /**
     * Checks current permission state without triggering a browser prompt.
     */
    async hasPermission(mode: 'read' | 'readwrite' = 'readwrite'): Promise<boolean> {
        if (!this.directoryHandle) return false;

        try {
            return (await this.directoryHandle.queryPermission({ mode })) === 'granted';
        } catch (error) {
            console.error('Failed to query directory permission:', error);
            return false;
        }
    }

    /**
     * Gets the name of the connected directory.
     */
    getDirectoryName(): string | null {
        return this.directoryHandle ? this.directoryHandle.name : null;
    }

    /**
     * Sanitize a title into a valid base filename (without disambiguation).
     */
    private getFilename(title: string): string {
        // Replace invalid characters with - and trim
        // Invalid: / \ : * ? " < > |
        const safeTitle = title.replace(/[\\/:*?"<>|]/g, '-').trim();
        const filename = safeTitle.length > 0 ? safeTitle : 'Untitled Note';
        return `${filename}.txt`;
    }

    /**
     * Resolves the filename to write this note to, avoiding collisions with a
     * *different* note's file. A note keeps writing to the filename it already
     * owns; new collisions get a numeric suffix (e.g. "Notes (2).txt") so we
     * never overwrite another note's content.
     */
    private async resolveFilename(note: Note): Promise<string> {
        const desired = this.getFilename(note.title);

        // Already own this exact name (no rename) — reuse it.
        if (this.fileNames.get(note.id) === desired) {
            return desired;
        }

        const dotIndex = desired.lastIndexOf('.');
        const stem = desired.slice(0, dotIndex);
        const ext = desired.slice(dotIndex);

        let candidate = desired;
        let counter = 2;
        while (
            this.isFilenameOwnedByOther(candidate, note.id) ||
            (await this.fileExistsUnowned(candidate, note.id))
        ) {
            candidate = `${stem} (${counter})${ext}`;
            counter++;
        }
        return candidate;
    }

    /** True if a different note already maps to this filename. */
    private isFilenameOwnedByOther(filename: string, ownId: string): boolean {
        for (const [id, name] of this.fileNames) {
            if (id !== ownId && name === filename) return true;
        }
        return false;
    }

    /** True if the file exists on disk but isn't owned by this note. */
    private async fileExistsUnowned(filename: string, ownId: string): Promise<boolean> {
        if (!this.directoryHandle) return false;
        if (this.fileNames.get(ownId) === filename) return false;

        try {
            await this.directoryHandle.getFileHandle(filename, { create: false });
            return true;
        } catch (error) {
            if ((error as DOMException).name === 'NotFoundError') return false;
            throw error;
        }
    }

    /** Removes a file from disk and forgets any note that mapped to it. */
    private async removeFile(filename: string): Promise<void> {
        if (!this.directoryHandle) return;

        try {
            await this.directoryHandle.removeEntry(filename);
        } catch (error) {
            // If file doesn't exist, ignore
            if ((error as DOMException).name !== 'NotFoundError') {
                throw error;
            }
        }

        this.managedFiles.delete(filename);
        for (const [id, name] of this.fileNames) {
            if (name === filename) this.fileNames.delete(id);
        }
    }

    /**
     * Saves a note to the file system. Handles renames (removing the stale file)
     * and same-title collisions internally via the id -> filename map.
     */
    async saveNote(note: Note): Promise<void> {
        if (!this.directoryHandle) throw new Error('No directory connected');

        const filename = await this.resolveFilename(note);
        const previous = this.fileNames.get(note.id);
        const content = normalizeNoteContent(note.content);

        try {
            const fileHandle = await this.directoryHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();

            await writable.write(content);
            await writable.close();

            // A rename moved this note to a new filename — drop the old file.
            if (previous && previous !== filename) {
                await this.removeFile(previous);
            }

            this.fileNames.set(note.id, filename);
            this.managedFiles.add(filename);
        } catch (error) {
            console.error(`Failed to save note ${note.id}:`, error);
            throw error;
        }
    }

    /**
     * Deletes the file backing a note, identified by its id. Renames are handled
     * by saveNote, so callers only need this for actual deletions.
     */
    async deleteNote(noteId: string): Promise<void> {
        if (!this.directoryHandle) return;

        const filename = this.fileNames.get(noteId);
        if (!filename) return;

        try {
            await this.removeFile(filename);
        } catch (error) {
            console.error(`Failed to delete note ${noteId}:`, error);
            throw error;
        }
    }

    /**
     * Loads all txt/md files from the directory as Notes.
     */
    async loadNotes(): Promise<Note[]> {
        if (!this.directoryHandle) return [];

        try {
            const notes: Note[] = [];
            this.managedFiles.clear();
            this.fileNames.clear();

            // @ts-ignore - values() iterator support varies in TS types
            for await (const entry of this.directoryHandle.values()) {
                if (entry.kind === 'file' && (entry.name.endsWith('.txt') || entry.name.endsWith('.md'))) {
                    try {
                        const fileHandle = entry as FileSystemFileHandle;
                        const file = await fileHandle.getFile();
                        const text = await file.text();

                        // Use filename as title (remove extension)
                        const title = entry.name.replace(/\.(txt|md)$/, '');

                        this.managedFiles.add(entry.name);
                        this.fileNames.set(title, entry.name);

                        notes.push({
                            id: title, // Use title as ID for file-based notes
                            title: title,
                            content: normalizeNoteContent(text),
                            lastModified: new Date(file.lastModified)
                        });
                    } catch (err) {
                        console.error('Error reading file:', entry.name, err);
                    }
                }
            }

            // Sort by last modified descending
            return notes.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
        } catch (error) {
            console.error('Failed to load notes from directory:', error);
            throw error;
        }
    }
}

export const fileSystemStorage = new FileSystemStorage();
