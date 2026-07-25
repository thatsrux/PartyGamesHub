const fetch = require('node-fetch');
const cheerio = require('cheerio');
const https = require('https');

// Fetch from firebase
const fetchFirebase = () => {
  return new Promise((resolve, reject) => {
    https.get('https://partygames-c9dc1-default-rtdb.firebaseio.com/games_data/footballers.json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
};

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

async function scrapeWiki(playerName) {
  try {
    const searchUrl = `https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(playerName)}&utf8=&format=json`;
    const headers = { 'User-Agent': 'PartyHubGames/1.0 (test@partyhub.games)' };
    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await searchRes.json();
    
    if (!searchData.query.search.length) {
      console.log(`No results for ${playerName}`);
      return null;
    }
    
    const title = searchData.query.search[0].title;
    
    const pageUrl = `https://it.wikipedia.org/wiki/${encodeURIComponent(title)}`;
    const res = await fetch(pageUrl, { headers });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const clubs = [];
    const national = [];
    
    let section = null; 
    
    $('table.sinottico tr').each((i, el) => {
      const text = $(el).text().trim();
      if (text.includes('Giovanili')) {
        section = 'youth';
        return;
      }
      if (text.includes('Squadre di club')) {
        section = 'club';
        return;
      }
      if (text.includes('Nazionale')) {
        section = 'national';
        return;
      }
      if (text.includes('Palmarès') || text.includes('Carriera da allenatore') || text.includes('Statistiche')) {
        section = 'done';
        return;
      }
      
      if (section === 'club' || section === 'national') {
        const tds = $(el).find('td');
        if (tds.length >= 2) {
          const yearText = $(tds[0]).text().trim();
          
          const td = $(tds[1]);
          const teamLink = td.find('a').first();
          let teamName = teamLink.text().trim();
          
          if (!teamName) {
             teamName = td.text().replace(/[0-9()→]/g, '').trim();
          }
          
          if (teamName && teamName.length > 2) {
            teamName = teamName.replace(/ olimpica/gi, '').trim();
            if (teamName.endsWith(' B') || teamName.endsWith(' C') || teamName.endsWith(' D') || teamName.endsWith(' II')) return;
            
            let img = td.find('img').first().attr('src');
            if (img) {
               img = 'https:' + img.replace('/20px-', '/80px-');
            }
            
            if (section === 'club') {
                clubs.push({ name: teamName, logo: img || null, years: yearText || '' });
            }
            if (section === 'national') {
               if (!teamName.includes('Under-') && !teamName.includes(' U-')) {
                  national.push({ name: teamName, logo: img || null, years: yearText || '' });
               }
            }
          }
        }
      }
    });
    
    const allClues = [...clubs, ...national];
    
    return allClues;
  } catch (err) {
    console.error(`Error scraping ${playerName}:`, err.message);
    return null;
  }
}

async function run() {
  console.log('Fetching current footballers database...');
  const footballers = await fetchFirebase();
  if (!footballers) return console.error('No db found');
  
  console.log(`Found ${footballers.length} footballers. Scraping Wikipedia sequentially to avoid errors...`);
  
  const updatedFootballers = [];
  
  for (let i = 0; i < footballers.length; i++) {
    const p = footballers[i];
    
    let scrapedClues = null;
    let attempts = 0;
    
    while (!scrapedClues && attempts < 3) {
      scrapedClues = await scrapeWiki(p.name);
      attempts++;
      if (!scrapedClues) await new Promise(r => setTimeout(r, 1000)); // wait before retry
    }
    
    if (scrapedClues && scrapedClues.length > 0) {
      console.log(`[${i+1}/${footballers.length}] ✅ Success: ${p.name}`);
      updatedFootballers.push({ ...p, clues: scrapedClues });
    } else {
      console.log(`[${i+1}/${footballers.length}] ❌ Failed: ${p.name}`);
      updatedFootballers.push(p);
    }
    
    // small delay
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log('Uploading updated database to Firebase...');
  await putFirebase(updatedFootballers);
  const fs = require('fs');
  fs.writeFileSync('./src/data/footballers.json', JSON.stringify(updatedFootballers, null, 2));
  console.log('Saved to src/data/footballers.json as well.');
  console.log('DONE!');
}

run();
