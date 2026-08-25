const Database = require('./database/database');

const db = new Database();

console.log(db.set('name', 'Mayur'));
console.log(db.get('name'));