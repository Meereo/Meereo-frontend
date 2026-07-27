// ─────────────────────────────────────────────────────────────────────────────
// constants.js — Section templates based on MEEREO Page Pro doc (33 variants)
// QAL-04 : accents corrigés sur tous les labels et contenus
// INS-17 : aucun contenu d'exemple — les modules vides affichent un état vide
// ─────────────────────────────────────────────────────────────────────────────

let _id = 1;
export const genId = () => `section-${_id++}`;

// ── Categories shown in the left sidebar ─────────────────────────────────────
export const SECTION_CATEGORIES = [
  { id: "hero",           label: "En-tête" },
  { id: "presentation",   label: "Présentation" },
  { id: "kpi",            label: "Chiffres clés" },
  { id: "expertise",      label: "Domaines d'expertise" },
  { id: "portfolio",      label: "Portfolio" },
  { id: "team",           label: "Équipe" },
  { id: "certifications", label: "Certifications" },
  { id: "references",     label: "Références" },
  // AVS-01 : la section « Avis » est entièrement générée par le système (source centralisée).
  // Elle n'est plus proposée à l'édition manuelle dans la palette.
  { id: "coordinates",    label: "Coordonnées" },
  { id: "contact",        label: "Contact" },
];

// ── Section templates ────────────────────────────────────────────────────────
// INS-17 : les defaultData ne contiennent AUCUNE donnée d'exemple.
// Les champs dérivés (companyName, category, location, verified) sont injectés
// à l'exécution depuis le profil — jamais saisis manuellement.
export const SECTION_TEMPLATES = [

  // ── 01 EN-TÊTE ──────────────────────────────────────────────────────────
  {
    type: "hero-banner",
    category: "hero",
    name: "En-tête — Bannière",
    defaultData: {
      companyName: "",
      category: "",
      location: "",
      verified: false,
      coverSrc: "",
      ctaText: "Contacter",
      secondaryText: "Inviter dans un projet",
    },
  },
  {
    type: "hero-editorial",
    category: "hero",
    name: "En-tête — Éditorial",
    defaultData: {
      companyName: "",
      category: "",
      location: "",
      verified: false,
      slogan: "",
      url: "",
      ctaText: "Contacter",
      secondaryText: "Inviter dans un projet",
    },
  },
  {
    type: "hero-compact",
    category: "hero",
    name: "En-tête — Compact",
    defaultData: {
      companyName: "",
      category: "",
      location: "",
      verified: false,
      ctaText: "Contacter",
      secondaryText: "Inviter dans un projet",
    },
  },

  // ── 02 PRÉSENTATION ─────────────────────────────────────────────────────
  {
    type: "pres-essay",
    category: "presentation",
    name: "Présentation — Essai",
    defaultData: {
      title: "",
      paragraphs: [],
      values: [],
    },
  },
  {
    type: "pres-manifesto",
    category: "presentation",
    name: "Présentation — Manifeste",
    defaultData: {
      lead: "",
      columns: [],
    },
  },
  {
    type: "pres-dossier",
    category: "presentation",
    name: "Présentation — Dossier",
    defaultData: {
      sections: [],
    },
  },

  // ── 03 CHIFFRES CLÉS ────────────────────────────────────────────────────
  {
    type: "kpi-band",
    category: "kpi",
    name: "Chiffres clés — Bandeau",
    defaultData: {
      items: [],
    },
  },
  {
    type: "kpi-cards",
    category: "kpi",
    name: "Chiffres clés — Cartouches",
    defaultData: {
      items: [],
    },
  },
  {
    type: "kpi-prose",
    category: "kpi",
    name: "Chiffres clés — Phrase augmentée",
    defaultData: {
      prose: "",
    },
  },

  // ── 04 DOMAINES D'EXPERTISE ─────────────────────────────────────────────
  {
    type: "expertise-table",
    category: "expertise",
    name: "Expertise — Nomenclature",
    defaultData: {
      domains: [],
    },
  },
  {
    type: "expertise-mosaic",
    category: "expertise",
    name: "Expertise — Mosaïque",
    defaultData: {
      domains: [],
    },
  },
  {
    type: "expertise-bars",
    category: "expertise",
    name: "Expertise — Répartition",
    defaultData: {
      note: "",
      domains: [],
    },
  },

  // ── 05 PORTFOLIO ────────────────────────────────────────────────────────
  {
    type: "portfolio-magazine",
    category: "portfolio",
    name: "Portfolio — Grille magazine",
    defaultData: {
      title: "Réalisations",
      subtitle: "",
      projects: [],
    },
  },
  {
    type: "portfolio-planches",
    category: "portfolio",
    name: "Portfolio — Planches",
    defaultData: {
      title: "Réalisations",
      projects: [],
    },
  },
  {
    type: "portfolio-asymmetric",
    category: "portfolio",
    name: "Portfolio — Mur asymétrique",
    defaultData: {
      title: "Réalisations",
      projects: [],
    },
  },

  // ── 06 ÉQUIPE ───────────────────────────────────────────────────────────
  {
    type: "team-portraits",
    category: "team",
    name: "Équipe — Portraits",
    defaultData: {
      title: "L'équipe",
      members: [],
    },
  },
  {
    type: "team-directory",
    category: "team",
    name: "Équipe — Annuaire",
    defaultData: {
      title: "L'équipe",
      members: [],
    },
  },
  {
    type: "team-leadership",
    category: "team",
    name: "Équipe — Direction + équipe",
    defaultData: {
      title: "L'équipe",
      members: [],
    },
  },

  // ── 07 CERTIFICATIONS ───────────────────────────────────────────────────
  {
    type: "cert-register",
    category: "certifications",
    name: "Certifications — Registre",
    defaultData: {
      certs: [],
    },
  },
  {
    type: "cert-seals",
    category: "certifications",
    name: "Certifications — Sceaux",
    defaultData: {
      certs: [],
    },
  },
  {
    type: "cert-line",
    category: "certifications",
    name: "Certifications — Ligne",
    defaultData: {
      certs: [],
    },
  },

  // ── 08 RÉFÉRENCES ───────────────────────────────────────────────────────
  {
    type: "ref-casestudy",
    category: "references",
    name: "Références — Étude de cas",
    defaultData: {
      references: [],
    },
  },
  {
    type: "ref-table",
    category: "references",
    name: "Références — Table",
    defaultData: {
      references: [],
    },
  },
  {
    type: "ref-cards",
    category: "references",
    name: "Références — Cartes contexte",
    defaultData: {
      references: [],
    },
  },

  // ── 09 AVIS ET SATISFACTION ─────────────────────────────────────────────

  // ── 10 COORDONNÉES ──────────────────────────────────────────────────────
  {
    type: "coord-map",
    category: "coordinates",
    name: "Coordonnées — Bloc carte",
    defaultData: {
      address: "",
      phone: "",
      email: "",
      url: "",
    },
  },
  {
    type: "coord-sheet",
    category: "coordinates",
    name: "Coordonnées — Fiche",
    defaultData: {
      address: "",
      phone: "",
      email: "",
      website: "",
      socials: "",
    },
  },
  {
    type: "coord-footer",
    category: "coordinates",
    name: "Coordonnées — Pied de page",
    defaultData: {
      companyName: "",
      category: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      url: "",
    },
  },

  // ── 11 CONTACT ──────────────────────────────────────────────────────────
  {
    type: "contact-actions",
    category: "contact",
    name: "Contact — Panneau d'actions",
    defaultData: {
      eyebrow: "",
      actions: [
        { id: "a1", title: "Envoyer un message", description: "Ouvre une conversation privée avec l'agence dans le Communication Hub.", meta: "RÉPONSE SOUS 24 H OUVRÉES" },
        { id: "a2", title: "Demander un rendez-vous", description: "Proposez un créneau ; l'agence confirme depuis son Cockpit.", meta: "EN AGENCE OU À DISTANCE" },
        { id: "a3", title: "Inviter dans un projet", description: "Associez l'agence à l'un de vos projets MEEREO existants.", meta: "INVITATION HISTORISÉE" },
      ],
      links: [
        { id: "l1", label: "Enregistrer en favoris" },
        { id: "l2", label: "Partager la page" },
        { id: "l3", label: "Copier le lien" },
      ],
    },
  },
  {
    type: "contact-form",
    category: "contact",
    name: "Contact — Formulaire",
    defaultData: {
      title: "",
      note: "Votre message ouvre une conversation « Prise de contact » dans le Communication Hub.",
      submitText: "Envoyer le message",
      altLinks: [
        { id: "l1", label: "Demander un rendez-vous" },
        { id: "l2", label: "Inviter dans un projet" },
      ],
    },
  },
  {
    type: "contact-band",
    category: "contact",
    name: "Contact — Bande",
    defaultData: {
      headline: "",
      ctaText: "Envoyer un message",
      secondaryText: "Inviter dans un projet",
    },
  },
];

// ── Default page (pre-loaded in canvas) ──────────────────────────────────────
export const DEFAULT_PAGE = [
  {
    id: "section-d1",
    type: "hero-banner",
    data: { ...SECTION_TEMPLATES.find((t) => t.type === "hero-banner").defaultData },
  },
  {
    id: "section-d2",
    type: "pres-manifesto",
    data: { ...SECTION_TEMPLATES.find((t) => t.type === "pres-manifesto").defaultData },
  },
];
