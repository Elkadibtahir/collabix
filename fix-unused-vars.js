const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, 'frontend', 'eslint-report.json');
const reportRaw = fs.readFileSync(reportPath, 'utf8').replace(/^\uFEFF/, '');
const report = JSON.parse(reportRaw);
const projectRoot = path.join(__dirname, 'frontend', 'project');

report.forEach(fileReport => {
  const filePath = fileReport.filePath;
  if (!filePath.startsWith(projectRoot)) return;

  const unusedLines = new Set();
  const unusedSpecifiers = {}; // line -> array of specifier names

  fileReport.messages.forEach(msg => {
    if ((msg.severity === 2 || msg.severity === 1) && msg.ruleId === '@typescript-eslint/no-unused-vars') {
      unusedLines.add(msg.line);
      const parts = msg.message.match(/'([^']+)'/);
      if (parts) {
        const name = parts[1];
        if (!unusedSpecifiers[msg.line]) unusedSpecifiers[msg.line] = [];
        unusedSpecifiers[msg.line].push(name);
      }
    }
  });

  if (unusedLines.size === 0) return;

  const relPath = filePath.replace(projectRoot + path.sep, '');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const newLines = [];
  let changes = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    if (unusedLines.has(lineNum)) {
      // Check if this is an import line with unused specifiers
      const importMatch = line.match(/^(\s*import\s+)\{([^}]+)\}\s*from\s*['"][^'"]+['"];?\s*$/);
      if (importMatch) {
        const specifiersStr = importMatch[2];
        const specifiers = specifiersStr.split(',').map(s => s.trim()).filter(s => s);
        const unusedOnThisLine = unusedSpecifiers[lineNum] || [];
        const remaining = specifiers.filter(s => {
          const specName = s.replace(/^.*\s+as\s+/, '').trim();
          return !unusedOnThisLine.includes(specName);
        });
        if (remaining.length === 0) {
          newLines.push(null); // mark for removal
          changes++;
        } else {
          newLines.push(line.replace(importMatch[2], remaining.join(', ')));
          changes++;
        }
        continue;
      }

      // Check if it's a default import line: import Foo from '...';
      const defaultImportMatch = line.match(/^(\s*)import\s+(\w+)\s+from\s*['"][^'"]+['"];?\s*$/);
      if (defaultImportMatch) {
        newLines.push(null);
        changes++;
        continue;
      }

      // Check if it's a variable declaration: const [foo, bar] = ...
      const varDeclMatch = line.match(/^(\s*)(const|let|var)\s+(\w+)\s*=/);
      if (varDeclMatch) {
        const varName = varDeclMatch[3];
        const unusedOnThisLine = unusedSpecifiers[lineNum] || [];
        if (unusedOnThisLine.includes(varName)) {
          newLines.push(null);
          changes++;
          continue;
        }
      }

      // Check destructuring: const { foo, bar } = something
      const destructureMatch = line.match(/^(\s*)(const|let|var)\s+\{([^}]+)\}\s*=/);
      if (destructureMatch) {
        const specifiers = destructureMatch[3].split(',').map(s => s.trim()).filter(s => s);
        const unusedOnThisLine = unusedSpecifiers[lineNum] || [];
        const remaining = specifiers.filter(s => !unusedOnThisLine.includes(s));
        if (remaining.length === 0) {
          newLines.push(null);
          changes++;
        } else {
          newLines.push(line.replace(destructureMatch[3], remaining.join(', ')));
          changes++;
        }
        continue;
      }

      // For other unused lines, comment them out instead of removing
      newLines.push(null);
      changes++;
    } else {
      newLines.push(line);
    }
  }

  // Filter out null lines
  const filtered = newLines.filter(l => l !== null);
  if (changes > 0) {
    fs.writeFileSync(filePath, filtered.join('\n'), 'utf8');
    console.log(`Fixed ${changes} unused vars in ${relPath}`);
  }
});

console.log('Done fixing unused vars');
