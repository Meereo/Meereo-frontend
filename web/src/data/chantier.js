// ═══════════════════════════════════════════════════════
//  MEEREO — Phases chantier BTP
//  7 phases avec étapes détaillées — source de vérité unique
//  Aligné avec PROJECT_PHASES de domain/status.js
// ═══════════════════════════════════════════════════════

export const CHANTIER_PHASES = [
  {
    code: 'CONCEPTION_ETUDES',
    name: 'Conception & Études',
    description: 'Relevés, faisabilité, esquisse, avant-projet, études techniques et permis',
    icon: '📐',
    mainPhases: ['ESQUISSE', 'AVANT_PROJET', 'PROJET_DETAILLE', 'PLANS_EXECUTION'],
    tasks: [
      { id: 'ce01', title: 'Relevé de mesures', defaultStatus: 'todo' },
      { id: 'ce02', title: 'Analyse du site', defaultStatus: 'todo' },
      { id: 'ce03', title: 'Faisabilité', defaultStatus: 'todo' },
      { id: 'ce04', title: 'Esquisse', defaultStatus: 'todo' },
      { id: 'ce05', title: 'Avant-projet', defaultStatus: 'todo' },
      { id: 'ce06', title: 'Projet détaillé', defaultStatus: 'todo' },
      { id: 'ce07', title: 'Estimation budgétaire', defaultStatus: 'todo' },
      { id: 'ce08', title: 'Études BET structure', defaultStatus: 'todo' },
      { id: 'ce09', title: 'Études BET fluides / CVC', defaultStatus: 'todo' },
      { id: 'ce10', title: 'Études techniques complémentaires', defaultStatus: 'todo' },
      { id: 'ce11', title: 'Plans d\'exécution', defaultStatus: 'todo' },
      { id: 'ce12', title: 'Dossier permis de construire', defaultStatus: 'todo' },
    ]
  },
  {
    code: 'PREPARATION_LANCEMENT',
    name: 'Préparation & Lancement',
    description: 'Consultations, analyse des offres, attribution des marchés et installation chantier',
    icon: '📋',
    mainPhases: ['CONSULTATION_ENTREPRISES', 'ATTRIBUTION_MARCHES'],
    tasks: [
      { id: 'pl01', title: 'Dossier de consultation', defaultStatus: 'todo' },
      { id: 'pl02', title: 'Lancement des consultations', defaultStatus: 'todo' },
      { id: 'pl03', title: 'Réception des offres', defaultStatus: 'todo' },
      { id: 'pl04', title: 'Analyse des offres', defaultStatus: 'todo' },
      { id: 'pl05', title: 'Comparaison des entreprises', defaultStatus: 'todo' },
      { id: 'pl06', title: 'Choix des entreprises', defaultStatus: 'todo' },
      { id: 'pl07', title: 'Négociation', defaultStatus: 'todo' },
      { id: 'pl08', title: 'Attribution des marchés', defaultStatus: 'todo' },
      { id: 'pl09', title: 'Signature des marchés', defaultStatus: 'todo' },
      { id: 'pl10', title: 'Planning chantier', defaultStatus: 'todo' },
      { id: 'pl11', title: 'Installation chantier', defaultStatus: 'todo' },
      { id: 'pl12', title: 'Préparation logistique', defaultStatus: 'todo' },
    ]
  },
  {
    code: 'GROS_OEUVRE',
    name: 'Gros Œuvre & Structure',
    description: 'Terrassement, fondations, structure et toiture',
    icon: '🏗️',
    mainPhases: ['SUIVI_CHANTIER'],
    tasks: [
      { id: 'go01', title: 'Implantation', defaultStatus: 'todo' },
      { id: 'go02', title: 'Terrassement', defaultStatus: 'todo' },
      { id: 'go03', title: 'Fondations', defaultStatus: 'todo' },
      { id: 'go04', title: 'Soubassement', defaultStatus: 'todo' },
      { id: 'go05', title: 'Dallage', defaultStatus: 'todo' },
      { id: 'go06', title: 'Poteaux / poutres / voiles', defaultStatus: 'todo' },
      { id: 'go07', title: 'Dalles', defaultStatus: 'todo' },
      { id: 'go08', title: 'Escaliers', defaultStatus: 'todo' },
      { id: 'go09', title: 'Charpente', defaultStatus: 'todo' },
      { id: 'go10', title: 'Toiture', defaultStatus: 'todo' },
      { id: 'go11', title: 'Maçonnerie structurelle', defaultStatus: 'todo' },
    ]
  },
  {
    code: 'SECOND_OEUVRE',
    name: 'Second Œuvre & Finitions',
    description: 'Cloisons, réseaux, menuiseries, revêtements et peinture',
    icon: '🔧',
    mainPhases: ['SUIVI_CHANTIER'],
    tasks: [
      { id: 'so01', title: 'Cloisons', defaultStatus: 'todo' },
      { id: 'so02', title: 'Enduits', defaultStatus: 'todo' },
      { id: 'so03', title: 'Faux plafonds', defaultStatus: 'todo' },
      { id: 'so04', title: 'Électricité', defaultStatus: 'todo' },
      { id: 'so05', title: 'Plomberie', defaultStatus: 'todo' },
      { id: 'so06', title: 'CVC / climatisation', defaultStatus: 'todo' },
      { id: 'so07', title: 'Menuiseries intérieures', defaultStatus: 'todo' },
      { id: 'so08', title: 'Menuiseries extérieures', defaultStatus: 'todo' },
      { id: 'so09', title: 'Revêtements sols', defaultStatus: 'todo' },
      { id: 'so10', title: 'Revêtements murs', defaultStatus: 'todo' },
      { id: 'so11', title: 'Peinture', defaultStatus: 'todo' },
      { id: 'so12', title: 'Équipements sanitaires', defaultStatus: 'todo' },
      { id: 'so13', title: 'Éclairage', defaultStatus: 'todo' },
      { id: 'so14', title: 'Finitions finales', defaultStatus: 'todo' },
    ]
  },
  {
    code: 'MATERIAUX_EQUIPEMENTS',
    name: 'Matériaux & Équipements Client',
    description: 'Sélection, validation, commande et livraison des matériaux et équipements',
    icon: '📦',
    mainPhases: ['SUIVI_CHANTIER'],
    tasks: [
      { id: 'me01', title: 'Sélection des matériaux', defaultStatus: 'todo' },
      { id: 'me02', title: 'Validation client', defaultStatus: 'todo' },
      { id: 'me03', title: 'Sélection sanitaires', defaultStatus: 'todo' },
      { id: 'me04', title: 'Sélection luminaires', defaultStatus: 'todo' },
      { id: 'me05', title: 'Sélection équipements', defaultStatus: 'todo' },
      { id: 'me06', title: 'Demande de devis', defaultStatus: 'todo' },
      { id: 'me07', title: 'Validation budget', defaultStatus: 'todo' },
      { id: 'me08', title: 'Commande', defaultStatus: 'todo' },
      { id: 'me09', title: 'Livraison chantier', defaultStatus: 'todo' },
      { id: 'me10', title: 'Vérification conformité', defaultStatus: 'todo' },
    ]
  },
  {
    code: 'MOBILIER_DECORATION',
    name: 'Mobilier & Décoration',
    description: 'Sélection, commande et installation du mobilier et de la décoration',
    icon: '🛋️',
    mainPhases: ['SUIVI_CHANTIER'],
    tasks: [
      { id: 'md01', title: 'Sélection mobilier', defaultStatus: 'todo' },
      { id: 'md02', title: 'Sélection décoration', defaultStatus: 'todo' },
      { id: 'md03', title: 'Validation client', defaultStatus: 'todo' },
      { id: 'md04', title: 'Commande', defaultStatus: 'todo' },
      { id: 'md05', title: 'Livraison', defaultStatus: 'todo' },
      { id: 'md06', title: 'Réception', defaultStatus: 'todo' },
      { id: 'md07', title: 'Installation', defaultStatus: 'todo' },
      { id: 'md08', title: 'Mise en place finale', defaultStatus: 'todo' },
    ]
  },
  {
    code: 'RECEPTION_LIVRAISON',
    name: 'Réception & Livraison',
    description: 'Vérifications finales, réception, réserves et remise des clés',
    icon: '✅',
    mainPhases: ['RECEPTION'],
    tasks: [
      { id: 'rl01', title: 'Nettoyage fin chantier', defaultStatus: 'todo' },
      { id: 'rl02', title: 'Vérifications finales', defaultStatus: 'todo' },
      { id: 'rl03', title: 'Pré-réception', defaultStatus: 'todo' },
      { id: 'rl04', title: 'Réception', defaultStatus: 'todo' },
      { id: 'rl05', title: 'Réserves', defaultStatus: 'todo' },
      { id: 'rl06', title: 'Levée des réserves', defaultStatus: 'todo' },
      { id: 'rl07', title: 'DOE / documents finaux', defaultStatus: 'todo' },
      { id: 'rl08', title: 'Remise des clés', defaultStatus: 'todo' },
      { id: 'rl09', title: 'Livraison finale', defaultStatus: 'todo' },
    ]
  },
]

export const ANNUAIRE_PLATEFORME = []

export const RECENT_ACTIVITY = []
