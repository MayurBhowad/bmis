function incr(database, args) {
    if(args.length !== 1) {
        return 'ERR wrong number of arguments for \'INCR\' command';
    }

    const key = args[0];
    const value = database.get(key);

    if(value === null) {
        database.set(key, "1");
        return 1;
    }

    if(!/^-?\d+$/.test(value)) {
        return 'ERR value is not an integer or out of range';
    }

    const newValue = Number(value) + 1;

    database.set(key, String(newValue));
    return newValue;
}

module.exports = incr;