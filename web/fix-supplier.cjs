const fs = require('fs');

// Fix Supplier.jsx: update nav keys from French to English + remove duplicate Settings import
let path = 'C:/Users/samy7/Documents/GitHub/Meereo-frontend/web/src/pages/supplier/Supplier.jsx';
let c = fs.readFileSync(path, 'utf8');

// Remove Settings from lucide import (it's unused as an icon, conflicts with page import)
c = c.replace(', Settings,', ',').replace(', Settings ', ' ');

// Fix nav color map keys
c = c.split("commandes:'#F59E0B'").join("orders:'#F59E0B'");
c = c.split("paiements:'#16A34A'").join("payments:'#16A34A'");
c = c.split("parametres:'#6B7280'").join("settings:'#6B7280'");

// Fix view arrays in nav groups
c = c.split("'commandes'").join("'orders'");
c = c.split("'paiements'").join("'payments'");
c = c.split("'parametres'").join("'settings'");

// Fix api calls remain unchanged (api.commandes is the backend endpoint, not a page)
// but view comparisons and nav arrays need fixing

// Fix view === 'commandes' etc. already done above via split/join

fs.writeFileSync(path, c, 'utf8');
console.log('Fixed Supplier.jsx nav keys and Settings import conflict');
