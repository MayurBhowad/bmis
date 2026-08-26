function execute(database, args) {
    if (args.length !== 1) {
        return 'ERR wrong number of arguments for DEL command';
    }
    const key = args[0];
    return database.del(key);
}

module.exports = execute