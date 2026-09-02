import Database from '../database/database';
import { CommandResult } from '../types';

function llen(database: Database, args: string[]): CommandResult {
    if(args.length !== 1) {
        return "ERR wrong number of arguments for 'LLEN' command";
    }

    const key = args[0];
    const list = database.get(key);

    if(list  === null) {
        return 0;
    }

    if(!Array.isArray(list)) {
        return "WRONGTYPE Operation against a key holding the wrong kind of value";
    }

    return list.length;
}

export default llen;
