import { HeroBanner, HeroEditorial, HeroCompact } from "./sections/HeroSection";
import { PresEssay, PresManifesto, PresDossier } from "./sections/PresentationSection";
import { KpiBand, KpiCards, KpiProse } from "./sections/KpiSection";
import { ExpertiseTable, ExpertiseMosaic, ExpertiseBars } from "./sections/ExpertiseSection";
import { PortfolioMagazine, PortfolioPlanches, PortfolioAsymmetric } from "./sections/PortfolioSection";
import { TeamPortraits, TeamDirectory, TeamLeadership } from "./sections/TeamSection";
import { CertRegister, CertSeals, CertLine } from "./sections/CertificationsSection";
import { RefCaseStudy, RefTable, RefCards } from "./sections/ReferencesSection";
import { ReviewTestimony, ReviewJournal, ReviewStructured } from "./sections/ReviewsSection";
import { CoordMap, CoordSheet, CoordFooter } from "./sections/CoordinatesSection";
import { ContactActions, ContactForm, ContactBand } from "./sections/ContactSection";

const REGISTRY = {
  "hero-banner": HeroBanner,
  "hero-editorial": HeroEditorial,
  "hero-compact": HeroCompact,
  "pres-essay": PresEssay,
  "pres-manifesto": PresManifesto,
  "pres-dossier": PresDossier,
  "kpi-band": KpiBand,
  "kpi-cards": KpiCards,
  "kpi-prose": KpiProse,
  "expertise-table": ExpertiseTable,
  "expertise-mosaic": ExpertiseMosaic,
  "expertise-bars": ExpertiseBars,
  "portfolio-magazine": PortfolioMagazine,
  "portfolio-planches": PortfolioPlanches,
  "portfolio-asymmetric": PortfolioAsymmetric,
  "team-portraits": TeamPortraits,
  "team-directory": TeamDirectory,
  "team-leadership": TeamLeadership,
  "cert-register": CertRegister,
  "cert-seals": CertSeals,
  "cert-line": CertLine,
  "ref-casestudy": RefCaseStudy,
  "ref-table": RefTable,
  "ref-cards": RefCards,
  "review-testimony": ReviewTestimony,
  "review-journal": ReviewJournal,
  "review-structured": ReviewStructured,
  "coord-map": CoordMap,
  "coord-sheet": CoordSheet,
  "coord-footer": CoordFooter,
  "contact-actions": ContactActions,
  "contact-form": ContactForm,
  "contact-band": ContactBand,
};

// Types de sections dont les champs dérivés (companyName, category, location,
// verified) sont injectés depuis le profil et non depuis la saisie utilisateur.
const PROFILE_INJECTED_TYPES = new Set([
  'hero-banner', 'hero-editorial', 'hero-compact', 'coord-footer',
]);

export default function SectionRenderer({ section, profileOverrides }) {
  const Component = REGISTRY[section.type];
  if (!Component) return <div className="p-8 bg-gray-50 text-center text-gray-400 text-sm">Section inconnue : {section.type}</div>;

  // Injecter les champs dérivés du profil sur les sections concernées
  let data = section.data;
  if (profileOverrides && PROFILE_INJECTED_TYPES.has(section.type)) {
    data = { ...data };
    if (profileOverrides.companyName) data.companyName = profileOverrides.companyName;
    if (profileOverrides.category)    data.category = profileOverrides.category;
    if (profileOverrides.location)    data.location = profileOverrides.location;
    // verified : dérivé de la vérification INS-04 — false si non vérifié
    data.verified = !!profileOverrides.verified;
  }

  return <Component data={data} />;
}
