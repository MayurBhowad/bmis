import { ParsedCommand } from '../types';

function parse(input: string): ParsedCommand | undefined {
    const trimmedInput = input.trim();

    if(!trimmedInput) {
        return undefined;
    }

    const parts = trimmedInput.split(/\s+/);

    return {
        command: parts[0].toUpperCase(),
        args: parts.slice(1),
    };
}

export default parse;
