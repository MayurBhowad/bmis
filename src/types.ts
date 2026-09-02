import type Database from './database/database';

export interface StorageEntry {
    value: string | string[];
    type: string;
}

export type CommandResult = string | number | null | string[] | undefined;

export type CommandHandler = (database: Database, args: string[]) => CommandResult;

export interface ParsedCommand {
    command: string;
    args: string[];
}
