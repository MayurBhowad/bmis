import Database from '../database/database';
import { CommandResult } from '../types';

function execute(database: Database, args: string[]): CommandResult {
    if(args.length !== 1) {
        return "ERR wrong number of arguments for TTL command";
    }
    const key = args[0];
    return database.ttl(key);
}

export default execute;
