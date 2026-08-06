const fs = require('fs');
const path = require('path');

const database = JSON.parse(fs.readFileSync('src/data/footballers.json', 'utf8'));
const badges = JSON.parse(fs.readFileSync('src/data/teamBadges.json', 'utf8'));
const errors = [];
const playerIds = new Set();
const playerNames = new Set();
const usedTeams = new Set();
const playableSignatures = new Map();

if (database.version !== 2) errors.push('Versione database diversa da 2.');
if (!Array.isArray(database.players) || database.players.length < 140) errors.push('Il catalogo deve contenere almeno 140 giocatori curati.');

for (const player of database.players || []) {
  if (playerIds.has(player.id)) errors.push(`ID giocatore duplicato: ${player.id}`);
  if (playerNames.has(player.name)) errors.push(`Nome giocatore duplicato: ${player.name}`);
  playerIds.add(player.id);
  playerNames.add(player.name);
  if (!['icone', 'campioni'].includes(player.tier)) errors.push(`Tier non valido: ${player.name}`);
  if (!Array.isArray(player.teams) || player.teams.length < 1 || player.teams.length > 7) errors.push(`Numero tappe non valido: ${player.name}`);
  for (const team of player.teams || []) {
    usedTeams.add(team.teamId);
    if (!team.name || !/^\d{4}(?:-\d{0,4})?$/.test(team.years)) errors.push(`Tappa non valida per ${player.name}: ${JSON.stringify(team)}`);
  }
  if (player.teams?.length >= 2) {
    const signature = player.teams.map((team) => team.teamId).join('|');
    if (playableSignatures.has(signature)) errors.push(`Carriera ambigua: ${player.name} e ${playableSignatures.get(signature)}.`);
    playableSignatures.set(signature, player.name);
  }
}

for (const teamId of usedTeams) {
  const publicPath = badges[teamId];
  if (!publicPath) {
    errors.push(`Badge mancante nel manifest: ${teamId}`);
    continue;
  }
  const assetPath = path.resolve('public', publicPath.replace(/^\//, ''));
  if (!fs.existsSync(assetPath) || fs.statSync(assetPath).size < 100) errors.push(`File badge mancante o vuoto: ${teamId}`);
}

if (Object.keys(badges).length !== usedTeams.size) errors.push(`Manifest badge non allineato: ${Object.keys(badges).length} voci per ${usedTeams.size} squadre.`);
if (JSON.stringify(database).includes('wikipedia.org')) errors.push('Il database contiene ancora URL Wikipedia.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const playable = database.players.filter((player) => player.teams.length >= 2);
console.log(`Database valido: ${database.players.length} giocatori (${playable.length} giocabili), ${usedTeams.size} squadre, ${Object.keys(badges).length} badge locali.`);
