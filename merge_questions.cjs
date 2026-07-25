const fs = require('fs');
const path = require('path');

const chunksDir = path.join(__dirname, 'src', 'data', 'vero_falso_chunks');
const outputFile = path.join(__dirname, 'src', 'data', 'vero_falso.json');

const files = fs.readdirSync(chunksDir).filter(f => f.endsWith('.json'));

let allQuestions = [];

for (const file of files) {
  const filePath = path.join(chunksDir, file);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      allQuestions = allQuestions.concat(parsed);
      console.log(`Loaded ${parsed.length} questions from ${file}`);
    } else {
      console.error(`Error: ${file} does not contain an array`);
    }
  } catch (err) {
    console.error(`Error reading or parsing ${file}:`, err);
  }
}

// Write the combined output
fs.writeFileSync(outputFile, JSON.stringify(allQuestions, null, 2), 'utf8');
console.log(`\nSuccessfully merged ${allQuestions.length} questions into ${outputFile}`);

// Clean up chunks
fs.rmSync(chunksDir, { recursive: true, force: true });
console.log('Cleaned up chunks directory.');
