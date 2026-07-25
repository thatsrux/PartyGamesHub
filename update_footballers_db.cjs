const fs = require('fs');
const https = require('https');

const putFirebase = (data) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = https.request('https://partygames-c9dc1-default-rtdb.firebaseio.com/games_data/footballers.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed: ${res.statusCode} ${responseBody}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

async function run() {
  console.log("Leggo lista_giocatori.txt...");
  const txtContent = fs.readFileSync('lista_giocatori.txt', 'utf8');
  
  // Estrai solo i nomi dal file di testo ignorando i numeri "1. ", "2. ", ecc.
  const keptNames = new Set(
    txtContent.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\d+\.\s*/, ''))
  );

  console.log("Leggo il DB originale...");
  const originalData = JSON.parse(fs.readFileSync('src/data/footballers.json', 'utf8'));

  const filteredData = originalData.filter(p => keptNames.has(p.name));
  
  console.log(`Risultato: mantenuti ${filteredData.length} giocatori su ${originalData.length}.`);
  
  fs.writeFileSync('src/data/footballers.json', JSON.stringify(filteredData, null, 2));
  console.log("File locale aggiornato!");

  console.log("Aggiorno Firebase...");
  await putFirebase(filteredData);
  console.log("Database su Firebase aggiornato con successo!");
}

run();
