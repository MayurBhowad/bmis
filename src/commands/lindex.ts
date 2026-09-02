import Database from '../database/database';
import { CommandResult } from '../types';

function lindex(database: Database, args: string[]): CommandResult {
    if(args.length !== 2) {
        return "ERR wrong number of arguments for 'LINDEX' command";
    }

    const key = args[0];
    const index = Number(args[1]);

    if (!Number.isInteger(index)) {
        return "ERR value is not an integer or out of range";
    }

    const list = database.get(key);

    if(list === null) {
        return null;
    }

    if(!Array.isArray(list)) {
        return "WRONGTYPE Operation against a key holding the wrong kind of value";
    }

    let actualIndex = index;

    if(actualIndex < 0) {
        actualIndex = list.length + index;
    }

    if(actualIndex < 0 || actualIndex >= list.length) {
        return null;
    }

    return list[actualIndex];
}

export default lindex;
