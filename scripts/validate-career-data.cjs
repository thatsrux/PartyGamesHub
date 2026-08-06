const fs = require('fs');
const path = require('path');

const database = JSON.parse(fs.readFileSync('src/data/footballers.json', 'utf8'));
const badges = JSON.parse(fs.readFileSync('src/data/teamBadges.json', 'utf8'));
const badgeReport = JSON.parse(fs.readFileSync('scripts/career-badge-report.json', 'utf8'));
const errors = [];
const playerIds = new Set();
const playerNames = new Set();
const usedTeams = new Set();
const playableSignatures = new Map();

if (database.version !== 3) errors.push('Versione database diversa da 3.');
if (!database.source?.url || !database.source?.policy) errors.push('Metadati della fonte mancanti.');
if (!Array.isArray(database.players) || database.players.length < 202) errors.push('Il catalogo deve contenere almeno 202 giocatori curati.');

for (const player of database.players || []) {
  if (playerIds.has(player.id)) errors.push(`ID giocatore duplicato: ${player.id}`);
  if (playerNames.has(player.name)) errors.push(`Nome giocatore duplicato: ${player.name}`);
  playerIds.add(player.id);
  playerNames.add(player.name);
  if (!['icone', 'campioni'].includes(player.tier)) errors.push(`Tier non valido: ${player.name}`);
  if (!Array.isArray(player.teams) || player.teams.length < 1 || player.teams.length > 12) errors.push(`Numero tappe non valido: ${player.name}`);
  for (const [index, team] of (player.teams || []).entries()) {
    usedTeams.add(team.teamId);
    if (!team.name || !/^\d{4}(?:-\d{0,4})?$/.test(team.years)) errors.push(`Tappa non valida per ${player.name}: ${JSON.stringify(team)}`);
    if (index > 0 && player.teams[index - 1].teamId === team.teamId) errors.push(`Tappe adiacenti duplicate per ${player.name}: ${team.teamId}`);
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
if (badgeReport.total !== usedTeams.size || badgeReport.fallback?.length) errors.push('Il report badge contiene fallback o non è allineato al database.');
if (JSON.stringify(database).includes('wikipedia.org')) errors.push('Il database contiene ancora URL Wikipedia.');

const requiredSequences = {
  'zlatan-ibrahimovic': ['malmo-ff', 'ajax', 'juventus', 'inter', 'barcellona', 'milan', 'paris-saint-germain', 'manchester-utd', 'la-galaxy', 'milan'],
  'gerard-pique': ['manchester-utd', 'real-zaragoza', 'manchester-utd', 'barcellona'],
};
for (const [playerId, sequence] of Object.entries(requiredSequences)) {
  const actual = database.players.find((player) => player.id === playerId)?.teams.map((team) => team.teamId);
  if (JSON.stringify(actual) !== JSON.stringify(sequence)) errors.push(`Carriera regressa per ${playerId}: ${JSON.stringify(actual)}.`);
}

const requiredClubs = {
  'david-beckham': ['manchester-utd', 'preston', 'real-madrid', 'la-galaxy', 'milan', 'paris-saint-germain'],
  'luis-suarez': ['nacional', 'groningen', 'ajax', 'liverpool', 'barcellona', 'atletico-madrid', 'gremio', 'inter-miami'],
  'luka-modric': ['dinamo-zagabria', 'zrinjski-mostar', 'inter-zapresic', 'tottenham', 'real-madrid', 'milan'],
  'andres-iniesta': ['barcellona', 'vissel-kobe', 'emirates-club'],
  'robert-lewandowski': ['znicz-pruszkow', 'lech-poznan', 'borussia-dortmund', 'bayern-monaco', 'barcellona', 'chicago-fire'],
  'mohamed-salah': ['el-mokawloon', 'basilea', 'chelsea', 'fiorentina', 'roma', 'liverpool'],
  'erling-haaland': ['bryne', 'molde', 'salisburgo', 'borussia-dortmund', 'manchester-city'],
  'kevin-de-bruyne': ['genk', 'chelsea', 'werder-brema', 'wolfsburg', 'manchester-city', 'napoli'],
};
for (const [playerId, clubs] of Object.entries(requiredClubs)) {
  const actual = database.players.find((player) => player.id === playerId)?.teams.map((team) => team.teamId) || [];
  let cursor = -1;
  for (const club of clubs) {
    cursor = actual.indexOf(club, cursor + 1);
    if (cursor < 0) {
      errors.push(`Tappa obbligatoria mancante o fuori ordine per ${playerId}: ${club}.`);
      break;
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

const playable = database.players.filter((player) => player.teams.length >= 2);
console.log(`Database valido: ${database.players.length} giocatori (${playable.length} giocabili), ${usedTeams.size} squadre, ${Object.keys(badges).length} badge locali.`);
