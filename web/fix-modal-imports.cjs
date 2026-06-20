const fs = require('fs')
const base = 'C:/Users/samy7/Documents/GitHub/Meereo-frontend/web/src/pages/cockpit/'
const files = ['Clients.jsx','Contractors.jsx','Contracts.jsx','Offers.jsx','Orders.jsx','Reports.jsx','Suppliers.jsx','Worksite.jsx']
const imp = "import Modal from '../../components/shared/Modal'\n"
let count = 0
files.forEach(f => {
  let t = fs.readFileSync(base + f, 'utf8')
  if (!t.includes('import Modal from')) {
    const nl = t.indexOf('\n')
    t = t.slice(0, nl + 1) + imp + t.slice(nl + 1)
    fs.writeFileSync(base + f, t)
    count++
    console.log('Fixed: ' + f)
  }
})
console.log('Done:', count, 'files fixed')
