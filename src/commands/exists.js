function execute(database, args) {
    if (args.length < 1) {
        return 'ERR wrong number of arguments for EXISTS command';
    }

    let existsCount = 0;

    for (const key of args) {
        existsCount += database.exists(key);
    }

    return existsCount;
}

module.exports = execute