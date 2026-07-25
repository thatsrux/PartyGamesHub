const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/footballers.json'));
const names = data.map((p, i) => `${i+1}. ${p.name}`);
fs.writeFileSync('lista_giocatori.txt', names.join('\n'));
console.log('File created: lista_giocatori.txt');
