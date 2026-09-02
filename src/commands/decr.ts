import Database from '../database/database';
import { CommandResult } from '../types';

function decr(database: Database, args: string[]): CommandResult {
    if(args.length !== 1) {
        return 'ERR wrong number of arguments for \'DECR\' command';
    }
    
    const key = args[0];
    const value = database.get(key);
    
    if(value === null) {
        database.set(key, "-1");
        return -1;
    }

    if(!/^-?\d+$/.test(value as string)) {
        return 'ERR value is not an integer or out of range';
    }

    const newValue = Number(value) - 1;

    database.set(key, String(newValue));
    return newValue;
}

export default decr;
