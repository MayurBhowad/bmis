class CommandExecuter {
    constructor(database) {
        this.database = database;
    }

    execute(input) {
        const parts = input.trim().split(/\s+/);
        const command = parts[0].toUpperCase();

        switch (command) {
            case 'SET': {
                const key = parts[1];
                const value = parts[2];
                return this.database.set(key, value);
            }
            case 'GET': {
                const key = parts[1];
                return this.database.get(key);
            }
            case 'DELETE': {
                const key = parts[1];
                return this.database.del(key);
            }
            case 'EXISTS': {
                const key = parts[1];
                return this.database.exists(key);
            }
            default:{
                return `ERR unknown command '${command}'`;
            }
        }
    }
}

module.exports = CommandExecuter;