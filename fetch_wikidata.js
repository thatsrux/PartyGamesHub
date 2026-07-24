
import fs from 'fs';

async function runSparql(query) {
  const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'PartyHubApp/1.0 (test@example.com)'
    }
  });
  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }
  return res.json();
}

async function run() {
  console.log("Fetching top players...");
  const playersQuery = `
    SELECT ?player ?playerLabel ?countryLabel WHERE {
      ?player wdt:P106 wd:Q937857;
              wdt:P27 ?country;
              wikibase:sitelinks ?sitelinks.
      FILTER(?sitelinks > 45)
      SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
    }
    ORDER BY DESC(?sitelinks)
    LIMIT 1000
  `;
  
  const playersData = await runSparql(playersQuery);
  const players = {};
  const playerIds = [];
  
  playersData.results.bindings.forEach(b => {
    let name = b.playerLabel.value;
    let country = b.countryLabel ? b.countryLabel.value : "Sconosciuto";
    const id = b.player.value.split('/').pop();
    
    // Fix weird country names
    if (country.includes('Kingdom of the Netherlands')) country = 'Paesi Bassi';
    
    // Filter out names without spaces (e.g. "Pelé", "Ronaldinho", "Ronaldo") as requested
    if (!name.includes(" ")) return;
    if (name.startsWith("Q") && /\d+/.test(name)) return;
    
    players[id] = { id, name, country, teams: [] };
    playerIds.push(id);
  });
  
  console.log(`Found ${playerIds.length} valid players. Fetching teams...`);
  
  // Batch process teams
  const batchSize = 50;
  for (let i = 0; i < playerIds.length; i += batchSize) {
    const batch = playerIds.slice(i, i + batchSize);
    const values = batch.map(id => `wd:${id}`).join(' ');
    
    console.log(`Fetching batch ${i/batchSize + 1} / ${Math.ceil(playerIds.length/batchSize)}`);
    
    const teamsQuery = `
      SELECT ?player ?teamLabel ?startTime WHERE {
        VALUES ?player { ${values} }
        ?player p:P54 ?teamStatement.
        ?teamStatement ps:P54 ?team.
        OPTIONAL { ?teamStatement pq:P580 ?startTime. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
        ?team rdfs:label ?teamLabel.
        FILTER(LANG(?teamLabel) = "it" || LANG(?teamLabel) = "en")
      }
    `;
    
    try {
      const teamsData = await runSparql(teamsQuery);
      teamsData.results.bindings.forEach(b => {
        const id = b.player.value.split('/').pop();
        const team = b.teamLabel.value;
        const startTime = b.startTime ? new Date(b.startTime.value).getTime() : 0;
        
        if (team.startsWith("Q") && /\d+/.test(team)) return;
        
        if (players[id]) {
          players[id].teams.push({ team, startTime });
        }
      });
    } catch(e) {
      console.log(`Batch ${i/batchSize + 1} failed: ${e.message}`);
    }
  }
  
  const finalData = [];
  
  for (const id in players) {
    const p = players[id];
    if (p.teams.length === 0) continue;
    
    p.teams.sort((a, b) => a.startTime - b.startTime);
    
    const uniqueTeams = [];
    p.teams.forEach(t => {
        if (uniqueTeams.length === 0 || uniqueTeams[uniqueTeams.length - 1] !== t.team) {
            uniqueTeams.push(t.team);
        }
    });
    
    if (uniqueTeams.length >= 2) {
      finalData.push({
        name: p.name,
        clues: [p.country, ...uniqueTeams]
      });
    }
  }
  
  console.log(`Trovati ${finalData.length} calciatori completi validi.`);
  
  fs.writeFileSync('./src/data/footballers.json', JSON.stringify(finalData, null, 2));
  console.log("Written to src/data/footballers.json");
}

run();
