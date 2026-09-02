import Database from '../database/database';
import { CommandResult } from '../types';

function execute(database: Database, args: string[]): CommandResult {
    if (args.length < 1) {
        return 'ERR wrong number of arguments for DEL command';
    }

    let deletedCount = 0;

    for (const key of args) {
        deletedCount += database.del(key);
    }

    return deletedCount;
}

export default execute;
