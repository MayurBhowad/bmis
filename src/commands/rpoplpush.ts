import Database from "../database/database";

function rpoplpush(database: Database, args: string[]): string | null {
    if (args.length !== 2) {
        return "ERR wrong number of arguments for RPOPLPUSH command";
    }

    const sourcekey = args[0];
    const destinationkey = args[1];

    const source = database.get(sourcekey)

    if (source === null || source == undefined) {
        return null;
    }

    if(!Array.isArray(source)) {
        return "WRONGTYPE Operation against a key holding the wrong kind of value";
    }

    const destination = database.get(destinationkey)

    if(destination !== null && destination !== undefined) {
        if(!Array.isArray(destination)) {
            return "WRONGTYPE Operation against a key holding the wrong kind of value";
        }
    }

    const value = source.pop();

    if(value === undefined) {
        return null;
    }

    if(source.length === 0) {
        database.deleteKey(sourcekey);
    } else {
        database.set(sourcekey, source, 'list');
    }

    if(destination === null || destination == undefined) {
        database.set(destinationkey, [value], 'list');
    } else {
        destination.unshift(value);
        database.set(destinationkey, destination, 'list');
    }
    
    return value ?? null;
}

export default rpoplpush;