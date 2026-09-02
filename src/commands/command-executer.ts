import parse from './parser';
import commands from './commands';
import Database from '../database/database';
import { CommandResult } from '../types';

class CommandExecuter {
    database: Database;

    constructor(database: Database) {
        this.database = database;
    }

    execute(input: string): CommandResult {
        const parsed = parse(input);

        if(!parsed) {
            return undefined;
        }

        const { command, args } = parsed;

        const commandHandler = commands[command];
        
        if(!commandHandler) {
            return `ERR unknown command '${command}'`;
        }

        return commandHandler(this.database, args);
    }
}

export default CommandExecuter;
