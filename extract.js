import fs from 'fs';
import path from 'path';

const dataPath = path.join('c:/Users/thatsrux/Desktop/Games/party-hub/src/games/Jeopardy/data.ts');
const fileContent = fs.readFileSync(dataPath, 'utf8');

const startIndex = fileContent.indexOf('export const jeopardyCategories: JeopardyCategory[] = [');
if (startIndex !== -1) {
  const arrayContent = fileContent.substring(fileContent.indexOf('[', startIndex));
  
  const tempScriptPath = 'c:/Users/thatsrux/Desktop/Games/party-hub/extract_temp.cjs';
  fs.writeFileSync(tempScriptPath, `
    const data = ${arrayContent};
    const fs = require('fs');
    fs.writeFileSync('c:/Users/thatsrux/Desktop/Games/party-hub/jeopardy_data.json', JSON.stringify(data, null, 2));
  `);
  console.log('Created extract script.');
}
