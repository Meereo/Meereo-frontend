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

export default function SectionRenderer({ section }) {
  const Component = REGISTRY[section.type];
  if (!Component) return <div className="p-8 bg-gray-50 text-center text-gray-400 text-sm">Section inconnue : {section.type}</div>;
  return <Component data={section.data} />;
}
