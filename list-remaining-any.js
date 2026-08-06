const r = require('./frontend/eslint-report2.json');
r.forEach(f => f.messages.forEach(m => {
  if (m.ruleId && (m.ruleId.includes('no-explicit-any') || m.ruleId.includes('no-empty-object-type') || m.ruleId.includes('rules-of-hooks'))) {
    console.log(f.filePath.replace('C:\\Users\\SURFACE\\Desktop\\collabix\\frontend\\project\\', '') + ':' + m.line + ':' + m.column + ' [' + m.ruleId + '] ' + m.message);
  }
}));
