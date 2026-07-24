const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function scrapeWiki(playerName) {
  try {
    const searchUrl = `https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(playerName)}&utf8=&format=json`;
    const headers = { 'User-Agent': 'PartyHubGames/1.0 (test@partyhub.games)' };
    const searchRes = await fetch(searchUrl, { headers });
    const searchData = await searchRes.json();
    
    if (!searchData.query.search.length) return null;
    
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
      if (text.includes('Giovanili')) { section = 'youth'; return; }
      if (text.includes('Squadre di club')) { section = 'club'; return; }
      if (text.includes('Nazionale')) { section = 'national'; return; }
      if (text.includes('Palmarès') || text.includes('Carriera da allenatore') || text.includes('Statistiche')) { section = 'done'; return; }
      
      if (section === 'club' || section === 'national') {
        const tds = $(el).find('td');
        if (tds.length >= 2) {
          const yearText = $(tds[0]).text().trim();
          
          const td = $(tds[1]);
          const teamLink = td.find('a').first();
          let teamName = teamLink.text().trim();
          
          if (!teamName) teamName = td.text().replace(/[0-9()→]/g, '').trim();
          
          if (teamName && teamName.length > 2) {
            teamName = teamName.replace(/ olimpica/gi, '').trim();
            if (teamName.endsWith(' B') || teamName.endsWith(' C') || teamName.endsWith(' D') || teamName.endsWith(' II')) return;
            
            let img = td.find('img').first().attr('src');
            if (img) img = 'https:' + img.replace('/20px-', '/80px-');
            
            if (section === 'club') clubs.push({ name: teamName, logo: img || null, years: yearText || '' });
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
    const uniqueMap = {};
    for (const c of allClues) {
       if (!uniqueMap[c.name]) uniqueMap[c.name] = c;
    }
    return Object.values(uniqueMap);
  } catch (err) {
    console.error(`Error scraping ${playerName}:`, err.message);
    return null;
  }
}
scrapeWiki('Seiichirō Maki').then(console.log);
