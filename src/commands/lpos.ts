import Database from "../database/database";

function lpos(database: Database, args: string[]): number | null | string {
    if(args.length !== 2 && args.length !== 4) {
        return "ERR wrong number of arguments for LPOS command";
    }

    const key = args[0];
    const element = args[1];

    let rank = 1;

    if (args.length === 4) {
        if (args[2].toUpperCase() !== 'RANK') {
            return 'ERR syntax error';
        }

        rank = Number(args[3]);

        if (!Number.isInteger(rank) || rank === 0) {
            return 'ERR value is not an integer or out of range';
        }
    }

    const list = database.get(key);

    if(list === null || list === undefined) {
        return null;
    }

    if(!Array.isArray(list)) {
        return "WRONGTYPE Operation against a key holding the wrong kind of value";
    }

    if (rank > 0) {
        let occurrence = 0;
    
        for (let index = 0; index < list.length; index++) {
            if (list[index] === element) {
                occurrence++;
    
                if (occurrence === rank) {
                    return index;
                }
            }
        }
    } else {
        let occurrence = 0;
    
        for (let index = list.length - 1; index >= 0; index--) {
            if (list[index] === element) {
                occurrence++;
    
                if (occurrence === Math.abs(rank)) {
                    return index;
                }
            }
        }
    }
    
    return null;
}

export default lpos;