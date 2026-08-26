function execute(database, args) {
    if (args.length !== 1) {
        return 'ERR wrong number of arguments for GET command';
    }
    const key = args[0];
    return database.get(key);
}

module.exports = execute