import Database from '../database/database';
import { CommandResult } from '../types';

function type(database: Database, args: string[]): CommandResult {
    if(args.length !== 1) {
        return "ERR wrong number of arguments for TYPE command";
    }
    return database.type(args[0]);
}

export default type;
