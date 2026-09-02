import Database from '../database/database';
import { CommandResult } from '../types';

function rpush(database: Database, args: string[]): CommandResult {
    if (args.length < 2) {
        return 'ERR wrong number of arguments for RPUSH command';
    }

    const key = args[0];   
    const values = args.slice(1);

    let entry = database.storage.get(key);

    if (entry === undefined) {
        entry = {
            value: [],
            type: 'list',
        }
    }

    if (entry.type !== 'list') {
        return 'WRONGTYPE Operation against a key holding the wrong kind of value';
    }

    (entry.value as string[]).push(...values);

    database.storage.set(key, entry);

    return (entry.value as string[]).length;
}

export default rpush;
