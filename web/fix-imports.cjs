const fs = require('fs');
const base = 'C:/Users/samy7/Documents/GitHub/Meereo-frontend/web/src';

// ─── App.jsx ───
let appPath = base + '/App.jsx';
let app = fs.readFileSync(appPath, 'utf8');
app = app
  .replace("import Fournisseur from './pages/fournisseur/Fournisseur'", "import Supplier from './pages/supplier/Supplier'")
  .replace("import ProfilApp from './pages/cockpit/profil/ProfilApp'", "import Profile from './pages/cockpit/profile/Profile'")
  .replace("import Confidentialite from './pages/Confidentialite'", "import Privacy from './pages/Privacy'")
  .replace(/<Fournisseur /g, '<Supplier ')
  .replace(/<ProfilApp /g, '<Profile ')
  .replace(/<Confidentialite /g, '<Privacy ')
  .replace(/Fournisseur\b/g, (m, offset) => app.slice(0, offset).includes('import Supplier') ? 'Supplier' : m);
// Re-read and do careful replacements
app = fs.readFileSync(appPath, 'utf8');
const appFixes = [
  ["import Fournisseur from './pages/fournisseur/Fournisseur'", "import Supplier from './pages/supplier/Supplier'"],
  ["import ProfilApp from './pages/cockpit/profil/ProfilApp'", "import Profile from './pages/cockpit/profile/Profile'"],
  ["import Confidentialite from './pages/Confidentialite'", "import Privacy from './pages/Privacy'"],
  ['element={<Fournisseur', 'element={<Supplier'],
  ['element={<ProfilApp', 'element={<Profile'],
  ['element={<Confidentialite', 'element={<Privacy'],
  ['<Fournisseur />', '<Supplier />'],
  ['<ProfilApp />', '<Profile />'],
  ['<Confidentialite />', '<Privacy />'],
];
for (const [o, n] of appFixes) app = app.split(o).join(n);
fs.writeFileSync(appPath, app, 'utf8');
console.log('Updated App.jsx');

// ─── Cockpit.jsx ───
let cockpitPath = base + '/pages/cockpit/Cockpit.jsx';
let cockpit = fs.readFileSync(cockpitPath, 'utf8');
const cockpitFixes = [
  ["import('./Projets')", "import('./Projects')"],
  ["import('./Chantier')", "import('./Worksite')"],
  ["import('./Intervenants')", "import('./Contractors')"],
  ["import('./Paiements')", "import('./Payments')"],
  ["import('./Offres')", "import('./Offers')"],
  ["import('./Bourse')", "import('./Exchange')"],
  ["import('./Parametres')", "import('./Settings')"],
  ["import('./Marches')", "import('./Contracts')"],
  ["import('./Rapports')", "import('./Reports')"],
  ["import('./Commandes')", "import('./Orders')"],
  ["import('./Fournisseurs')", "import('./Suppliers')"],
  ['const Projets = ', 'const Projects = '],
  ['const Chantier = ', 'const Worksite = '],
  ['const Intervenants = ', 'const Contractors = '],
  ['const Paiements = ', 'const Payments = '],
  ['const Offres = ', 'const Offers = '],
  ['const Bourse = ', 'const Exchange = '],
  ['const Parametres = ', 'const Settings = '],
  ['const Marches = ', 'const Contracts = '],
  ['const Rapports = ', 'const Reports = '],
  ['const Commandes = ', 'const Orders = '],
  ['const Fournisseurs = ', 'const Suppliers = '],
  ['projets: Projets,', 'projets: Projects,'],
  ['chantier: Chantier,', 'chantier: Worksite,'],
  ['intervenants: Intervenants,', 'intervenants: Contractors,'],
  ['paiements: Paiements,', 'paiements: Payments,'],
  ['offres: Offres,', 'offres: Offers,'],
  ['bourse: Bourse,', 'bourse: Exchange,'],
  ['parametres: Parametres,', 'parametres: Settings,'],
  ['marches: Marches,', 'marches: Contracts,'],
  ['rapports: Rapports,', 'rapports: Reports,'],
  ['commandes: Commandes,', 'commandes: Orders,'],
  ['fournisseurs: Fournisseurs,', 'fournisseurs: Suppliers,'],
];
for (const [o, n] of cockpitFixes) cockpit = cockpit.split(o).join(n);
fs.writeFileSync(cockpitPath, cockpit, 'utf8');
console.log('Updated Cockpit.jsx');

// ─── Client.jsx ───
let clientPath = base + '/pages/client/Client.jsx';
let client = fs.readFileSync(clientPath, 'utf8');
const clientFixes = [
  ["import('../cockpit/Bourse')", "import('../cockpit/Exchange')"],
  ["import('../cockpit/Offres')", "import('../cockpit/Offers')"],
  ["import('../cockpit/Marches')", "import('../cockpit/Contracts')"],
  ["import('../cockpit/Commandes')", "import('../cockpit/Orders')"],
  ["import('../cockpit/Fournisseurs')", "import('../cockpit/Suppliers')"],
  ["import('../cockpit/Projets')", "import('../cockpit/Projects')"],
  ['const Bourse = ', 'const Exchange = '],
  ['const Offres = ', 'const Offers = '],
  ['const Marches = ', 'const Contracts = '],
  ['const Commandes = ', 'const Orders = '],
  ['const Fournisseurs = ', 'const Suppliers = '],
  ['const Projets = ', 'const Projects = '],
  ["import Avancement from './Avancement'", "import Progress from './Progress'"],
  ["import Parametres from './Parametres'", "import Settings from './Settings'"],
  // JSX usages
  ['{page === \'avancement\' && <Avancement ctx=', "{page === 'avancement' && <Progress ctx="],
  ['{page === \'parametres\' && <Parametres ctx=', "{page === 'parametres' && <Settings ctx="],
  ['{page === \'fournisseurs\' && <Fournisseurs ', "{page === 'fournisseurs' && <Suppliers "],
  ['{page === \'commandes\' && <Commandes ', "{page === 'commandes' && <Orders "],
  ['{page === \'offres\' && <Offres ', "{page === 'offres' && <Offers "],
  ['{page === \'marches\' && <Marches ', "{page === 'marches' && <Contracts "],
  ['{page === \'projets\' && ', "{page === 'projets' && "],
  ['<Bourse ', '<Exchange '],
  ['<Offres ', '<Offers '],
  ['<Marches ', '<Contracts '],
  ['<Commandes ', '<Orders '],
  ['<Fournisseurs ', '<Suppliers '],
  ['<Projets ', '<Projects '],
];
for (const [o, n] of clientFixes) client = client.split(o).join(n);
fs.writeFileSync(clientPath, client, 'utf8');
console.log('Updated Client.jsx');

// ─── Supplier.jsx (was Fournisseur.jsx) ───
let supPath = base + '/pages/supplier/Supplier.jsx';
let sup = fs.readFileSync(supPath, 'utf8');
const supFixes = [
  ["import('../cockpit/Marketplace')", "import('../cockpit/Marketplace')"],  // unchanged
  // Fix supplier-internal pages
  ["import('./Commandes')", "import('./Orders')"],
  ["import('./Paiements')", "import('./Payments')"],
  ["import('./Parametres')", "import('./Settings')"],
  ['const Commandes = ', 'const Orders = '],
  ['const Paiements = ', 'const Payments = '],
  ['const Parametres = ', 'const Settings = '],
  ['page === \'commandes\'', "page === 'orders'"],
  ['page === \'paiements\'', "page === 'payments'"],
  ['page === \'parametres\'', "page === 'settings'"],
  ['setPage(\'commandes\')', "setPage('orders')"],
  ['setPage(\'paiements\')', "setPage('payments')"],
  ['setPage(\'parametres\')', "setPage('settings')"],
  ['<Commandes ', '<Orders '],
  ['<Paiements ', '<Payments '],
  ['<Parametres ', '<Settings '],
];
for (const [o, n] of supFixes) sup = sup.split(o).join(n);
fs.writeFileSync(supPath, sup, 'utf8');
console.log('Updated Supplier.jsx');

console.log('All import fixes done');
