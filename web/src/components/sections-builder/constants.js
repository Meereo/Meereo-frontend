// ─────────────────────────────────────────────────────────────────────────────
// constants.js — Section templates for BTP/Construction professional pages
// ─────────────────────────────────────────────────────────────────────────────

let _id = 1;
export const genId = () => `section-${_id++}`;

// ── Categories shown in the left sidebar ─────────────────────────────────────
export const SECTION_CATEGORIES = [
  { id: "hero", label: "Présentation" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Réalisations" },
  { id: "stats", label: "Chiffres clés" },
  { id: "team", label: "Équipe" },
  { id: "testimonials", label: "Témoignages" },
  { id: "cta", label: "Appel à l'action" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
  { id: "footer", label: "Pied de page" },
];

// ── Section templates ────────────────────────────────────────────────────────
export const SECTION_TEMPLATES = [
  // ── HERO ──────────────────────────────────────────────────────────────────
  {
    type: "hero-pro",
    category: "hero",
    name: "Présentation — Entreprise",
    defaultData: {
      companyName: "Nom de votre entreprise",
      tagline: "Construisons ensemble vos projets d'exception",
      description: "Bureau d'architecture et de construction basé à Abidjan, spécialisé dans les projets résidentiels et commerciaux depuis plus de 15 ans.",
      badge: "Architecture · Construction",
      ctaText: "Demander un devis",
      ctaLink: "#contact",
      secondaryText: "Voir nos réalisations",
      secondaryLink: "#realisations",
      imageSrc: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80",
      imageAlt: "Chantier de construction",
    },
  },
  {
    type: "hero-centered",
    category: "hero",
    name: "Présentation — Centrée",
    defaultData: {
      companyName: "Nom de votre entreprise",
      tagline: "L'excellence au service de vos projets",
      description: "Nous accompagnons particuliers et professionnels dans la conception et la réalisation de projets immobiliers de qualité.",
      badge: "Ingénierie · BTP",
      ctaText: "Nous contacter",
      ctaLink: "#contact",
      secondaryText: "Découvrir nos services",
      secondaryLink: "#services",
      imageSrc: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80",
      imageAlt: "Projet architectural",
    },
  },

  // ── SERVICES ──────────────────────────────────────────────────────────────
  {
    type: "services-grid",
    category: "services",
    name: "Services — Grille",
    defaultData: {
      title: "Nos services",
      subtitle: "Un accompagnement complet pour chaque étape de votre projet.",
      services: [
        { id: "s1", icon: "ruler", title: "Conception architecturale", description: "Plans, maquettes 3D et permis de construire pour des espaces qui vous ressemblent." },
        { id: "s2", icon: "building", title: "Construction & Gros œuvre", description: "Réalisation complète de vos projets, du terrassement aux finitions." },
        { id: "s3", icon: "hardhat", title: "Suivi de chantier", description: "Pilotage et coordination des travaux pour garantir qualité, délais et budget." },
        { id: "s4", icon: "paintbrush", title: "Rénovation & Aménagement", description: "Transformation et modernisation de vos espaces existants." },
        { id: "s5", icon: "compass", title: "Études techniques", description: "Études de sol, structure et fluides pour des fondations solides." },
        { id: "s6", icon: "clipboard", title: "Conseil & Expertise", description: "Accompagnement dans vos choix techniques, réglementaires et budgétaires." },
      ],
    },
  },

  // ── PORTFOLIO ─────────────────────────────────────────────────────────────
  {
    type: "portfolio-grid",
    category: "portfolio",
    name: "Réalisations — Grille",
    defaultData: {
      title: "Nos réalisations",
      subtitle: "Découvrez une sélection de projets livrés avec succès.",
      projects: [
        { id: "p1", src: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80", alt: "Villa Cocody", title: "Villa moderne Cocody", location: "Abidjan, Cocody", year: "2024" },
        { id: "p2", src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80", alt: "Immeuble Plateau", title: "Immeuble de bureaux", location: "Abidjan, Plateau", year: "2023" },
        { id: "p3", src: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80", alt: "Résidence Riviera", title: "Résidence Riviera Golf", location: "Abidjan, Riviera", year: "2023" },
        { id: "p4", src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80", alt: "Villa Assinie", title: "Villa balnéaire", location: "Assinie", year: "2022" },
        { id: "p5", src: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=600&q=80", alt: "Centre commercial", title: "Centre commercial", location: "Abidjan, Marcory", year: "2022" },
        { id: "p6", src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80", alt: "Villa Bingerville", title: "Villa contemporaine", location: "Bingerville", year: "2021" },
      ],
    },
  },

  // ── STATS ─────────────────────────────────────────────────────────────────
  {
    type: "stats-bar",
    category: "stats",
    name: "Chiffres clés",
    defaultData: {
      title: "Notre expérience en chiffres",
      subtitle: "",
      stats: [
        { id: "st1", value: "15+", label: "Années d'expérience" },
        { id: "st2", value: "120", label: "Projets livrés" },
        { id: "st3", value: "35", label: "Collaborateurs" },
        { id: "st4", value: "45 000", label: "m² construits" },
      ],
    },
  },

  // ── TEAM ──────────────────────────────────────────────────────────────────
  {
    type: "team-grid",
    category: "team",
    name: "Équipe — Grille",
    defaultData: {
      title: "Notre équipe",
      subtitle: "Des professionnels passionnés au service de vos projets.",
      members: [
        { id: "m1", name: "Kouamé Yao", role: "Directeur Général", photoSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
        { id: "m2", name: "Aminata Diallo", role: "Architecte principal", photoSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80" },
        { id: "m3", name: "Jean-Marc Konan", role: "Chef de chantier", photoSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80" },
        { id: "m4", name: "Fatou Bamba", role: "Ingénieur structure", photoSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80" },
      ],
    },
  },

  // ── TESTIMONIALS ──────────────────────────────────────────────────────────
  {
    type: "testimonial-single",
    category: "testimonials",
    name: "Témoignage — Unique",
    defaultData: {
      quote: "Une équipe professionnelle et à l'écoute. Notre villa a été livrée dans les délais avec une qualité de finition remarquable. Je recommande vivement.",
      name: "M. Ouattara",
      role: "Propriétaire à Cocody",
      avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
      rating: 5,
    },
  },
  {
    type: "testimonials-grid",
    category: "testimonials",
    name: "Témoignages — Grille",
    defaultData: {
      title: "Ce que disent nos clients",
      subtitle: "La satisfaction de nos clients est notre meilleure référence.",
      testimonials: [
        { id: "t1", quote: "Suivi de chantier impeccable, respect des délais et du budget. Un partenaire de confiance pour nos projets immobiliers.", name: "Mme Koffi", role: "Promoteur immobilier", avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", rating: 5 },
        { id: "t2", quote: "Leur expertise en architecture contemporaine a transformé notre vision en réalité. Le résultat dépasse nos attentes.", name: "M. Traoré", role: "Investisseur", avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", rating: 5 },
        { id: "t3", quote: "Professionnalisme et créativité au rendez-vous. Notre bureau a été conçu et livré en un temps record.", name: "Mme Aka", role: "Directrice, Société ABI", avatarSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80", rating: 5 },
      ],
    },
  },

  // ── CTA ───────────────────────────────────────────────────────────────────
  {
    type: "cta-devis",
    category: "cta",
    name: "CTA — Demande de devis",
    defaultData: {
      title: "Un projet en tête ?",
      subtitle: "Contactez-nous pour une étude gratuite et un devis personnalisé. Notre équipe vous répond sous 48h.",
      ctaText: "Demander un devis gratuit",
      ctaLink: "#contact",
      secondaryText: "Voir nos réalisations",
      secondaryLink: "#realisations",
    },
  },

  // ── FAQ ───────────────────────────────────────────────────────────────────
  {
    type: "faq-simple",
    category: "faq",
    name: "FAQ — Questions fréquentes",
    defaultData: {
      title: "Questions fréquentes",
      subtitle: "Retrouvez les réponses aux questions les plus courantes.",
      faqs: [
        { id: "q1", question: "Quels types de projets réalisez-vous ?", answer: "Nous intervenons sur des projets résidentiels (villas, appartements), commerciaux (bureaux, commerces), et institutionnels (écoles, centres de santé). Chaque projet est étudié sur mesure." },
        { id: "q2", question: "Quelle est la durée moyenne d'un projet ?", answer: "La durée dépend de l'envergure du projet. Une villa individuelle prend en moyenne 8 à 12 mois, un immeuble de bureaux 14 à 18 mois. Nous établissons un planning détaillé dès le démarrage." },
        { id: "q3", question: "Comment se déroule le suivi de chantier ?", answer: "Nous assurons un suivi hebdomadaire avec des rapports photos et des réunions de chantier régulières. Vous avez un interlocuteur dédié tout au long du projet." },
        { id: "q4", question: "Proposez-vous des facilités de paiement ?", answer: "Oui, nous proposons un échéancier de paiement adapté à l'avancement des travaux. Les modalités sont définies dans le contrat initial." },
        { id: "q5", question: "Intervenez-vous hors d'Abidjan ?", answer: "Oui, nous intervenons sur l'ensemble du territoire ivoirien. Nous avons réalisé des projets à Yamoussoukro, Bouaké, San Pedro et Assinie." },
      ],
    },
  },

  // ── CONTACT ───────────────────────────────────────────────────────────────
  {
    type: "contact-pro",
    category: "contact",
    name: "Contact — Professionnel",
    defaultData: {
      title: "Contactez-nous",
      subtitle: "Parlons de votre projet. Notre équipe est disponible pour vous accompagner.",
      email: "contact@entreprise.ci",
      phone: "+225 07 00 00 00 00",
      address: "Abidjan, Cocody Riviera Bonoumin",
      hours: "Lun — Ven · 8h à 18h",
    },
  },

  // ── FOOTER ────────────────────────────────────────────────────────────────
  {
    type: "footer-pro",
    category: "footer",
    name: "Pied de page — Pro",
    defaultData: {
      companyName: "Nom de votre entreprise",
      tagline: "Construire avec excellence.",
      email: "contact@entreprise.ci",
      phone: "+225 07 00 00 00 00",
      address: "Abidjan, Cocody",
      copyright: `© ${new Date().getFullYear()} Votre Entreprise. Tous droits réservés.`,
    },
  },
];

// ── Default page (pre-loaded in canvas) ──────────────────────────────────────
export const DEFAULT_PAGE = [
  {
    id: "section-d1",
    type: "hero-pro",
    data: { ...SECTION_TEMPLATES.find((t) => t.type === "hero-pro").defaultData },
  },
  {
    id: "section-d2",
    type: "services-grid",
    data: { ...SECTION_TEMPLATES.find((t) => t.type === "services-grid").defaultData },
  },
];
