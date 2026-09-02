import Database from '../database/database';
import { CommandResult } from '../types';

function lpush(database: Database, args: string[]): CommandResult {
    if (args.length < 2) {
        return 'ERR wrong number of arguments for LPUSH command';
    }

    const key = args[0];
    const values = args.slice(1);

    let list = database.get(key);

    if (list === null) {
        list = [];
    }

    if(!Array.isArray(list)) {
        return 'WRONGTYPE Operation against a key holding the wrong kind of value';
    }

    // list.unshift(...values);
    for (const value of values) {
        list.unshift(value);
    }

    database.set(key, list, 'list');

    return list.length;
}

export default lpush;
