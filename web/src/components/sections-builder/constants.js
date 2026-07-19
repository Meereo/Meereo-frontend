// ─────────────────────────────────────────────────────────────────────────────
// constants.js — Section templates based on MEEREO Page Pro doc (33 variants)
// ─────────────────────────────────────────────────────────────────────────────

let _id = 1;
export const genId = () => `section-${_id++}`;

// ── Categories shown in the left sidebar ─────────────────────────────────────
export const SECTION_CATEGORIES = [
  { id: "hero",           label: "En-tete" },
  { id: "presentation",   label: "Presentation" },
  { id: "kpi",            label: "Chiffres cles" },
  { id: "expertise",      label: "Domaines d'expertise" },
  { id: "portfolio",      label: "Portfolio" },
  { id: "team",           label: "Equipe" },
  { id: "certifications", label: "Certifications" },
  { id: "references",     label: "References" },
  { id: "reviews",        label: "Avis" },
  { id: "coordinates",    label: "Coordonnees" },
  { id: "contact",        label: "Contact" },
];

// ── Section templates ────────────────────────────────────────────────────────
export const SECTION_TEMPLATES = [

  // ── 01 EN-TETE ───────────────────────────────────────────────────────────
  {
    type: "hero-banner",
    category: "hero",
    name: "En-tete — Banniere",
    defaultData: {
      companyName: "Votre Entreprise",
      category: "Bureau d'architecture",
      location: "ABIDJAN \u00B7 COTE D'IVOIRE",
      verified: true,
      coverSrc: "",
      ctaText: "Contacter",
      secondaryText: "Inviter dans un projet",
    },
  },
  {
    type: "hero-editorial",
    category: "hero",
    name: "En-tete — Editorial",
    defaultData: {
      companyName: "Votre Entreprise",
      category: "Bureau d'architecture",
      location: "Abidjan, Cote d'Ivoire",
      verified: true,
      slogan: "Architecture residentielle et tertiaire en Afrique de l'Ouest.",
      url: "meereo.com/pro/votre-entreprise",
      ctaText: "Contacter",
      secondaryText: "Inviter dans un projet",
    },
  },
  {
    type: "hero-compact",
    category: "hero",
    name: "En-tete — Compact",
    defaultData: {
      companyName: "Votre Entreprise",
      category: "Bureau d'architecture",
      location: "ABIDJAN \u00B7 COTE D'IVOIRE",
      verified: true,
      ctaText: "Contacter",
      secondaryText: "Inviter dans un projet",
    },
  },

  // ── 02 PRESENTATION ──────────────────────────────────────────────────────
  {
    type: "pres-essay",
    category: "presentation",
    name: "Presentation — Essai",
    defaultData: {
      title: "Une architecture ancree dans son climat et son usage",
      paragraphs: [
        "Fonde a Abidjan en 2014, Votre Entreprise concoit des batiments residentiels et tertiaires penses pour le climat ouest-africain : ventilation naturelle, protection solaire, materiaux locaux.",
        "L'agence accompagne ses clients de l'esquisse a la reception, avec une methode documentee a chaque etape.",
      ],
      values: [
        { id: "v1", label: "Vision", text: "Faire de chaque contrainte de site un parti architectural." },
        { id: "v2", label: "Valeurs", text: "Rigueur documentaire, sobriete des moyens, durabilite des ouvrages." },
        { id: "v3", label: "Specialites", text: "Logement collectif, villas, sieges d'entreprise, renovation lourde." },
      ],
    },
  },
  {
    type: "pres-manifesto",
    category: "presentation",
    name: "Presentation — Manifeste",
    defaultData: {
      lead: "Nous concevons des batiments <b>simples a vivre et durables a entretenir</b>, du premier trait a la reception.",
      columns: [
        { id: "c1", label: "Histoire", text: "Agence fondee a Abidjan en 2014, active en Cote d'Ivoire, au Ghana et au Senegal." },
        { id: "c2", label: "Vision", text: "Une architecture climatique, econome et documentee, au service de l'usage." },
        { id: "c3", label: "Valeurs", text: "Rigueur, sobriete, tracabilite des decisions sur toute la duree du projet." },
      ],
    },
  },
  {
    type: "pres-dossier",
    category: "presentation",
    name: "Presentation — Dossier",
    defaultData: {
      sections: [
        { id: "s1", title: "Histoire", text: "Creee en 2014 par deux architectes, l'agence a livre 47 projets en Cote d'Ivoire et dans la sous-region." },
        { id: "s2", title: "Vision", text: "Concevoir avec le climat plutot que contre lui : orientation, inertie, ombrage et ventilation naturelle." },
        { id: "s3", title: "Valeurs", text: "Chaque projet est documente de bout en bout ; chaque engagement est trace et verifiable." },
      ],
    },
  },

  // ── 03 CHIFFRES CLES ─────────────────────────────────────────────────────
  {
    type: "kpi-band",
    category: "kpi",
    name: "Chiffres cles — Bandeau",
    defaultData: {
      items: [
        { id: "k1", value: "2014", label: "Annee de creation" },
        { id: "k2", value: "18", label: "Collaborateurs" },
        { id: "k3", value: "47", label: "Projets realises" },
        { id: "k4", value: "3", label: "Pays d'intervention" },
        { id: "k5", value: "6", label: "Domaines d'expertise" },
      ],
    },
  },
  {
    type: "kpi-cards",
    category: "kpi",
    name: "Chiffres cles — Cartouches",
    defaultData: {
      items: [
        { id: "k1", value: "2014", label: "Creation", note: "Abidjan, Cote d'Ivoire" },
        { id: "k2", value: "18", label: "Equipe", note: "architectes et techniciens" },
        { id: "k3", value: "47", label: "Projets", note: "livres depuis la creation" },
        { id: "k4", value: "3", label: "Pays", note: "Cote d'Ivoire, Ghana, Senegal" },
        { id: "k5", value: "6", label: "Domaines", note: "du logement au tertiaire" },
      ],
    },
  },
  {
    type: "kpi-prose",
    category: "kpi",
    name: "Chiffres cles — Phrase augmentee",
    defaultData: {
      prose: 'Depuis <span class="pp-kpi-c-n">2014</span>, une equipe de <span class="pp-kpi-c-n">18</span> collaborateurs a livre <span class="pp-kpi-c-n">47</span> projets dans <span class="pp-kpi-c-n">3</span> pays, sur <span class="pp-kpi-c-n">6</span> domaines d\'expertise.',
    },
  },

  // ── 04 DOMAINES D'EXPERTISE ──────────────────────────────────────────────
  {
    type: "expertise-table",
    category: "expertise",
    name: "Expertise — Nomenclature",
    defaultData: {
      domains: [
        { id: "d1", name: "Logements individuels", scope: "Conception, extension, permis de construire, suivi de chantier." },
        { id: "d2", name: "Immeubles residentiels", scope: "Programmation, conception, coordination des etudes techniques." },
        { id: "d3", name: "Batiments tertiaires", scope: "Sieges d'entreprise, plateaux de bureaux, amenagements." },
        { id: "d4", name: "Renovation", scope: "Renovation lourde, mise aux normes, rehabilitation." },
        { id: "d5", name: "Extension", scope: "Surelevations et extensions en site occupe." },
        { id: "d6", name: "Amenagement interieur", scope: "Conception des espaces interieurs." },
      ],
    },
  },
  {
    type: "expertise-mosaic",
    category: "expertise",
    name: "Expertise — Mosaique",
    defaultData: {
      domains: [
        { id: "d1", name: "Logements individuels" },
        { id: "d2", name: "Immeubles residentiels" },
        { id: "d3", name: "Batiments tertiaires" },
        { id: "d4", name: "Batiments industriels" },
        { id: "d5", name: "Renovation" },
        { id: "d6", name: "Extension" },
        { id: "d7", name: "Amenagement interieur" },
      ],
    },
  },
  {
    type: "expertise-bars",
    category: "expertise",
    name: "Expertise — Repartition",
    defaultData: {
      note: "Repartition des 47 projets realises.",
      domains: [
        { id: "d1", name: "Logements individuels", percent: 30, count: "14" },
        { id: "d2", name: "Immeubles residentiels", percent: 23, count: "11" },
        { id: "d3", name: "Batiments tertiaires", percent: 19, count: "9" },
        { id: "d4", name: "Renovation", percent: 13, count: "6" },
        { id: "d5", name: "Extension", percent: 9, count: "4" },
        { id: "d6", name: "Amenagement interieur", percent: 6, count: "3" },
      ],
    },
  },

  // ── 05 PORTFOLIO ─────────────────────────────────────────────────────────
  {
    type: "portfolio-magazine",
    category: "portfolio",
    name: "Portfolio — Grille magazine",
    defaultData: {
      title: "Realisations",
      subtitle: "47 PROJETS \u00B7 2014\u20132025",
      projects: [
        { id: "p1", title: "Villa Palmeraie", location: "Assinie", year: "2025", mission: "Conception architecturale", src: "" },
        { id: "p2", title: "Residence Ivoire", location: "Cocody", year: "2024", mission: "Conception architecturale", src: "" },
        { id: "p3", title: "Immeuble Lagune", location: "Plateau", year: "2023", mission: "Conception architecturale", src: "" },
      ],
    },
  },
  {
    type: "portfolio-planches",
    category: "portfolio",
    name: "Portfolio — Planches",
    defaultData: {
      title: "Realisations",
      projects: [
        { id: "p1", title: "Residence Ivoire", location: "Cocody, Abidjan", year: "2024", mission: "Conception architecturale", description: "Trente-deux logements traversants organises autour d'un coeur d'ilot plante.", src: "" },
        { id: "p2", title: "Siege Horizon", location: "Marcory, Abidjan", year: "2022", mission: "Conception et suivi de chantier", description: "Siege d'entreprise de 4 200 m2 : double peau brise-soleil, plateaux libres.", src: "" },
      ],
    },
  },
  {
    type: "portfolio-asymmetric",
    category: "portfolio",
    name: "Portfolio — Mur asymetrique",
    defaultData: {
      title: "Realisations",
      projects: [
        { id: "p1", title: "Villa Palmeraie", location: "Assinie", year: "2025", src: "" },
        { id: "p2", title: "Residence Ivoire", location: "Cocody", year: "2024", src: "" },
        { id: "p3", title: "Immeuble Lagune", location: "Plateau", year: "2023", src: "" },
      ],
    },
  },

  // ── 06 EQUIPE ────────────────────────────────────────────────────────────
  {
    type: "team-portraits",
    category: "team",
    name: "Equipe — Portraits",
    defaultData: {
      title: "L'equipe",
      members: [
        { id: "m1", name: "Aicha Kone", role: "Architecte associee", specialties: "LOGEMENT COLLECTIF \u00B7 CLIMAT", photoSrc: "" },
        { id: "m2", name: "Yao N'Guessan", role: "Directeur de projets", specialties: "COORDINATION \u00B7 EXECUTION", photoSrc: "" },
        { id: "m3", name: "Mariam Diabate", role: "Architecte d'interieur", specialties: "AMENAGEMENT \u00B7 MOBILIER", photoSrc: "" },
        { id: "m4", name: "Serge Kouame", role: "Economiste de la construction", specialties: "CHIFFRAGE \u00B7 MARCHES", photoSrc: "" },
      ],
    },
  },
  {
    type: "team-directory",
    category: "team",
    name: "Equipe — Annuaire",
    defaultData: {
      title: "L'equipe",
      members: [
        { id: "m1", name: "Aicha Kone", role: "Architecte associee", bio: "Quinze ans de pratique du logement collectif en climat tropical humide.", specialties: "LOGEMENT \u00B7 CLIMAT", photoSrc: "" },
        { id: "m2", name: "Yao N'Guessan", role: "Directeur de projets", bio: "Pilote la coordination des etudes et le suivi d'execution.", specialties: "COORDINATION", photoSrc: "" },
      ],
    },
  },
  {
    type: "team-leadership",
    category: "team",
    name: "Equipe — Direction + equipe",
    defaultData: {
      title: "L'equipe",
      members: [
        { id: "m1", name: "Aicha Kone", role: "Architecte associee \u00B7 cofondatrice", bio: "Diplomee de l'EAMAU, elle dirige la conception et porte l'approche climatique de l'agence.", photoSrc: "" },
        { id: "m2", name: "Yao N'Guessan", role: "Directeur de projets \u00B7 cofondateur", bio: "Responsable de la coordination technique et du suivi d'execution.", photoSrc: "" },
        { id: "m3", name: "Mariam Diabate", role: "Architecte d'interieur", photoSrc: "" },
        { id: "m4", name: "Serge Kouame", role: "Economiste de la construction", photoSrc: "" },
      ],
    },
  },

  // ── 07 CERTIFICATIONS ────────────────────────────────────────────────────
  {
    type: "cert-register",
    category: "certifications",
    name: "Certifications — Registre",
    defaultData: {
      certs: [
        { id: "c1", name: "Inscription a l'Ordre des Architectes", issuer: "Ordre des Architectes de Cote d'Ivoire", year: "2014" },
        { id: "c2", name: "Agrement technique", issuer: "Ministere de la Construction", year: "2016" },
        { id: "c3", name: "Certification ISO 9001:2015", issuer: "Organisme certificateur accredite", year: "2022" },
      ],
    },
  },
  {
    type: "cert-seals",
    category: "certifications",
    name: "Certifications — Sceaux",
    defaultData: {
      certs: [
        { id: "c1", name: "Inscription a l'Ordre des Architectes de Cote d'Ivoire", mark: "OA", year: "2014" },
        { id: "c2", name: "Agrement technique du Ministere de la Construction", mark: "AG", year: "2016" },
        { id: "c3", name: "Certification ISO 9001:2015 — management de la qualite", mark: "ISO", year: "2022" },
      ],
    },
  },
  {
    type: "cert-line",
    category: "certifications",
    name: "Certifications — Ligne",
    defaultData: {
      certs: [
        { id: "c1", name: "Ordre des Architectes de Cote d'Ivoire", year: "2014" },
        { id: "c2", name: "Agrement technique MCLU", year: "2016" },
        { id: "c3", name: "ISO 9001:2015", year: "2022" },
      ],
    },
  },

  // ── 08 REFERENCES ────────────────────────────────────────────────────────
  {
    type: "ref-casestudy",
    category: "references",
    name: "References — Etude de cas",
    defaultData: {
      references: [
        { id: "r1", project: "Residence Ivoire", location: "Cocody", year: "2024", mission: "Conception architecturale", origin: "Projet MEEREO", description: "Trente-deux logements livres dans les delais, coordination complete des etudes.", src: "" },
        { id: "r2", project: "Siege Horizon", location: "Marcory", year: "2022", mission: "Conception + suivi" },
        { id: "r3", project: "Immeuble Lagune", location: "Plateau", year: "2023", mission: "Conception" },
      ],
    },
  },
  {
    type: "ref-table",
    category: "references",
    name: "References — Table",
    defaultData: {
      references: [
        { id: "r1", project: "Villa Palmeraie", location: "Assinie", year: "2025", mission: "Conception architecturale" },
        { id: "r2", project: "Residence Ivoire", location: "Cocody, Abidjan", year: "2024", mission: "Conception architecturale" },
        { id: "r3", project: "Immeuble Lagune", location: "Plateau, Abidjan", year: "2023", mission: "Conception architecturale" },
        { id: "r4", project: "Siege Horizon", location: "Marcory, Abidjan", year: "2022", mission: "Conception et suivi de chantier" },
      ],
    },
  },
  {
    type: "ref-cards",
    category: "references",
    name: "References — Cartes contexte",
    defaultData: {
      references: [
        { id: "r1", project: "Residence Ivoire", description: "32 logements traversants, livres en 14 mois.", location: "Cocody", year: "2024", origin: "Projet MEEREO" },
        { id: "r2", project: "Siege Horizon", description: "4 200 m2 de bureaux, double peau brise-soleil.", location: "Marcory", year: "2022", origin: "Projet MEEREO" },
        { id: "r3", project: "Ateliers Beton", description: "Renovation lourde d'un ensemble industriel.", location: "Yopougon", year: "2020", origin: "HORS PLATEFORME" },
      ],
    },
  },

  // ── 09 AVIS ET SATISFACTION ──────────────────────────────────────────────
  {
    type: "review-testimony",
    category: "reviews",
    name: "Avis — Temoignage",
    defaultData: {
      quote: "Chaque decision a ete documentee et validee avant d'avancer : nous savions a tout moment ou en etait le projet.",
      author: "K. Toure — maitre d'ouvrage",
      project: "RESIDENCE IVOIRE \u00B7 LIVREE 2024",
      verified: true,
    },
  },
  {
    type: "review-journal",
    category: "reviews",
    name: "Avis — Journal",
    defaultData: {
      reviews: [
        { id: "a1", date: "JANV. 2025", quote: "Livraison dans les delais annonces, reserves levees en trois semaines.", author: "K. Toure", project: "Residence Ivoire", verified: true },
        { id: "a2", date: "SEPT. 2023", quote: "La coordination des bureaux d'etudes a ete prise en main de bout en bout.", author: "Societe Horizon", project: "Siege Horizon", verified: true },
        { id: "a3", date: "MARS 2023", quote: "Des choix de materiaux adaptes au climat, un budget tenu.", author: "A. Kouassi", project: "Immeuble Lagune", verified: true },
      ],
    },
  },
  {
    type: "review-structured",
    category: "reviews",
    name: "Avis — Retour structure",
    defaultData: {
      context: "Residence de 32 logements a Cocody, mission de conception architecturale confiee en 2022 via un appel d'offres MEEREO.",
      delivered: "Esquisses, permis de construire, dossiers de consultation, coordination des etudes, assistance a la reception.",
      feedback: "Un deroulement sans surprise : chaque jalon valide, chaque document au bon endroit, une equipe qui repond.",
      author: "K. Toure — maitre d'ouvrage \u00B7 Residence Ivoire, livree 2024",
      verified: true,
    },
  },

  // ── 10 COORDONNEES ───────────────────────────────────────────────────────
  {
    type: "coord-map",
    category: "coordinates",
    name: "Coordonnees — Bloc carte",
    defaultData: {
      address: "Rue des Jardins, Cocody Danga\nAbidjan, Cote d'Ivoire",
      phone: "+225 27 22 00 00 00",
      email: "contact@entreprise.ci",
      url: "meereo.com/pro/votre-entreprise",
    },
  },
  {
    type: "coord-sheet",
    category: "coordinates",
    name: "Coordonnees — Fiche",
    defaultData: {
      address: "Rue des Jardins, Cocody Danga — Abidjan, Cote d'Ivoire",
      phone: "+225 27 22 00 00 00",
      email: "contact@entreprise.ci",
      website: "entreprise.ci",
      socials: "LinkedIn \u00B7 Instagram",
    },
  },
  {
    type: "coord-footer",
    category: "coordinates",
    name: "Coordonnees — Pied de page",
    defaultData: {
      companyName: "Votre Entreprise",
      category: "Bureau d'architecture — Abidjan",
      address: "Rue des Jardins, Cocody Danga\nAbidjan, Cote d'Ivoire",
      phone: "+225 27 22 00 00 00",
      email: "contact@entreprise.ci",
      website: "entreprise.ci",
      url: "meereo.com/pro/votre-entreprise",
    },
  },

  // ── 11 CONTACT ───────────────────────────────────────────────────────────
  {
    type: "contact-actions",
    category: "contact",
    name: "Contact — Panneau d'actions",
    defaultData: {
      eyebrow: "Travailler avec Votre Entreprise",
      actions: [
        { id: "a1", title: "Envoyer un message", description: "Ouvre une conversation privee avec l'agence dans le Communication Hub.", meta: "REPONSE SOUS 24 H OUVREES" },
        { id: "a2", title: "Demander un rendez-vous", description: "Proposez un creneau ; l'agence confirme depuis son Cockpit.", meta: "EN AGENCE OU A DISTANCE" },
        { id: "a3", title: "Inviter dans un projet", description: "Associez l'agence a l'un de vos projets MEEREO existants.", meta: "INVITATION HISTORISEE" },
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
      title: "Ecrire a Votre Entreprise",
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
      headline: "Un projet a Abidjan ou dans la sous-region ? <b>Parlons-en.</b>",
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
