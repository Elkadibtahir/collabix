const r = require('./frontend/eslint-report3.json');
const counts = {};
r.forEach(f => f.messages.forEach(m => {
  const rule = m.ruleId || 'unknown';
  counts[rule] = (counts[rule] || 0) + 1;
}));
Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([r, c]) => console.log(c + ' ' + r));
console.log('---');
console.log('Total files with issues: ' + r.filter(f => f.errorCount > 0 || f.warningCount > 0).length);
console.log('Total errors: ' + r.reduce((a, f) => a + f.errorCount, 0));
console.log('Total warnings: ' + r.reduce((a, f) => a + f.warningCount, 0));
