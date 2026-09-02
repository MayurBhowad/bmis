import Database from '../database/database';
import { CommandResult } from '../types';

function execute(database: Database, args: string[]): CommandResult {
    if (args.length < 2) {
        return 'ERR wrong number of arguments for SET command';
    }
    const key = args[0];
    let value: string;
    let expireSeconds: number | null = null;

    const exIndex = args.findIndex((arg, index) => index > 0 && arg.toUpperCase() === 'EX');

    if(exIndex !== -1) {
        if(exIndex !== args.length - 2) {
            return "ERR syntax error";
        }

        const seconds = args[exIndex + 1];

        if(!/^\d+$/.test(seconds)) {
            return "ERR invalid expire time in 'SET' command";
        }

        expireSeconds = Number(seconds);
        value = args.slice(1, exIndex).join(' ');
    } else {
        value = args.slice(1).join(' ');
    }

    database.set(key, value);

    if(expireSeconds !== null) {
        database.expireAt(key, Date.now() + expireSeconds * 1000);
    }

    return "OK";
}

export default execute;
