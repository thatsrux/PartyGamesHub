const https = require('https');

// Helper to fetch JSON
const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

const normalizeStr = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

const getBaseName = (str) => {
  let base = normalizeStr(str);
  
  base = base.replace(/[^a-z0-9]/g, ' ');
  base = ' ' + base + ' ';
  
  const fillerWords = [
    'f c', 'fc', 'c f', 'cf', 'football', 'futbol', 'club', 'atletico', 
    'internacional', 'de', 'association', 'a c', 'ac', 's p a', 's s', 
    'men s', 'team', 'nazionale', 'di', 'calcio', 'dell', 'national'
  ];
  
  fillerWords.forEach(word => {
    base = base.replace(new RegExp(`\\b${word}\\b`, 'gi'), ' ');
  });
  
  base = base.replace(/\s+/g, ' ').trim();
  
  const countryMap = {
    'england': 'inghilterra',
    'united kingdom': 'inghilterra',
    'regno unito': 'inghilterra',
    'spain': 'spagna',
    'italy': 'italia',
    'germany': 'germania',
    'france': 'francia',
    'brazil': 'brasile',
    'netherlands': 'olanda',
    'portugal': 'portogallo',
    'belgium': 'belgio',
    'croatia': 'croazia',
    'uruguay': 'uruguay',
    'colombia': 'colombia',
    'switzerland': 'svizzera',
    'denmark': 'danimarca',
    'sweden': 'svezia',
    'poland': 'polonia',
    'wales': 'galles',
    'scotland': 'scozia',
    'turkey': 'turchia',
    'greece': 'grecia',
    'austria': 'austria',
    'hungary': 'ungheria',
    'ireland': 'irlanda',
    'norway': 'norvegia',
    'finland': 'finlandia',
    'iceland': 'islanda',
    'united states': 'stati uniti',
    'japan': 'giappone',
    'south korea': 'corea del sud',
    'mexico': 'messico'
  };
  
  if (countryMap[base]) return countryMap[base];
  
  return base;
};

const shouldFilterOut = (str) => {
  const s = str.toLowerCase();
  if (s.includes('under-') || s.includes('under ')) return true;
  if (s.endsWith(' b') || s.endsWith(' c') || s.endsWith(' d')) return true;
  if (s.includes('juvenil') || s.includes('atletic') || s.includes('atlètic') || s.includes('primavera') || s.includes('reserves') || s.includes('academy')) return true;
  if (s === 'regno unito' || s === 'united kingdom') return true;
  return false;
};

async function run() {
  console.log('Fetching footballers from Firebase...');
  const firebaseUrl = 'https://partygames-c9dc1-default-rtdb.firebaseio.com/games_data/footballers.json';
  const footballers = await fetchJson(firebaseUrl);
  
  if (!footballers) {
    console.error('Nessun dato trovato!');
    return;
  }
  
  const updatedFootballers = footballers.map(player => {
    if (!player.clues) return player;
    
    // Step 1: Remove youth teams and unwanted clues
    let validClues = player.clues.filter(c => !shouldFilterOut(c));
    
    // Step 2: Group by base name
    const grouped = {};
    validClues.forEach(clue => {
      const base = getBaseName(clue);
      if (!base) return;
      if (!grouped[base]) {
        grouped[base] = [];
      }
      grouped[base].push(clue);
    });
    
    const finalClues = [];
    const seenBases = new Set();
    
    validClues.forEach(clue => {
      const base = getBaseName(clue);
      if (!base || seenBases.has(base)) return;
      
      seenBases.add(base);
      // Find the shortest variant for this base to keep it clean
      const variants = grouped[base];
      variants.sort((a, b) => a.length - b.length);
      finalClues.push(variants[0]);
    });
    
    return { ...player, clues: finalClues };
  });
  
  console.log(`Esempio pulito per Messi:`, updatedFootballers.find(p => p.name === 'Lionel Messi').clues);
  console.log(`Esempio pulito per Baines:`, updatedFootballers.find(p => p.name === 'Leighton Baines')?.clues);
  
  // Upload to Firebase
  console.log('Uploading cleaned data to Firebase...');
  const uploadData = JSON.stringify(updatedFootballers);
  
  const req = https.request(firebaseUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(uploadData)
    }
  }, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('Upload completato con successo!');
      } else {
        console.error("Errore durante l'upload:", res.statusCode, responseBody);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('Errore di connessione a Firebase:', e);
  });
  
  req.write(uploadData);
  req.end();
}

run().catch(console.error);
