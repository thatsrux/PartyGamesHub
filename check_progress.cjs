const fs = require('fs');

const logFilePath = 'C:\\Users\\thatsrux\\.gemini\\antigravity-ide\\brain\\021c47be-5031-4479-addb-7c6afe7babbf\\.system_generated\\tasks\\task-1231.log';

console.log('⚽ Monitoraggio in tempo reale del Bot Wikipedia ⚽');
console.log('Premi Ctrl+C per uscire.\n');

let lastSize = 0;

setInterval(() => {
  try {
    const stats = fs.statSync(logFilePath);
    if (stats.size > lastSize) {
      const data = fs.readFileSync(logFilePath, 'utf8');
      const lines = data.trim().split('\n');
      
      // Get the last progress line
      let progressLine = '';
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('Success') || lines[i].includes('Failed') || lines[i].includes('DONE')) {
          progressLine = lines[i];
          break;
        }
      }
      
      if (progressLine) {
        // Clear current line and write new progress
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write('👉 ' + progressLine);
        
        if (progressLine.includes('DONE')) {
          console.log('\n\n✅ OPERAZIONE COMPLETATA! Il database è live su Firebase!');
          process.exit(0);
        }
      }
      lastSize = stats.size;
    }
  } catch (err) {
    // File might not exist yet or locked
  }
}, 500);
