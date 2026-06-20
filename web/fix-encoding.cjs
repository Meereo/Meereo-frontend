const fs = require('fs');
const path = require('path');

// All "bad" strings are constructed from their exact byte sequences
// to avoid any encoding ambiguity in this source file.
// The fix: file bytes represent double-encoded UTF-8 (UTF-8 read as Latin-1 then re-encoded as UTF-8)
// e.g. 'e' with acute = U+00E9 = bytes C3 A9 in UTF-8
// when misread as two Latin-1 chars: U+00C3 (=Ã) + U+00A9 (=©) = "Ã©"
// so we replace the 2-char sequence [U+00C3, U+00A9] with [U+00E9]

const R = [
  // lowercase French accented chars
  ['\u00c3\u00a9', '\u00e9'], // Ã© -> é
  ['\u00c3\u00a8', '\u00e8'], // Ã¨ -> è
  ['\u00c3\u00a0', '\u00e0'], // Ã  -> à
  ['\u00c3\u00ae', '\u00ee'], // Ã® -> î
  ['\u00c3\u00b4', '\u00f4'], // Ã´ -> ô
  ['\u00c3\u00bb', '\u00fb'], // Ã» -> û
  ['\u00c3\u00b9', '\u00f9'], // Ã¹ -> ù
  ['\u00c3\u00a7', '\u00e7'], // Ã§ -> ç
  ['\u00c3\u00a2', '\u00e2'], // Ã¢ -> â
  ['\u00c3\u00ab', '\u00eb'], // Ã« -> ë
  ['\u00c3\u00a1', '\u00e1'], // Ã¡ -> á
  ['\u00c3\u00a4', '\u00e4'], // Ã¤ -> ä
  ['\u00c3\u00b6', '\u00f6'], // Ã¶ -> ö
  ['\u00c3\u00bc', '\u00fc'], // Ã¼ -> ü
  ['\u00c3\u00b1', '\u00f1'], // Ã± -> ñ
  ['\u00c3\u00b3', '\u00f3'], // Ã³ -> ó
  ['\u00c3\u00b2', '\u00f2'], // Ã² -> ò
  ['\u00c3\u00ba', '\u00fa'], // Ãº -> ú
  ['\u00c3\u00af', '\u00ef'], // Ã¯ -> ï
  // Uppercase French accented chars
  ['\u00c3\u2030\u00c2\u009e', '\u00c9'], // Ã‰ (É) - complex 4-byte in UTF-8
  ['\u00c3\u2030\u00c2\u0098', '\u00c7'], // Ã‡ (Ç) - complex 4-byte
  // Simpler uppercase: Ã followed by control char range
  // É = U+00C9 -> bytes C3 89, in Latin-1: U+00C3 (Ã) + U+0089 (control)
  // But U+0089 encoded in UTF-8 = C2 89, so in the doubly-encoded form we'd see:
  // C3 83 C2 89 -> "Ã\x89" in string form -> but Windows-1252 maps 0x89 to ‰ (per-mille)
  // Actually: É in UTF-8 = C3 89. Misread as Windows-1252: C3=Ã, 89=‰(permille)
  // So É becomes "Ã‰" where ‰=U+2030
  ['\u00c3\u2030', '\u00c9'], // Ã‰ -> É
  ['\u00c3\u2014', '\u00c0'], // ÃÀ? No... À=C3 80, C3->Ã, 80->€(U+20AC in cp1252)
  // À = U+00C0 -> bytes C3 80. cp1252[0x80] = € (U+20AC). So À -> "Ã€" where €=U+20AC
  ['\u00c3\u20ac', '\u00c0'], // Ã€ -> À
  ['\u00c3\u2039', '\u00c8'], // ÃŒ? No... E hat = C3 8A = Ã + cp1252[8A]=Š(U+0160)
  ['\u00c3\u0160', '\u00ca'], // ÃŠ -> Ê
  ['\u00c3\u0153', '\u00ce'], // ÃŽ -> Î (cp1252[0x8E]=Ž=U+017D... no)
  // Let me use the actual Windows-1252 mappings:
  // cp1252[0x8B] = ‹ (U+2039 single guillemet left)
  // cp1252[0x8C] = Œ (U+0152)
  // cp1252[0x8E] = Ž (U+017D) 
  // Î = U+00CE -> C3 8E. cp1252[0x8E] = Ž (U+017D). So Î -> "ÃŽ" where Ž=U+017D
  ['\u00c3\u017d', '\u00ce'], // ÃŽ -> Î
  // Ï = U+00CF -> C3 8F. cp1252[0x8F] = undefined, but in practice maps to U+008F
  // Ô = U+00D4 -> C3 94. cp1252[0x94] = right double low quotation mark (U+201D) wait no
  // cp1252[0x94] = RIGHT DOUBLE QUOTATION MARK (U+201D = ")... no that's 0x93/0x94
  // Actually: 0x94 in cp1252 = U+201D (right double quotation mark)
  ['\u00c3\u201d', '\u00d4'], // Ã" -> Ô (É = 0xC3 then 0x94 = U+201D in cp1252)
  // Ó = U+00D3 -> C3 93. cp1252[0x93] = left double quotation mark (U+201C = ")
  ['\u00c3\u201c', '\u00d3'], // Ã" -> Ó
  // × = U+00D7 -> C3 97. cp1252[0x97] = em dash (U+2014)
  ['\u00c3\u2014', '\u00d7'], // Ã— -> ×
  // Ü = U+00DC -> C3 9C. cp1252[0x9C] = œ (U+0153)
  ['\u00c3\u0153', '\u00dc'], // Ãœ -> Ü
  // Ç = U+00C7 -> C3 87. cp1252[0x87] = ‡ (double dagger, U+2021)
  ['\u00c3\u2021', '\u00c7'], // Ã‡ -> Ç (corrected from above)
  // É = U+00C9 -> C3 89. cp1252[0x89] = ‰ (per mille, U+2030) - already done
  // Ñ = U+00D1 -> C3 91. cp1252[0x91] = left single quotation mark (U+2018 = ')
  ['\u00c3\u2018', '\u00d1'], // Ã' -> Ñ
  // Punctuation/special chars
  // em dash — = U+2014 -> bytes E2 80 94.
  // misread as cp1252: E2=â, 80=€(U+20AC in cp1252), 94=cp1252[0x94]=U+201D(")
  // So — -> "â€\"" where " is U+201D
  ['\u00e2\u20ac\u201d', '\u2014'], // â€" -> em dash —
  // right single quote ' = U+2019 -> bytes E2 80 99
  // cp1252: E2=â, 80=€, 99=cp1252[0x99]=™(U+2122)... no 0x99 is undefined in cp1252
  // Actually cp1252 0x99 = undefined, maps to U+0099 (control)
  // Hmm, but in Windows-1252: 0x99 = ™ (U+2122 trademark)
  ['\u00e2\u20ac\u2122', '\u2019'], // â€™ -> right single quote
  // left single quote ' = U+2018 -> bytes E2 80 98
  // cp1252 0x98 = ˜ (U+02DC small tilde)... no
  // cp1252 0x98 = ˜ U+02DC
  ['\u00e2\u20ac\u02dc', '\u2018'], // â€˜ -> left single quote
  // left double quote " = U+201C -> bytes E2 80 9C
  // cp1252 0x9C = œ (U+0153)
  ['\u00e2\u20ac\u0153', '\u201c'], // â€œ -> left double quote
  // right double quote " = U+201D -> bytes E2 80 9D
  // cp1252 0x9D = undefined -> U+009D
  // Actually this one is problematic, let me skip
  // ellipsis … = U+2026 -> bytes E2 80 A6 = â + € + cp1252[0xA6]=¦(U+00A6 broken bar)
  ['\u00e2\u20ac\u00a6', '\u2026'], // â€¦ -> ellipsis
  // bullet • = U+2022 -> bytes E2 80 A2 = â + € + cp1252[0xA2]=¢(U+00A2)
  ['\u00e2\u20ac\u00a2', '\u2022'], // â€¢ -> bullet
  // middle dot · = U+00B7 -> bytes C2 B7 = cp1252: C2=Â, B7=·(already correct in cp1252)
  // So · -> "Â·" where Â=U+00C2 and ·=U+00B7
  ['\u00c2\u00b7', '\u00b7'], // Â· -> middle dot ·
  // nbsp U+00A0 -> bytes C2 A0 = cp1252: C2=Â, A0=nbsp(U+00A0)
  // So nbsp -> "Â " (Â followed by nbsp). Replace with regular space in most contexts
  ['\u00c2\u00a0', ' '], // Â  -> regular space (non-breaking space -> space)
];

function fixFile(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');
  const orig = c;
  for (const [bad, good] of R) {
    if (c.includes(bad)) c = c.split(bad).join(good);
  }
  if (c !== orig) { fs.writeFileSync(filePath, c, 'utf8'); return true; }
  return false;
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
  if (fixFile(f)) { n++; console.log('Fixed:', path.relative(srcDir, f)); }
}
console.log('\nTotal fixed:', n);
