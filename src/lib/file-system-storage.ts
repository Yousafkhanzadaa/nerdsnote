
import { get, set, del } from 'idb-keyval';

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
     * Gets the name of the connected directory.
     */
    getDirectoryName(): string | null {
        return this.directoryHandle ? this.directoryHandle.name : null;
    }

    /**
     * Sanitize title to be a valid filename.
     */
    private getFilename(title: string): string {
        // Replace invalid characters with - and trim
        // Invalid: / \ : * ? " < > |
        const safeTitle = title.replace(/[\\/:*?"<>|]/g, '-').trim();
        const filename = safeTitle.length > 0 ? safeTitle : 'Untitled Note';
        return `${filename}.txt`;
    }

    /**
     * Saves a note to the file system.
     */
    async saveNote(note: Note): Promise<void> {
        if (!this.directoryHandle) throw new Error('No directory connected');

        const filename = this.getFilename(note.title);

        try {
            const fileHandle = await this.directoryHandle.getFileHandle(filename, { create: true });
            const writable = await fileHandle.createWritable();

            await writable.write(note.content);
            await writable.close();

            this.managedFiles.add(filename);
        } catch (error) {
            console.error(`Failed to save note ${note.id}:`, error);
            throw error;
        }
    }

    /**
     * Deletes a note from the file system by its TITLE.
     * This is used when renaming (delete old title) or deleting.
     */
    async deleteNoteByTitle(title: string): Promise<void> {
        if (!this.directoryHandle) return;

        const filename = this.getFilename(title);
        try {
            await this.directoryHandle.removeEntry(filename);
            this.managedFiles.delete(filename);
        } catch (error) {
            // If file doesn't exist, ignore
            if ((error as DOMException).name !== 'NotFoundError') {
                console.error(`Failed to delete note with title ${title}:`, error);
            }
        }
    }

    /**
     * Loads all txt/md files from the directory as Notes.
     */
    async loadNotes(): Promise<Note[]> {
        if (!this.directoryHandle) return [];

        const notes: Note[] = [];
        this.managedFiles.clear();

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

                    notes.push({
                        id: title, // Use title as ID for file-based notes
                        title: title,
                        content: text,
                        lastModified: new Date(file.lastModified)
                    });
                } catch (err) {
                    console.error('Error reading file:', entry.name, err);
                }
            }
        }

        // Sort by last modified descending
        return notes.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    }
}

export const fileSystemStorage = new FileSystemStorage();
