const fs = require('fs'), path = require('path')
const src = path.join(__dirname, 'src')

// Symbols to verify: if used in a file, must be imported or defined locally
const checks = [
  'useMeereo', 'useMergedData', 'useDevise', 'useNavigate', 'useIsMobile',
  'formatDateFR', 'exportCSV', 'createPortal',
  'MoneyInput', 'Modal', 'AoGear', 'DSPageHeader', 'DSKpiStrip',
  'DSFilterBar', 'DSStatusBadge', 'DSSearchBar', 'DSEmptyState',
]

function walk(dir) {
  let r = []
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f)
    if (fs.statSync(fp).isDirectory()) r = r.concat(walk(fp))
    else if (fp.endsWith('.jsx') || fp.endsWith('.js')) r.push(fp)
  }
  return r
}

const issues = []
for (const fp of walk(src)) {
  const c = fs.readFileSync(fp, 'utf8')
  const name = path.relative(src, fp).replace(/\\/g, '/')
  for (const h of checks) {
    const used = new RegExp('\\b' + h + '\\b').test(c)
    const imported = new RegExp('import[^;\\n]+\\b' + h + '\\b').test(c)
    const defined = new RegExp('(function|const|class)\\s+' + h + '\\b').test(c)
    if (used && !imported && !defined) issues.push(name + ': ' + h)
  }
}

if (!issues.length) console.log('✓ All clear — no missing imports found')
else {
  console.log(`✗ ${issues.length} missing import(s):\n`)
  issues.forEach(i => console.log('  ' + i))
}
