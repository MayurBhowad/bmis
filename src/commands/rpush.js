function rpush(database, args) {
    if (args.length < 2) {
        return 'ERR wrong number of arguments for RPUSH command';
    }

    const key = args[0];   
    const values = args.slice(1);

    let entry = database.storage.get(key);

    if (entry === undefined) {
        entry = {
            value: [],
            type: 'list',
        }
    }

    if (entry.type !== 'list') {
        return 'WRONGTYPE Operation against a key holding the wrong kind of value';
    }

    entry.value.push(...values);

    database.storage.set(key, entry);

    return entry.value.length;
}

module.exports = rpush;