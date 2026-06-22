const fs = require('fs');
const path = require('path');

// Mojibake fix: UTF-8 text that was misread as Windows-1252 and re-saved.
// Strategy: treat each code-point as a raw byte (Latin-1), reassemble,
// re-decode as UTF-8. Only write if mojibake pattern count drops.
// Mojibake detection: sequences like Ã©, â€", ðŸ¢ etc.
const BAD_RE = /[\u00c2-\u00ef][\u0080-\u00bf]|[\u00f0-\u00f4][\u0080-\u00bf]{3}/g;

function countBad(s) { return (s.match(BAD_RE) || []).length; }

function fixMojibake(str) {
  if (countBad(str) === 0) return str;
  // Re-interpret each Unicode code-point as a raw Latin-1 byte
  const bytes = [];
  for (let i = 0; i < str.length; i++) {
    const cp = str.codePointAt(i);
    if (cp > 0xFFFF) i++; // surrogate pair advance
    if (cp <= 0xFF) {
      bytes.push(cp);
    } else {
      // Non-Latin1 char — push its UTF-8 bytes (already correct, not mojibake)
      for (const b of Buffer.from(String.fromCodePoint(cp), 'utf8')) bytes.push(b);
    }
  }
  try {
    const fixed = Buffer.from(bytes).toString('utf8');
    // Only accept if we reduced mojibake count
    if (countBad(fixed) < countBad(str)) return fixed;
  } catch { /* invalid UTF-8 sequence — leave as-is */ }
  return str;
}

function walk(dir) {
  const res = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory() && !['node_modules', 'dist', '.git'].includes(e.name)) res.push(...walk(p));
    else if (e.isFile() && /\.(jsx|js|css)$/.test(e.name)) res.push(p);
  }
  return res;
}

const srcDir = 'C:/Users/samy7/Documents/GitHub/Meereo-frontend/web/src';
let n = 0;
for (const f of walk(srcDir)) {
  const orig = fs.readFileSync(f, 'utf8');
  const fixed = fixMojibake(orig);
  if (fixed !== orig) {
    fs.writeFileSync(f, fixed, 'utf8');
    console.log('Fixed:', path.relative(srcDir, f).replace(/\\/g, '/'));
    n++;
  }
}
console.log('\nDone:', n, 'files fixed');

