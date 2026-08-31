const parse = require('./parser');
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
        const parsed = parse(input);

        if(!parsed) {
            return undefined;
        }

        const { command, args } = parsed;

        const commandHandler = this.commands[command];
        
        if(!commandHandler) {
            return `ERR unknown command '${command}'`;
        }

        return commandHandler(this.database, args);
    }
}

module.exports = CommandExecuter;