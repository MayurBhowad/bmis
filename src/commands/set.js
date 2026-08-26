function execute(database, args) {
    if (args.length < 2) {
        return 'ERR wrong number of arguments for SET command';
    }
    const key = args[0];
    const value = args.slice(1).join(' ');
    return database.set(key, value);
}

module.exports = execute