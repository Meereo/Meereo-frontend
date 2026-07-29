const projects = [
  { id: "proj_1", nom: "Residence les Palmiers", ville: "Abidjan",    avance: 62, retard: 4,  budget: 78 },
  { id: "proj_2", nom: "Residence Bellevue",     ville: "Lyon",       avance: 45, retard: 10, budget: 60 },
  { id: "proj_3", nom: "Immeuble Azur",          ville: "Casablanca", avance: 73, retard: 2,  budget: 85 },
  { id: "proj_4", nom: "Residence des Jardins",  ville: "Toulouse",   avance: 58, retard: 6,  budget: 70 },
  { id: "proj_5", nom: "Tour Horizon",           ville: "Montreal",   avance: 80, retard: 1,  budget: 90 },
];

const invoices = [
  { id: "inv_1", fournisseur: "BetonPlus",         montant: "4,3 M FCFA", ecart_bdc: "+6%" },
  { id: "inv_2", fournisseur: "CimentPro",         montant: "5,1 M FCFA", ecart_bdc: "+3%" },
  { id: "inv_3", fournisseur: "Granulats Express", montant: "3,8 M FCFA", ecart_bdc: "-2%" },
  { id: "inv_4", fournisseur: "BTP Materiaux",     montant: "6,2 M FCFA", ecart_bdc: "+8%" },
  { id: "inv_5", fournisseur: "AfricBeton",        montant: "4,0 M FCFA", ecart_bdc: "+1%" },
];

const users = [
  { id: "user_demo",  prenom: "Demo",    type: "client",     tier: "standard" },
  { id: "user_archi", prenom: "Sophie",  type: "architect",  tier: "pro" },
  { id: "user_entr",  prenom: "Moussa",  type: "enterprise", tier: "standard" },
  { id: "user_fourn", prenom: "Amadou",  type: "supplier",   tier: "standard" },
  { id: "user_bet",   prenom: "Claire",  type: "bet",        tier: "pro" },
];

const marketplace = [
  { id: "mp_1", nom: "Ciment Portland CEM II",  fournisseur: "CimentPro",   prix: "85 000 FCFA/t", disponible: true },
  { id: "mp_2", nom: "Acier HA Fe500",          fournisseur: "AfricBeton",   prix: "650 000 FCFA/t", disponible: true },
  { id: "mp_3", nom: "Brique creuse 20x20x50",  fournisseur: "BTP Materiaux", prix: "350 FCFA/u", disponible: false },
  { id: "mp_4", nom: "Gravier concasse 15/25",  fournisseur: "Granulats Express", prix: "18 000 FCFA/m3", disponible: true },
];

let incidentCount = 2;

export const mockProvider = {
  // Projets
  getProjects() { return projects; },
  getProjectById(id) { return projects.find(p => p.id === id) || null; },

  // Factures
  getInvoices() { return invoices; },
  getInvoiceById(id) { return invoices.find(f => f.id === id) || null; },

  // Incidents
  getIncidentCount() { return incidentCount; },

  // Utilisateurs
  getUsers() { return users; },
  getUserById(id) { return users.find(u => u.id === id) || null; },

  // Marketplace
  getMarketplace() { return marketplace; },
  getMarketplaceById(id) { return marketplace.find(m => m.id === id) || null; },

  // Activite globale
  getGlobalActivity() {
    return {
      chantiers: projects.length,
      avancement_moyen: Math.round(projects.reduce((s, p) => s + p.avance, 0) / projects.length),
      en_retard: projects.filter(p => p.retard > 0).length,
      factures_en_attente: invoices.length,
      incidents: incidentCount,
      produits_marketplace: marketplace.length,
      utilisateurs: users.length,
    };
  },
};
