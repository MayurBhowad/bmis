import Database from "../database/database";

function lpos(database: Database, args: string[]): number | null | string {
    if(args.length !== 2) {
        return "ERR wrong number of arguments for LPOS command";
    }

    const key = args[0];
    const element = args[1];

    const list = database.get(key);

    if(list === null || list === undefined) {
        return null;
    }

    if(!Array.isArray(list)) {
        return "WRONGTYPE Operation against a key holding the wrong kind of value";
    }

    const index = list.indexOf(element);

    if(index === -1) {
        return null;
    }

    return index;
}

export default lpos;