
const setCommand = require('./set');
const getCommand = require('./get');
const delCommand = require('./del');
const existsCommand = require('./exists');
const expireCommand = require('./expire');
const ttlCommand = require('./ttl');
const typeCommand = require('./type');

class CommandExecuter {
    constructor(database) {
        this.database = database;
        this.commands = {
            SET: setCommand,
            GET: getCommand,
            DEL: delCommand,
            EXISTS: existsCommand,
            EXPIRE: expireCommand,
            TTL: ttlCommand,
            TYPE: typeCommand
        };
    }

    execute(input) {
        const trimmedInput = input.trim();

        // If the input is empty, return undefined
        if (!trimmedInput) {
            return undefined;
        }

        const parts = input.trim().split(/\s+/);
        const commandName = parts[0].toUpperCase();
        const args = parts.slice(1);

        const command = this.commands[commandName];

        // Unknown command
        if (!command) {
            return `ERR unknown command '${commandName}'`;
        }

        return command(this.database, args);
    }
}

module.exports = CommandExecuter;