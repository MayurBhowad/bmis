const readline = require('readline');
const Database = require('./database/database');
const CommandExecuter = require('./commands/command-executer');

const db = new Database();
const CE = new CommandExecuter(db);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'BMis> '
});
console.log('Welcome to BMis CLI');
console.log('Type commands like: SET name Mayur');
rl.prompt();
rl.on('line', (input) => {
    const result = CE.execute(input);
    if (result !== null) {
        console.log(result);
    }
    rl.prompt();
})