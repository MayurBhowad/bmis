
const setCommand = require('./set');
const getCommand = require('./get');
const delCommand = require('./del');
const existsCommand = require('./exists');

class CommandExecuter {
    constructor(database) {
        this.database = database;
        this.commands = {
            SET: setCommand,
            GET: getCommand,
            DEL: delCommand,
            EXISTS: existsCommand
        };
    }

    execute(input) {
        const trimmedInput = input.trim();
        if (!trimmedInput) {
            return undefined;
        }
        const parts = input.trim().split(/\s+/);
        const command = parts[0].toUpperCase();

        switch (command) {
            case 'SET': {
                return this.commands.SET(this.database, parts.slice(1));
            }
            case 'GET': {
                return this.commands.GET(this.database, parts.slice(1));
            }
            case 'DEL': {
                return this.commands.DEL(this.database, parts.slice(1));
            }
            case 'EXISTS': {
                return this.commands.EXISTS(this.database, parts.slice(1));
            }
            default:{
                return `ERR unknown command '${command}'`;
            }
        }
    }
}

module.exports = CommandExecuter;