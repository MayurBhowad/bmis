function execute(database, args) {
    if (args.length !== 2) {
        return 'ERR wrong number of arguments for EXPIRE command';
    }

    const key = args[0];
    const seconds = Number(args[1]);

    if (!Number.isInteger(seconds)) {
        return 'ERR value is not an integer or out of range';
    }

    const timestamp = Date.now() + seconds * 1000;

    return database.expireAt(key, timestamp);
}

module.exports = execute;