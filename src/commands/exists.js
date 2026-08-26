function execute(database, args) {
    if (args.length !== 1) {
        return 'ERR wrong number of arguments for EXISTS command';
    }
    const key = args[0];
    return database.exists(key);
}

module.exports = execute