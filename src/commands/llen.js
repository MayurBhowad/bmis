function llen(database, args) {
    if(args.length !== 1) {
        return "ERR wrong number of arguments for 'LLEN' command";
    }

    const key = args[0];
    const list = database.get(key);

    if(list  === null) {
        return 0;
    }

    if(!Array.isArray(list)) {
        return "WRONGTYPE Operation against a key holding the wrong kind of value";
    }

    return list.length;
}

module.exports = llen;