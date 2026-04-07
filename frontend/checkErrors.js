const fs = require('fs');
const execSync = require('child_process').execSync;
try { execSync('npx tsc -b', { stdio: 'pipe' }); } catch(err) {
  const output = err.stdout.toString('utf8');
  const lines = output.split('\n');
  const errs = lines.filter(l => l.includes('.tsx(')).map(l => l.trim().split(' ')[0]);
  console.log(JSON.stringify([...new Set(errs)], null, 2));
}
