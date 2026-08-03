const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const gamesDir = path.join(__dirname, 'src', 'games');

const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const MAGENTA = '\x1b[35m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

const hr = () => console.log(DIM + '─'.repeat(60) + RESET);

let grandTotal = 0;

// ═══════════════════════════════════════════════════
// 1. VERO O FALSO
// ═══════════════════════════════════════════════════
console.log(`\n${BOLD}${CYAN}🔵 VERO O FALSO${RESET}`);
hr();
const vf = JSON.parse(fs.readFileSync(path.join(dataDir, 'vero_falso.json'), 'utf8'));
const vfByCat = {};
vf.forEach(q => { vfByCat[q.category] = (vfByCat[q.category] || 0) + 1; });
Object.keys(vfByCat).sort().forEach(cat => {
  console.log(`  ${cat}: ${GREEN}${vfByCat[cat]}${RESET}`);
});
console.log(`  ${BOLD}TOTALE: ${YELLOW}${vf.length}${RESET}`);
grandTotal += vf.length;

// ═══════════════════════════════════════════════════
// 2. IL FALSARIO
// ═══════════════════════════════════════════════════
console.log(`\n${BOLD}${CYAN}🟣 IL FALSARIO${RESET}`);
hr();
const fa = JSON.parse(fs.readFileSync(path.join(dataDir, 'falsario.json'), 'utf8'));
const faByCat = {};
fa.forEach(q => { faByCat[q.category] = (faByCat[q.category] || 0) + 1; });
Object.keys(faByCat).sort().forEach(cat => {
  console.log(`  ${cat}: ${GREEN}${faByCat[cat]}${RESET}`);
});
console.log(`  ${BOLD}TOTALE: ${YELLOW}${fa.length}${RESET}`);
grandTotal += fa.length;

// ═══════════════════════════════════════════════════
// 3. QUIZ 4 RISPOSTE
// ═══════════════════════════════════════════════════
console.log(`\n${BOLD}${CYAN}🟢 QUIZ 4 RISPOSTE${RESET}`);
hr();
const q4 = JSON.parse(fs.readFileSync(path.join(dataDir, 'quiz4.json'), 'utf8'));
const q4ByCat = {};
q4.forEach(q => { q4ByCat[q.category] = (q4ByCat[q.category] || 0) + 1; });
Object.keys(q4ByCat).sort().forEach(cat => {
  console.log(`  ${cat}: ${GREEN}${q4ByCat[cat]}${RESET}`);
});
console.log(`  ${BOLD}TOTALE: ${YELLOW}${q4.length}${RESET}`);
grandTotal += q4.length;

// ═══════════════════════════════════════════════════
// 4. PIÙ VICINO VINCE
// ═══════════════════════════════════════════════════
console.log(`\n${BOLD}${CYAN}🟡 PIÙ VICINO VINCE${RESET}`);
hr();
const pvFiles = fs.readdirSync(dataDir).filter(f => f.startsWith('piu_vicino_cat_') && f.endsWith('.json'));
let pvTotal = 0;
pvFiles.sort().forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
  const catName = data[0]?.category || file;
  console.log(`  ${catName}: ${GREEN}${data.length}${RESET}`);
  pvTotal += data.length;
});
console.log(`  ${BOLD}TOTALE: ${YELLOW}${pvTotal}${RESET}`);
grandTotal += pvTotal;

// ═══════════════════════════════════════════════════
// 5. ORDINA
// ═══════════════════════════════════════════════════
console.log(`\n${BOLD}${CYAN}🟠 ORDINA${RESET}`);
hr();
const ordinaTs = fs.readFileSync(path.join(gamesDir, 'Ordina', 'data.ts'), 'utf8');
const ordinaArrayStr = ordinaTs.substring(ordinaTs.indexOf('export const ordinaQuestions: OrdinaQuestion[] = ') + 'export const ordinaQuestions: OrdinaQuestion[] = '.length);
const ordinaData = eval(ordinaArrayStr.endsWith(';') ? ordinaArrayStr.slice(0, -1) : ordinaArrayStr.substring(0, ordinaArrayStr.lastIndexOf(';')));
const ordByCat = {};
ordinaData.forEach(q => { const c = q.category || 'Senza Categoria'; ordByCat[c] = (ordByCat[c] || 0) + 1; });
Object.keys(ordByCat).sort().forEach(cat => {
  console.log(`  ${cat}: ${GREEN}${ordByCat[cat]}${RESET}`);
});
console.log(`  ${BOLD}TOTALE: ${YELLOW}${ordinaData.length}${RESET}`);
grandTotal += ordinaData.length;

// ═══════════════════════════════════════════════════
// 6. JEOPARDY (con breakdown per difficoltà)
// ═══════════════════════════════════════════════════
console.log(`\n${BOLD}${CYAN}🔴 JEOPARDY${RESET}`);
hr();
const jeoTs = fs.readFileSync(path.join(gamesDir, 'Jeopardy', 'data.ts'), 'utf8');
const jeoArrayStr = jeoTs.substring(jeoTs.indexOf('export const jeopardyCategories: JeopardyCategory[] = ') + 'export const jeopardyCategories: JeopardyCategory[] = '.length);
const jeoData = eval(jeoArrayStr.substring(0, jeoArrayStr.lastIndexOf(';')));
let jeoTotal = 0;
jeoData.forEach(cat => {
  const pts = [100, 200, 300, 400, 500];
  const counts = pts.map(p => (cat.questions[p] || []).length);
  const catTotal = counts.reduce((a, b) => a + b, 0);
  jeoTotal += catTotal;
  console.log(`  ${BOLD}${cat.name}${RESET} ${DIM}(${catTotal} totali)${RESET}`);
  pts.forEach((p, i) => {
    console.log(`    ${MAGENTA}${p} pt${RESET}: ${GREEN}${counts[i]}${RESET}`);
  });
});
console.log(`  ${BOLD}TOTALE: ${YELLOW}${jeoTotal}${RESET}`);
grandTotal += jeoTotal;

// ═══════════════════════════════════════════════════
// GRAND TOTAL
// ═══════════════════════════════════════════════════
console.log(`\n${'═'.repeat(60)}`);
console.log(`${BOLD}${YELLOW}📊 GRAND TOTAL DOMANDE: ${grandTotal}${RESET}`);
console.log(`${'═'.repeat(60)}\n`);
