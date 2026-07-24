const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function scrapeWiki(playerName) {
  // Use Wikipedia Search API to find the exact page title
  const searchUrl = `https://it.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(playerName)}&utf8=&format=json`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();
  
  if (!searchData.query.search.length) {
    console.log(`No results for ${playerName}`);
    return null;
  }
  
  const title = searchData.query.search[0].title;
  console.log(`Found page: ${title}`);
  
  const pageUrl = `https://it.wikipedia.org/wiki/${encodeURIComponent(title)}`;
  const res = await fetch(pageUrl);
  const html = await res.text();
  const $ = cheerio.load(html);
  
  const clubs = [];
  const national = [];
  
  let section = null; // 'youth', 'club', 'national'
  
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
    if (text.includes('Palmarès') || text.includes('Carriera da allenatore')) {
      section = 'done';
      return;
    }
    
    if (section === 'club' || section === 'national') {
      // Find the first 'a' tag in the right column of the row
      // Usually rows have 3 td's: Years | Team | Apps (Goals)
      // The team is typically the 2nd td. If the row has th, it might be a header.
      const tds = $(el).find('td');
      if (tds.length >= 2) {
        // The team name is in the second td, usually inside an 'a' tag
        const teamLink = $(tds[1]).find('a').first();
        let teamName = teamLink.text().trim();
        
        // If there is no 'a' tag, maybe just text?
        if (!teamName) {
           // get text but remove numbers/parentheses?
           teamName = $(tds[1]).text().replace(/[0-9()→]/g, '').trim();
        }
        
        if (teamName && teamName.length > 2) {
          if (section === 'club') clubs.push(teamName);
          if (section === 'national') {
             // For national teams, sometimes it's 'Argentina U-20', we only want the main one
             if (!teamName.includes('Under-') && !teamName.includes(' U-') && !teamName.includes('Olimpica')) {
                national.push(teamName);
             }
          }
        }
      }
    }
  });
  
  // Clean up duplicates (sometimes same team multiple times, we only want it once per "stint" or maybe just once overall to keep clues short)
  const allClues = [...clubs, ...national];
  const uniqueClues = [...new Set(allClues)];
  return uniqueClues;
}

async function run() {
  console.log('Modric:', await scrapeWiki('Luka Modric'));
  console.log('Messi:', await scrapeWiki('Lionel Messi'));
  console.log('Baines:', await scrapeWiki('Leighton Baines'));
}
run();
