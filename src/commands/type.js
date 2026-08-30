module.exports = function type(database, args) {
    if(args.length !== 1) {
        return "ERR wrong number of arguments for TYPE command";
    }
    return database.type(args[0]);
};