const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const gamesDir = path.join(__dirname, 'src', 'games');
const tempQDir = path.join(dataDir, 'temp_q');

// ═══════════════════════════════════
// 1. Merge JSON-based games
// ═══════════════════════════════════
const jsonGames = [
  { prefix: 'vf_extra_', target: 'vero_falso.json' },
  { prefix: 'fa_extra_', target: 'falsario.json' },
  { prefix: 'q4_extra_', target: 'quiz4.json' },
];

jsonGames.forEach(({ prefix, target }) => {
  const targetPath = path.join(dataDir, target);
  const existing = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  const files = fs.readdirSync(tempQDir).filter(f => f.startsWith(prefix) && f.endsWith('.json'));
  let added = 0;
  files.forEach(file => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(tempQDir, file), 'utf8'));
      existing.push(...data);
      added += data.length;
    } catch (e) {
      console.error(`  ERROR parsing ${file}:`, e.message);
    }
  });
  fs.writeFileSync(targetPath, JSON.stringify(existing, null, 2));
  console.log(`${target}: added ${added} (total: ${existing.length})`);
});

// ═══════════════════════════════════
// 2. Merge Più Vicino (per-category files)
// ═══════════════════════════════════
const catMap = {
  1: 'Cinema e Serie TV',
  2: 'Storia e Mitologia',
  3: 'Musica',
  4: 'Scienza e Natura',
  5: 'Tecnologia e Videogiochi',
  6: 'Letteratura e Arte',
  7: 'Geografia',
  8: 'Cucina e Tradizioni',
  9: 'Cultura Pop e Gossip',
  10: 'Sport'
};

let pvTotal = 0;
for (let i = 1; i <= 10; i++) {
  const pvFile = path.join(tempQDir, `pv_extra_${i}.json`);
  if (!fs.existsSync(pvFile)) continue;
  try {
    const newData = JSON.parse(fs.readFileSync(pvFile, 'utf8'));
    const targetFile = path.join(dataDir, `piu_vicino_cat_${i}.json`);
    const existing = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    existing.push(...newData);
    fs.writeFileSync(targetFile, JSON.stringify(existing, null, 2));
    pvTotal += newData.length;
    console.log(`piu_vicino_cat_${i}.json (${catMap[i]}): added ${newData.length} (total: ${existing.length})`);
  } catch (e) {
    console.error(`  ERROR piu_vicino_cat_${i}:`, e.message);
  }
}
console.log(`Più Vicino Vince: added ${pvTotal} total`);

// ═══════════════════════════════════
// 3. Merge Ordina (TypeScript file)
// ═══════════════════════════════════
const ordinaTsPath = path.join(gamesDir, 'Ordina', 'data.ts');
let ordinaTs = fs.readFileSync(ordinaTsPath, 'utf8');
const ordMarker = 'export const ordinaQuestions: OrdinaQuestion[] = ';
const ordStart = ordinaTs.indexOf(ordMarker);
const ordPrefix = ordinaTs.substring(0, ordStart + ordMarker.length);
let ordArrayStr = ordinaTs.substring(ordStart + ordMarker.length);
ordArrayStr = ordArrayStr.substring(0, ordArrayStr.lastIndexOf(';'));
const ordData = eval(ordArrayStr);

const ordFiles = fs.readdirSync(tempQDir).filter(f => f.startsWith('ord_extra_') && f.endsWith('.json'));
let ordAdded = 0;
ordFiles.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(tempQDir, file), 'utf8'));
    ordData.push(...data);
    ordAdded += data.length;
  } catch (e) {
    console.error(`  ERROR parsing ${file}:`, e.message);
  }
});

fs.writeFileSync(ordinaTsPath, ordPrefix + JSON.stringify(ordData, null, 2) + ';\n');
console.log(`Ordina: added ${ordAdded} (total: ${ordData.length})`);

console.log('\nDone aggregating all games!');
