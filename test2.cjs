const fetch = require('node-fetch');
const cheerio = require('cheerio');
async function test() {
  const res = await fetch('https://it.wikipedia.org/wiki/Sadio_Man%C3%A9');
  const html = await res.text();
  const $ = cheerio.load(html);
  
  let clubSectionFound = false;
  $('table.sinottico tr').each((i, el) => {
    if ($(el).text().includes('Squadre di club')) {
      clubSectionFound = true;
      return;
    }
    if (clubSectionFound && $(el).text().includes('Nazionale')) {
      clubSectionFound = false;
    }
    
    if (clubSectionFound) {
      const tds = $(el).find('td');
      if (tds.length >= 2) {
        const td = $(tds[1]);
        const teamName = td.text().replace(/[0-9()→]/g, '').trim();
        let img = td.find('img').first().attr('src');
        if (img) {
            // upscale wikipedia thumbnail from 20px to 60px
            img = 'https:' + img.replace('/20px-', '/80px-');
        }
        console.log('Team:', teamName, 'IMG:', img);
      }
    }
  });
}
test();
