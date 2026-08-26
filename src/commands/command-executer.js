
class CommandExecuter {
    constructor(database) {
        this.database = database;
        this.commands = {
            SET: require('./set'),
            GET: require('./get'),
            DEL: require('./del'),
            EXISTS: require('./exists')
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