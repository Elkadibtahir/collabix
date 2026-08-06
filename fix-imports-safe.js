const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync('./frontend/eslint-report2.json', 'utf8').replace(/^\uFEFF/, ''));
const projectRoot = 'C:\\Users\\SURFACE\\Desktop\\collabix\\frontend\\project';

let filesModified = 0;

report.forEach(fileReport => {
  const filePath = fileReport.filePath;
  if (!filePath.startsWith(projectRoot)) return;

  const unusedMessages = fileReport.messages.filter(m =>
    m.ruleId === '@typescript-eslint/no-unused-vars'
  );
  if (unusedMessages.length === 0) return;

  const unusedOnLine = {};
  unusedMessages.forEach(msg => {
    const parts = msg.message.match(/'([^']+)'/);
    if (parts) {
      const name = parts[1];
      if (!unusedOnLine[msg.line]) unusedOnLine[msg.line] = [];
      unusedOnLine[msg.line].push(name);
    }
  });

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let changed = false;

  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for import line (single or start of multi-line)
    const isImport = trimmed.startsWith('import ') || trimmed.startsWith('import\t');

    if (isImport) {
      // Collect the full import block (may span multiple lines until ; or } with from)
      let blockEnd = i;
      let hasSemicolon = false;
      for (let j = i; j < lines.length; j++) {
        const fullBlock = lines.slice(i, j + 1).join('\n');
        if (fullBlock.includes(';') || (fullBlock.includes('}') && fullBlock.includes('from'))) {
          blockEnd = j;
          hasSemicolon = fullBlock.includes(';');
          break;
        }
        if (j === lines.length - 1) {
          blockEnd = j;
          break;
        }
      }

      const blockLines = lines.slice(i, blockEnd + 1);
      const fullBlock = blockLines.join('\n');

      // Get unused names in this block
      const unusedInBlock = [];
      for (let li = 0; li < blockLines.length; li++) {
        const lineNum = i + li + 1;
        if (unusedOnLine[lineNum]) {
          unusedOnLine[lineNum].forEach(n => unusedInBlock.push(n));
        }
      }

      if (unusedInBlock.length === 0) {
        // No unused vars in this import block
        result.push(...blockLines);
        i = blockEnd + 1;
        continue;
      }

      changed = true;

      // Process each line in the block
      if (blockLines.length === 1) {
        // Single-line import
        const bl = blockLines[0];

        // Default + named: import Foo, { Bar, Baz } from '...'
        const defaultAndNamed = bl.match(/^(\s*)import\s+(\w+)\s*,\s*\{([^}]+)\}\s*from\s+('[^']+'|"[^\"]+");?\s*$/);
        if (defaultAndNamed) {
          const defaultName = defaultAndNamed[2];
          const specs = defaultAndNamed[3].split(',').map(s => s.trim()).filter(s => s);
          const remainingSpecs = specs.filter(s => !unusedInBlock.includes(s));

          if (unusedInBlock.includes(defaultName) && remainingSpecs.length === 0) {
            // Remove entire line
          } else if (unusedInBlock.includes(defaultName)) {
            // Remove default, keep named
            const indent = defaultAndNamed[1];
            const fromPart = defaultAndNamed[4];
            result.push(indent + 'import { ' + remainingSpecs.join(', ') + ' } from ' + fromPart.replace(/;?\s*$/, '') + ';');
          } else if (remainingSpecs.length === 0) {
            // Remove named, keep default
            const indent = defaultAndNamed[1];
            const fromPart = defaultAndNamed[4];
            result.push(indent + 'import ' + defaultName + ' from ' + fromPart.replace(/;?\s*$/, '') + ';');
          } else {
            // Remove some named, keep rest
            const indent = defaultAndNamed[1];
            const fromPart = defaultAndNamed[4];
            result.push(indent + 'import ' + defaultName + ', { ' + remainingSpecs.join(', ') + ' } from ' + fromPart.replace(/;?\s*$/, '') + ';');
          }
          i = blockEnd + 1;
          continue;
        }

        // Named only: import { Foo, Bar } from '...' or import type { Foo, Bar } from '...'
        const namedOnly = bl.match(/^(\s*)import(?:\s+type)?\s*\{([^}]+)\}\s*from\s+('[^']+'|"[^\"]+");?\s*$/);
        if (namedOnly) {
          const specs = namedOnly[2].split(',').map(s => s.trim()).filter(s => s);
          const remaining = specs.filter(s => !unusedInBlock.includes(s));

          if (remaining.length === 0) {
            // Remove entire line
          } else {
            const indent = namedOnly[1];
            const rest = bl.match(/^(\s*)import/)[1];
            const isType = bl.includes('import type');
            const fromPart = namedOnly[3];
            const importKeyword = isType ? 'import type' : 'import';
            result.push(indent + importKeyword + ' { ' + remaining.join(', ') + ' } from ' + fromPart.replace(/;?\s*$/, '') + ';');
          }
          i = blockEnd + 1;
          continue;
        }

        // Default only: import Foo from '...'
        const defaultOnly = bl.match(/^(\s*)import\s+(\w+)\s+from\s+('[^']+'|"[^\"]+");?\s*$/);
        if (defaultOnly && unusedInBlock.includes(defaultOnly[2])) {
          // Remove entire line
          i = blockEnd + 1;
          continue;
        }

        // Default import with no named: import * as Foo from '...'
        const namespaceImport = bl.match(/^(\s*)import\s+\*\s+as\s+(\w+)\s+from\s+('[^']+'|"[^\"]+");?\s*$/);
        if (namespaceImport && unusedInBlock.includes(namespaceImport[2])) {
          i = blockEnd + 1;
          continue;
        }

        // If we didn't match any known pattern, keep the line as-is
        result.push(bl);
        i = blockEnd + 1;
        continue;
      } else {
        // Multi-line import
        const newBlockLines = [];
        for (let li = 0; li < blockLines.length; li++) {
          const bl = blockLines[li];
          const lineNum = i + li + 1;
          const unusedHere = unusedOnLine[lineNum] || [];

          if (unusedHere.length === 0) {
            newBlockLines.push(bl);
            continue;
          }

          // Check if this is a specifier line in a multi-line import
          // Pattern:   Foo,   or   Foo
          const specLine = bl.match(/^(\s+)(\w+)(\s*,?\s*)(\/\*\s*\*\/)?\s*$/);
          if (specLine) {
            if (unusedHere.includes(specLine[2])) {
              continue; // skip this line
            }
          }

          // Default import on its own line
          const defaultLine = bl.match(/^(\s*)import\s+(\w+)\s*,\s*$/);
          if (defaultLine && unusedHere.includes(defaultLine[2])) {
            continue;
          }

          // Named import start: import {
          const namedStart = bl.match(/^(\s*)import(?:\s+type)?\s*\{\s*$/);
          if (namedStart) {
            // Check if ALL subsequent lines in this block are unused
            // If so, we might need to remove the whole block
            // For now, just process the lines below
          }

          // Closing brace with from: } from '...'
          const closeBrace = bl.match(/^(\s*\}\s*from\s+('[^']+'|"[^\"]+");?\s*)$/);
          if (closeBrace) {
            // Check if all lines between { and } are now removed
            const remainingLines = newBlockLines.filter(l => l.trim() && !l.match(/^(\s*)\}(\s*from)/));
            const hasAnySpecifiers = remainingLines.some(l => l.match(/^(\s+)(\w+)(\s*,?\s*)?$/));
            if (!hasAnySpecifiers && remainingLines.length === 0) {
              // All specifiers removed - but we might still have a default import
              // Check if there's a default import before the {
              const hasDefault = blockLines.some(l => l.match(/^(\s*)import\s+(\w+)\s*,\s*$/));
              if (!hasDefault) {
                continue; // skip the closing brace too (entire import removed)
              }
            }
          }

          newBlockLines.push(bl);
        }

        // Filter out empty lines from the block
        const filteredBlock = newBlockLines.filter(l => l.trim() !== '');

        if (filteredBlock.length > 0) {
          result.push(...filteredBlock);
        }
        i = blockEnd + 1;
        continue;
      }
    }

    // Non-import line - add as-is
    result.push(line);
    i++;
  }

  if (changed) {
    fs.writeFileSync(filePath, result.join('\n'), 'utf8');
    filesModified++;
    console.log('Fixed: ' + filePath.replace(projectRoot + path.sep, ''));
  }
});

console.log('Modified ' + filesModified + ' files');
