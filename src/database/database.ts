import Storage from './storage';

interface ScanCursor {
    iterator: IterableIterator<string>;
    lastAccessedAt: number;
}

class Database {
    storage: Storage;
    private scanCursors = new Map<string, ScanCursor>();
    private nextScanCursor = 1;

    private readonly SCAN_CURSOR_TTL_MS = 60_000;
    private readonly MAX_ACTIVE_SCAN_CURSORS = 1000;
    private readonly MAX_SCAN_COUNT = 100;

    constructor(storage: Storage = new Storage()) {
        this.storage = storage;
    }

    ttl(key: string): number {
        if(!this.storage.has(key)) {
            return -2;
        }
        if(this.isExpired(key)) {
            this.deleteKey(key);
            return -2;
        }
        const expiredAt = this.storage.getExpiration(key);
        if(expiredAt === undefined) {
            return -1;
        }
        const remainingMilliseconds = expiredAt - Date.now();
        return Math.ceil(remainingMilliseconds / 1000);
    }

    set(key: string, value: string | string[], _type?: string): string {
        this.storage.set(key, { value, type: 'string' });
        this.storage.deleteExpiration(key);
        return "OK";
    }

    get(key: string): string | string[] | null {
        if (!this.storage.has(key)) {
            return null;
        }
        if(this.isExpired(key)) {
            this.deleteKey(key);
            return null;
        }
        return this.storage.get(key)!.value;
    }

    del(key: string): number {
        if(!this.storage.has(key)) {
            return 0;
        }
        this.deleteKey(key);
        return 1;
    }

    exists(key: string): number {
        return this.storage.has(key) ? 1 : 0;
    }

    expireAt(key: string, timestamp: number): number {
        if(!this.storage.has(key)) {
            return 0;
        }

        this.storage.setExpiration(key, timestamp);
        return 1;
    }

    isExpired(key: string): boolean {
        const expiredAt = this.storage.getExpiration(key);
        if(expiredAt === undefined) {
            return false;
        }

        return Date.now() >= expiredAt;
    }

    deleteKey(key: string): void {
        this.storage.delete(key);
        this.storage.deleteExpiration(key);
    }

    type(key: string): string {
        if(!this.storage.has(key)) {
            return 'none';
        }
        if(this.isExpired(key)) {
            this.deleteKey(key);
            return 'none';
        }
        return this.storage.get(key)!.type;
    }

    private cleanupExpiredScanCursors(now: number): void {
        for (const [cursor, session] of this.scanCursors) {
            if (now - session.lastAccessedAt >= this.SCAN_CURSOR_TTL_MS) {
                this.scanCursors.delete(cursor);
            }
        }
    }

    private createScanCursor(
        iterator: IterableIterator<string>,
        now: number
    ): string | null {
        if (this.scanCursors.size >= this.MAX_ACTIVE_SCAN_CURSORS) {
            return null;
        }

        let cursor = String(this.nextScanCursor);

        while (this.scanCursors.has(cursor)) {
            this.nextScanCursor =
                this.nextScanCursor >= Number.MAX_SAFE_INTEGER
                    ? 1
                    : this.nextScanCursor + 1;

            cursor = String(this.nextScanCursor);
        }

        this.nextScanCursor =
            this.nextScanCursor >= Number.MAX_SAFE_INTEGER
                ? 1
                : this.nextScanCursor + 1;

        this.scanCursors.set(cursor, {
            iterator,
            lastAccessedAt: now
        });

        return cursor;
    }

    scan(cursor: string, count: number): string[] | string {
        if (
            !Number.isInteger(count) ||
            count < 1 ||
            count > this.MAX_SCAN_COUNT
        ) {
            return 'ERR invalid scan count';
        }

        const now = Date.now();
        this.cleanupExpiredScanCursors(now);

        let activeCursor: string;
        let session: ScanCursor | undefined;

        if (cursor === '0') {
            const iterator = this.storage.iterateKeys();

            const newCursor = this.createScanCursor(iterator, now);

            if (newCursor === null) {
                return 'ERR too many active scan cursors';
            }

            activeCursor = newCursor;
            session = this.scanCursors.get(activeCursor);
        } else {
            session = this.scanCursors.get(cursor);

            if (!session) {
                return 'ERR invalid cursor';
            }

            activeCursor = cursor;
            session.lastAccessedAt = now;
        }

        if (!session) {
            return 'ERR invalid cursor';
        }

        const keys: string[] = [];
        let examined = 0;

        while (examined < count) {
            const result = session.iterator.next();

            if (result.done) {
                this.scanCursors.delete(activeCursor);
                return ['0', ...keys];
            }

            examined++;

            const key = result.value;

            if (!this.storage.has(key)) {
                continue;
            }

            if (this.isExpired(key)) {
                this.deleteKey(key);
                continue;
            }

            keys.push(key);
        }

        return [activeCursor, ...keys];
    }

}

export default Database;
