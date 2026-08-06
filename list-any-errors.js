const r = require('./frontend/eslint-report.json');
r.forEach(f => f.messages.forEach(m => {
  if (m.ruleId && m.ruleId.includes('no-explicit-any')) {
    console.log(f.filePath.replace('C:\\Users\\SURFACE\\Desktop\\collabix\\frontend\\project\\', '') + ':' + m.line + ':' + m.column + ' ' + m.message);
  }
}));
