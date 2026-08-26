class CommandExecuter {
    constructor(database) {
        this.database = database;
    }

    execute(input) {
        const trimmedInput = input.trim();
        if (!trimmedInput) {
            return null;
        }
        const parts = input.trim().split(/\s+/);
        const command = parts[0].toUpperCase();

        switch (command) {
            case 'SET': {
                if (parts.length <3) {
                    return 'ERR wrong number of arguments for SET command';
                }
                const key = parts[1];
                // Everything after the key is the value
                const value = parts.slice(2).join(' ');
                return this.database.set(key, value);
            }
            case 'GET': {
                if (parts.length !== 2) {
                    return 'ERR wrong number of arguments for GET command';
                }
                const key = parts[1];
                return this.database.get(key);
            }
            case 'DEL': {
                if (parts.length !== 2) {
                    return 'ERR wrong number of arguments for DEL command';
                }
                const key = parts[1];
                return this.database.del(key);
            }
            case 'EXISTS': {
                if (parts.length !== 2) {
                    return 'ERR wrong number of arguments for EXISTS command';
                }
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