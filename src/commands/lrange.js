function lrange(database, args) {
    if (args.length < 3) {
        return 'ERR wrong number of arguments for LRANGE command';
    }

    const key = args[0];
    const start = Number(args[1]);
    const stop = Number(args[2]);

    if (!Number.isInteger(start) || !Number.isInteger(stop)) {
        return 'ERR value is not an integer or out of range';
    }

    let list = database.get(key);

    if (list === null) {
        return [];
    }

    if(!Array.isArray(list)) {
        return 'WRONGTYPE Operation against a key holding the wrong kind of value';
    }

    const length = list.length;

    let normalizedStart = start;
    let normalizedStop = stop;

    //Negative index counts from the end of the list
    if (normalizedStart < 0) {
        normalizedStart = length + normalizedStart;
    }

    if (normalizedStop < 0) {
        normalizedStop = length + normalizedStop;
    }

    if (normalizedStart > normalizedStop || normalizedStart >= length) { 
        return [];
    }

    return list.slice(normalizedStart, normalizedStop + 1);
}

module.exports = lrange;