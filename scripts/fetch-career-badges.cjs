const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('src/data/footballers.json', 'utf8'));
const teams = [...new Map(data.players.flatMap((player) => player.teams).map((team) => [team.teamId, team.name])).entries()];
const outputDir = path.resolve('public/team-badges');
fs.mkdirSync(outputDir, { recursive: true });

const queries = {
  'alessandria': 'US Alessandria', 'al-hilal': 'Al Hilal SFC', 'al-nassr': 'Al Nassr', 'amburgo': 'Hamburg', 'barcellona': 'Barcelona',
  'basilea': 'FC Basel', 'bayern-monaco': 'Bayern Munich', 'borussia-m-gladbach': 'Borussia Monchengladbach',
  'd-c-united': 'DC United', 'dinamo-mosca': 'Dynamo Moscow', 'dinamo-zagabria': 'Dinamo Zagreb',
  'ft-lauderdale-strikers': 'Fort Lauderdale Strikers', 'honved': 'Budapest Honved', 'inter': 'Inter Milan',
  'lilla': 'Lille', 'manchester-utd': 'Manchester United', 'milan': 'AC Milan', 'n-y-cosmos': 'New York Cosmos',
  'n-y-red-bulls': 'New York Red Bulls', 'nacional': 'Club Nacional de Football', 'newcastle-utd': 'Newcastle United',
  'olympique-lione': 'Lyon', 'olympique-marsiglia': 'Marseille', 'paris-saint-germain': 'Paris Saint Germain',
  'saint-etienne': 'Saint Etienne', 'salisburgo': 'Red Bull Salzburg', 'san-paolo': 'Sao Paulo', 'siviglia': 'Sevilla',
  'sparta-praga': 'Sparta Prague', 'sporting-lisbona': 'Sporting CP', 'stoccarda': 'VfB Stuttgart',
  'leeds-utd': 'Leeds United', 'werder-brema': 'Werder Bremen', 'west-ham-utd': 'West Ham United',
};

const supplementalSources = {
  'dinamo-mosca': 'https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/Russia%20-%20Premier%20Liga/Dynamo%20Moscow.png',
  'colo-colo': 'https://upload.wikimedia.org/wikipedia/commons/d/d9/600px_Colo_Colo.png',
  'ft-lauderdale-strikers': 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Fort_Lauderdale_Strikers_wordmark_stacked.svg',
  'al-sadd': 'https://tmssl.akamaized.net/images/wappen/head/656.png',
  'dinamo-kiev': 'https://tmssl.akamaized.net/images/wappen/head/338.png',
  'al-rayyan': 'https://tmssl.akamaized.net//images/wappen/head/3229.png?lm=1728899512',
  'scunthorpe-utd': 'https://a.espncdn.com/i/teamlogos/soccer/500/313.png',
  'zwolle': 'https://tmssl.akamaized.net/images/wappen/head/1269.png',
  'al-gharafa': 'https://tmssl.akamaized.net//images/wappen/head/6297.png?lm=1694632253',
  'norimberga': 'https://tmssl.akamaized.net/images/wappen/head/4.png',
  'rb-lipsia': 'https://tmssl.akamaized.net//images/wappen/head/23826.png?lm=1619431624',
  'olimpija-lubiana': 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Olimpija%20Logo%20BrightGreen-White%20RGB-1-1.svg',
  'beira-mar': 'https://a.espncdn.com/i/teamlogos/soccer/500/12215.png',
  'nizza': 'https://tmssl.akamaized.net/images/wappen/head/417.png',
  'nottingham-forest': 'https://raw.githubusercontent.com/luukhopman/football-logos/master/logos/England%20-%20Premier%20League/Nottingham%20Forest.png',
  'maiorca': 'https://a.espncdn.com/i/teamlogos/soccer/500/84.png',
  'al-arabi': 'https://tmssl.akamaized.net//images/wappen/head/1230.png?lm=1728989970',
};

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const initials = (name) => name.split(/[\s.'-]+/).filter(Boolean).slice(0, 3).map((part) => part[0]).join('').toUpperCase();
const colorFor = (name) => {
  let hash = 0;
  for (const character of name) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return `hsl(${Math.abs(hash) % 360} 68% 38%)`;
};

function fallbackSvg(name) {
  const letters = initials(name).replace(/&/g, '&amp;');
  const color = colorFor(name);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 180"><path d="M80 5 148 29v55c0 44-27 75-68 91C39 159 12 128 12 84V29Z" fill="${color}" stroke="#fff" stroke-width="8"/><path d="M27 42h106v38c0 32-18 57-53 74-35-17-53-42-53-74Z" fill="#071a16" opacity=".35"/><text x="80" y="104" text-anchor="middle" font-family="Arial,sans-serif" font-size="46" font-weight="900" fill="#fff">${letters}</text></svg>`;
}

async function fetchWithRetry(url, attempts = 4) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const response = await fetch(url, { headers: { 'User-Agent': 'PartyHub-CareerDataset/2.0' } });
    if (response.status === 429) {
      await delay(15000 * attempt);
      continue;
    }
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response;
  }
  throw new Error('rate limit persistente');
}

(async () => {
  const manifest = {};
  const missing = [];
  let supplemental = 0;
  let completed = 0;

  for (const [teamId, name] of teams) {
    const search = queries[teamId] || name;
    if (supplementalSources[teamId]) {
      try {
        const extension = supplementalSources[teamId].includes('.svg') ? 'svg' : 'png';
        const assetResponse = await fetchWithRetry(supplementalSources[teamId]);
        fs.writeFileSync(path.join(outputDir, `${teamId}.${extension}`), Buffer.from(await assetResponse.arrayBuffer()));
        manifest[teamId] = `/team-badges/${teamId}.${extension}`;
        supplemental += 1;
        completed += 1;
        continue;
      } catch {
        // Continua con TheSportsDB e infine con il crest locale.
      }
    }
    const existingPng = path.join(outputDir, `${teamId}.png`);
    if (fs.existsSync(existingPng)) {
      manifest[teamId] = `/team-badges/${teamId}.png`;
      completed += 1;
      continue;
    }
    try {
      const endpoint = `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${encodeURIComponent(search)}`;
      const response = await fetchWithRetry(endpoint);
      const payload = await response.json();
      const soccerTeams = (payload.teams || []).filter((team) => team.strSport === 'Soccer');
      const selected = soccerTeams.find((team) => team.strBadge) || null;
      if (selected?.strBadge) {
        const imageResponse = await fetchWithRetry(`${selected.strBadge}/small`);
        const destination = path.join(outputDir, `${teamId}.png`);
        fs.writeFileSync(destination, Buffer.from(await imageResponse.arrayBuffer()));
        manifest[teamId] = `/team-badges/${teamId}.png`;
      } else {
        throw new Error('badge non trovato');
      }
    } catch (error) {
      const destination = path.join(outputDir, `${teamId}.svg`);
      fs.writeFileSync(destination, fallbackSvg(name));
      manifest[teamId] = `/team-badges/${teamId}.svg`;
      missing.push({ teamId, name, reason: error.message });
    }
    completed += 1;
    if (completed % 10 === 0) console.log(`${completed}/${teams.length} badge elaborati`);
    await delay(2100);
  }

  fs.writeFileSync('src/data/teamBadges.json', `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync('scripts/career-badge-report.json', `${JSON.stringify({ total: teams.length, theSportsDb: teams.length - missing.length - supplemental, supplemental, fallback: missing }, null, 2)}\n`);
  console.log(`Completato: ${teams.length - missing.length - supplemental} badge da TheSportsDB, ${supplemental} supplementari, ${missing.length} fallback locali.`);
})();
