const fs = require('fs');
const https = require('https');
const dataTsPath = 'src/games/IndovinaImmagine/data.ts';

const urls = [
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Statue_of_Liberty%2C_NY.jpg/800px-Statue_of_Liberty%2C_NY.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/800px-Colosseo_2020.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Taj_Mahal_in_March_2004.jpg/800px-Taj_Mahal_in_March_2004.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Eiffel_Tower_from_the_Tour_Montparnasse_3.jpg/800px-Eiffel_Tower_from_the_Tour_Montparnasse_3.jpg'
];

async function fetchBase64(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } }, (res) => {
      // If redirect
      if (res.statusCode === 301 || res.statusCode === 302) {
          return resolve(fetchBase64(res.headers.location));
      }
      if (res.statusCode !== 200) {
          reject(new Error('Status: ' + res.statusCode));
          return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve('data:image/jpeg;base64,' + buffer.toString('base64'));
      });
    }).on('error', reject);
  });
}

async function main() {
  const content = [
    'export interface IndovinaImmagineQuestion {',
    '  imageUrl: string;',
    '  answers: string[];',
    '}',
    '',
    'export const indovinaImmagineQuestions: IndovinaImmagineQuestion[] = ['
  ];
  
  const answers = [
    '["statua della libertà", "statua della liberta", "statue of liberty"]',
    '["colosseo", "colosseum"]',
    '["taj mahal", "tajmahal"]',
    '["torre eiffel", "tour eiffel", "eiffel tower", "torre eifel"]'
  ];

  for (let i=0; i<urls.length; i++) {
    console.log('fetching', urls[i]);
    let b64 = await fetchBase64(urls[i]);
    if (b64.startsWith('data:image/jpeg;base64,PCFET0')) {
       // Try without 800px- prefix
       const newUrl = urls[i].replace('/thumb', '').split('/').slice(0, -1).join('/');
       console.log('fallback to', newUrl);
       b64 = await fetchBase64(newUrl);
    }
    content.push('  {');
    content.push('    imageUrl: "' + b64 + '",');
    content.push('    answers: ' + answers[i]);
    content.push('  }' + (i < urls.length - 1 ? ',' : ''));
  }
  content.push('];');
  fs.writeFileSync(dataTsPath, content.join('\n'));
  console.log('done');
}
main().catch(console.error);
