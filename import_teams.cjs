const https = require('https');

// Helper to fetch JSON
const fetchJson = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

// Map of National Teams with ISO codes for flagcdn
const nationalTeams = [
  { name: 'Italia', code: 'it' }, { name: 'Brasile', code: 'br' }, { name: 'Argentina', code: 'ar' },
  { name: 'Francia', code: 'fr' }, { name: 'Germania', code: 'de' }, { name: 'Spagna', code: 'es' },
  { name: 'Inghilterra', code: 'gb-eng' }, { name: 'Portogallo', code: 'pt' }, { name: 'Olanda', code: 'nl' },
  { name: 'Belgio', code: 'be' }, { name: 'Croazia', code: 'hr' }, { name: 'Uruguay', code: 'uy' },
  { name: 'Colombia', code: 'co' }, { name: 'Senegal', code: 'sn' }, { name: 'Marocco', code: 'ma' },
  { name: 'Giappone', code: 'jp' }, { name: 'Corea del Sud', code: 'kr' }, { name: 'Stati Uniti', code: 'us' },
  { name: 'Messico', code: 'mx' }, { name: 'Svizzera', code: 'ch' }, { name: 'Danimarca', code: 'dk' },
  { name: 'Svezia', code: 'se' }, { name: 'Polonia', code: 'pl' }, { name: 'Cile', code: 'cl' },
  { name: 'Galles', code: 'gb-wls' }, { name: 'Scozia', code: 'gb-sct' }, { name: 'Nigeria', code: 'ng' },
  { name: 'Egitto', code: 'eg' }, { name: 'Camerun', code: 'cm' }, { name: 'Costa d\'Avorio', code: 'ci' },
  { name: 'Turchia', code: 'tr' }, { name: 'Grecia', code: 'gr' }, { name: 'Repubblica Ceca', code: 'cz' },
  { name: 'Austria', code: 'at' }, { name: 'Ungheria', code: 'hu' }, { name: 'Serbia', code: 'rs' },
  { name: 'Irlanda', code: 'ie' }, { name: 'Norvegia', code: 'no' }, { name: 'Finlandia', code: 'fi' },
  { name: 'Islanda', code: 'is' }, { name: 'Canada', code: 'ca' }, { name: 'Australia', code: 'au' },
  { name: 'Nuova Zelanda', code: 'nz' }, { name: 'Perù', code: 'pe' }, { name: 'Ecuador', code: 'ec' },
  { name: 'Paraguay', code: 'py' }, { name: 'Bolivia', code: 'bo' }, { name: 'Venezuela', code: 've' }
];

async function run() {
  console.log('Fetching GitHub tree for luukhopman/football-logos...');
  
  const treeUrl = 'https://api.github.com/repos/luukhopman/football-logos/git/trees/master?recursive=1';
  const treeOptions = {
    headers: { 'User-Agent': 'Node.js Import Script' }
  };
  
  const treeData = await fetchJson(treeUrl, treeOptions);
  if (!treeData.tree) {
    throw new Error('Failed to fetch tree');
  }

  const pngs = treeData.tree.filter(t => t.path.startsWith('logos/') && t.path.endsWith('.png'));
  console.log(`Trovati ${pngs.length} loghi di club!`);

  const teams = [];
  
  // 1. Aggiungi i Club
  for (const item of pngs) {
    const pathParts = item.path.split('/');
    // e.g. logos/Italy - Serie A/Juventus.png
    if (pathParts.length >= 3) {
      const folderName = pathParts[1]; // Italy - Serie A
      const fileName = pathParts[2]; // Juventus.png
      
      const teamName = fileName.replace('.png', '').trim();
      let league = folderName;
      if (league.includes(' - ')) {
        league = league.split(' - ')[1].trim(); // Extract "Serie A" from "Italy - Serie A"
      }
      
      const logoUrl = `https://raw.githubusercontent.com/luukhopman/football-logos/master/${item.path.split('/').map(encodeURIComponent).join('/')}`;
      
      teams.push({
        id: `club_${teams.length}`,
        name: teamName,
        league: league,
        category: 'Club',
        logo: logoUrl
      });
    }
  }

  // 2. Aggiungi le Nazionali
  for (const nat of nationalTeams) {
    teams.push({
      id: `nat_${nat.code}`,
      name: nat.name,
      league: 'International',
      category: 'Nazionali',
      logo: `https://flagcdn.com/w320/${nat.code}.png`
    });
  }

  console.log(`Totale squadre elaborate: ${teams.length}`);
  
  // 3. Upload to Firebase
  const firebaseUrl = 'https://partygames-c9dc1-default-rtdb.firebaseio.com/games_data/teams.json';
  
  console.log('Uploading to Firebase Realtime Database...');
  
  const uploadData = JSON.stringify(teams);
  
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
        console.error('Errore durante l\'upload:', res.statusCode, responseBody);
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
