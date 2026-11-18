
import Database from '../database/database';
import { CommandResult } from '../types';

function scan(database: Database, args: string[]): CommandResult {
    if (args.length !== 3) {
        return 'ERR wrong number of arguments for SCAN command';
    }

    const [cursor, option, countValue] = args;

    if (option.toUpperCase() !== 'COUNT') {
        return 'ERR syntax error';
    }

    if (!/^(0|[1-9]\d*)$/.test(cursor) ||
        !Number.isSafeInteger(Number(cursor))) {
        return 'ERR invalid cursor';
    }

    if (!/^\d+$/.test(countValue)) {
        return 'ERR value is not an integer or out of range';
    }

    const count = Number(countValue);

    if (!Number.isSafeInteger(count)) {
        return 'ERR value is not an integer or out of range';
    }

    if (count < 1) {
        return 'ERR count should be > 0';
    }

    if (count > 100) {
        return 'ERR COUNT exceeds maximum allowed value of 100';
    }

    return database.scan(cursor, count);
}

export default scan;
