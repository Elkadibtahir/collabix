const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync('./frontend/eslint-report2.json', 'utf8').replace(/^\uFEFF/, ''));
const projectRoot = 'C:\\Users\\SURFACE\\Desktop\\collabix\\frontend\\project';

let totalFixed = 0;
let filesModified = 0;

report.forEach(fileReport => {
  const filePath = fileReport.filePath;
  if (!filePath.startsWith(projectRoot)) return;

  const relPath = filePath.replace(projectRoot + path.sep, '');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const unusedOnLine = {};
  fileReport.messages.forEach(msg => {
    if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
      const parts = msg.message.match(/'([^']+)'/);
      if (parts) {
        const name = parts[1];
        if (!unusedOnLine[msg.line]) unusedOnLine[msg.line] = [];
        unusedOnLine[msg.line].push(name);
      }
    }
  });

  const lineNums = Object.keys(unusedOnLine).map(Number);
  if (lineNums.length === 0) return;

  let changed = false;
  const newLines = lines.map((line, i) => {
    const lineNum = i + 1;
    if (!unusedOnLine[lineNum]) return line;

    const unusedNames = unusedOnLine[lineNum];
    const trim = line.match(/^(\s*)/)[1];

    // Case 1: Named import: { Foo, Bar } from '...'
    const namedImport = line.match(/^(.*?\{)([^}]+)(\}.*)$/);
    if (namedImport) {
      const before = namedImport[1];
      const middle = namedImport[2];
      const after = namedImport[3];
      const specs = middle.split(',').map(s => s.trim()).filter(s => s);
      const remaining = specs.filter(s => {
        const specName = s.replace(/^\*\s+as\s+/, '').replace(/\s+as\s+.*$/, '').trim();
        return !unusedNames.includes(specName);
      });
      if (remaining.length === 0) {
        // Entire import is unused - remove the line
        changed = true;
        return null;
      } else if (remaining.length < specs.length) {
        changed = true;
        return before + ' ' + remaining.join(', ') + ' ' + after;
      }
      return line; // all used, shouldn't happen
    }

    // Case 2: Default import: import Foo from '...'
    const defaultImport = line.match(/^(\s*)import\s+(\w+)\s+from\s+/);
    if (defaultImport && unusedNames.includes(defaultImport[2])) {
      changed = true;
      return null;
    }

    // Case 3: Multi-line named import spanning multiple lines
    // We'll handle this by checking if this line is inside a multi-line import
    // Pattern: {   or   Foo,  or   Foo }
    const inMultiLineImport = line.match(/^\s*\{[^}]*\}$/);
    // This is tricky - skip for now, handle below

    // Case 4: Non-import unused var (const x = ..., function param, etc.)
    // Don't remove - just skip. We'll handle these manually.
    return line;
  });

  // Handle multi-line imports: find blocks that start with import and end with ;
  // Check for unused vars on lines within these blocks
  const result = [];
  let skipNext = false;
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;

    // Check if this line is a multi-line import start
    const isMultiLineImportStart = lines[i].match(/^\s*import\s+/) && !lines[i].includes(';') && !lines[i].includes("'from'") && !lines[i].includes('"from"');

    if (isMultiLineImportStart && unusedOnLine[lineNum]) {
      // Collect the full import block
      let blockEnd = i;
      for (let j = i; j < lines.length; j++) {
        if (lines[j].includes(';') || lines[j].includes("'from'") || lines[j].includes('"from"')) {
          blockEnd = j;
          break;
        }
        if (lines[j].includes('}')) {
          blockEnd = j;
          break;
        }
      }

      // Check each line in the block for unused vars
      const blockLines = lines.slice(i, blockEnd + 1);
      const newBlockLines = blockLines.map((bl, bi) => {
        const blockLineNum = i + bi + 1;
        if (!unusedOnLine[blockLineNum]) return bl;

        const unusedNames = unusedOnLine[blockLineNum];

        // Check if it's { Foo, Bar } on a single line within the block
        const namedMatch = bl.match(/^(\s*\{)\s+(.*?)\s+(\}\s*;?.*)$/);
        if (namedMatch) {
          const middle = namedMatch[2];
          const specs = middle.split(',').map(s => s.trim()).filter(s => s);
          const remaining = specs.filter(s => {
            const specName = s.replace(/^\*\s+as\s+/, '').replace(/\s+as\s+.*$/, '').trim();
            return !unusedNames.includes(specName);
          });
          if (remaining.length === 0) {
            changed = true;
            return null;
          } else if (remaining.length < specs.length) {
            changed = true;
            return namedMatch[1] + ' ' + remaining.join(', ') + ' ' + namedMatch[3];
          }
          return bl;
        }

        // Check if it's a specifier line: Foo, or Foo
        const specMatch = bl.match(/^(\s+)(.*?)(,?\s*)$/);
        if (specMatch) {
          const spec = specMatch[2].trim().replace(/,\s*$/, '');
          if (unusedNames.includes(spec)) {
            changed = true;
            return null;
          }
        }

        return bl;
      });

      newBlockLines.forEach((bl, bi) => {
        if (bl !== null) result.push(bl);
      });
      i = blockEnd; // skip to end of block
      return;
    }

    // If this line was marked for null (import removal), skip it
    if (newLines[i] === null) {
      changed = true;
      return;
    }

    result.push(lines[i]);
  }

  if (changed) {
    fs.writeFileSync(filePath, result.join('\n'), 'utf8');
    totalFixed++;
    if (totalFixed <= 50) console.log('Fixed: ' + relPath);
  }
});

console.log('Modified ' + totalFixed + ' files');
