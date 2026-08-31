const parse = require('./parser');
const commands = require('./commands');

class CommandExecuter {
    constructor(database) {
        this.database = database;
    }

    execute(input) {
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

module.exports = CommandExecuter;