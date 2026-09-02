import Database from '../database/database';
import { CommandResult } from '../types';

function execute(database: Database, args: string[]): CommandResult {
    if (args.length !== 1) {
        return 'ERR wrong number of arguments for GET command';
    }
    const key = args[0];
    return database.get(key);
}

export default execute;
