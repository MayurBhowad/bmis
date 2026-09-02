import Database from '../database/database';
import { CommandResult } from '../types';

function lpop(database: Database, args: string[]): CommandResult {
    if (args.length < 1) {
        return 'ERR wrong number of arguments for LPOP command';
    }
 
    const key = args[0];

    let list = database.get(key);

    if (list === null) {
        return null;
    }

    if(!Array.isArray(list)) {
        return 'WRONGTYPE Operation against a key holding the wrong kind of value';
    }

    const value = list.shift();

    database.set(key, list, 'list');

    return value;
}

export default lpop;
