const r = require('./frontend/eslint-report.json');
r.forEach(f => f.messages.forEach(m => {
  if (m.ruleId && m.ruleId.includes('no-empty-object-type')) {
    console.log(f.filePath.replace('C:\\Users\\SURFACE\\Desktop\\collabix\\frontend\\project\\', '') + ':' + m.line + ' ' + m.message);
  }
}));
