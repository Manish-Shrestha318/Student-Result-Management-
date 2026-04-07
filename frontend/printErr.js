const fs = require('fs');
const txt = fs.readFileSync('ts_errors.txt', 'utf16le');
const lines = txt.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('.tsx(')) {
    console.log(lines[i].trim());
    if (lines[i+1]) console.log('   `' + lines[i+1].trim() + '`');
  }
}
