import Database from "../database/database";

function ltrim(database: Database, args: string[]): string {
    if (args.length !== 3) {
        return "ERR wrong number of arguments for LTRIM command";
    }

    const key = args[0];
    const start = Number(args[1]);
    const stop = Number(args[2]);

    if(!Number.isInteger(start) || !Number.isInteger(stop)) {
        return "ERR value is not an integer or out of range";
    }

    const list = database.get(key);

    if(list === null || list === undefined) {
        return "OK";
    }

    if(!Array.isArray(list)) {
        return "WRONGTYPE Operation against a key holding the wrong kind of value";
    }

    let actualStart = start;
    let actualStop = stop;

    if(actualStart < 0) {
        actualStart = list.length + actualStart;
    }

    if(actualStop < 0) {
        actualStop = list.length + actualStop;
    }

    if(actualStart < 0) {
        actualStart = 0;
    }

    if(actualStop >= list.length) {
        actualStop = list.length - 1;
    }

    if(actualStart > actualStop || actualStart >= list.length) {
        database.del(key);
        return "OK";
    }

    const trimmedList = list.slice(actualStart, actualStop + 1);

    database.set(key, trimmedList, 'list');

    return "OK";
}

export default ltrim;