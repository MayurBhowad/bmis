import Database from '../database/database';
import { CommandResult } from '../types';

function execute(database: Database, args: string[]): CommandResult {
    if (args.length < 1) {
        return 'ERR wrong number of arguments for EXISTS command';
    }

    let existsCount = 0;

    for (const key of args) {
        existsCount += database.exists(key);
    }

    return existsCount;
}

export default execute;
