import Database from "../database/database";

function lpos(database: Database, args: string[]): number | number[] | null | string {
    if (args.length !== 2 && args.length !== 4 && args.length !== 6) {
        return 'ERR wrong number of arguments for LPOS command';
    }

    const key = args[0];
    const element = args[1];

    let rank = 1;
    let count: number | null = null;

    if (args.length >= 4) {
        for (let index = 2; index < args.length; index += 2) {
            const option = args[index].toUpperCase();
            const value = args[index + 1];

            if (option === 'RANK') {
                rank = Number(value);

                if (!Number.isInteger(rank) || rank === 0) {
                    return 'ERR value is not an integer or out of range';
                }
            } else if (option === 'COUNT') {
                count = Number(value);

                if (!Number.isInteger(count)) {
                    return 'ERR value is not an integer or out of range';
                }

                if (count < 0) {
                    return 'ERR count should be > 0';
                }
            } else {
                return 'ERR syntax error';
            }
        }
    }

    const list = database.get(key);

    if(list === null || list === undefined) {
        return null;
    }

    if(!Array.isArray(list)) {
        return "WRONGTYPE Operation against a key holding the wrong kind of value";
    }

    if (count !== null) {
        const indexes: number[] = [];
    
        if (rank > 0) {
            let occurrence = 0;
    
            for (let index = 0; index < list.length; index++) {
                if (list[index] === element) {
                    occurrence++;
    
                    if (occurrence < rank) {
                        continue;
                    }
    
                    indexes.push(index);
    
                    if (indexes.length === count) {
                        break;
                    }
                }
            }
        } else {
            let occurrence = 0;
    
            for (let index = list.length - 1; index >= 0; index--) {
                if (list[index] === element) {
                    occurrence++;
    
                    if (occurrence < Math.abs(rank)) {
                        continue;
                    }
    
                    indexes.push(index);
    
                    if (indexes.length === count) {
                        break;
                    }
                }
            }
        }
    
        return indexes;
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