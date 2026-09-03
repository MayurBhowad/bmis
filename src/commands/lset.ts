import Database from "../database/database";

function lset(database: Database, args: string[]): string {
    if (args.length !== 3) {
        return "ERR wrong number of arguments for 'LSET' command";
    }

    const key = args[0];
    const index = Number(args[1]);
    const value = args[2];

    if(!Number.isInteger(index)) {
        return "ERR value is not an integer or out of range";
    }

    const list = database.get(key);

    if (list === null || list === undefined) {
        return "ERR no such key";
    }

    if(!Array.isArray(list)) {
        return "WRONGTYPE Operation against a key holding the wrong kind of value";
    }

    let actualIndex = index;

    if(index < 0) {
        actualIndex = list.length + index;
    }

    if(actualIndex < 0 || actualIndex >= list.length) {
        return "ERR index out of range";
    }

    list[actualIndex] = value;

    database.set(key, list, "list");

    return "OK";
}

export default lset;