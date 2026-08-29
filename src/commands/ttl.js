function execute(database, args) {
    if(args.length !== 1) {
        return "ERR wrong number of arguments for TTL command";
    }
    const key = args[0];
    return database.ttl(key);
}

module.exports = execute;