const Database = require('./database/database');
const CommandExecuter = require('./commands/command-executer');

const db = new Database();
const CE = new CommandExecuter(db);

console.log(CE.execute('SET name Mayur'));
console.log(CE.execute('EXISTS name'));
console.log(CE.execute('DELETE name'));
console.log(CE.execute('EXISTS name'));
console.log(CE.execute('GET name'));