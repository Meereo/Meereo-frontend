import { HeroPro, HeroCentered } from "./sections/HeroSection";
import { ServicesGrid } from "./sections/ServicesSection";
import { PortfolioGrid } from "./sections/PortfolioSection";
import { StatsBar } from "./sections/StatsSection";
import { TeamGrid } from "./sections/TeamSection";
import { TestimonialSingle, TestimonialsGrid } from "./sections/TestimonialSection";
import { CTADevis } from "./sections/CTASection";
import { FAQSimple } from "./sections/FAQSection";
import { ContactPro } from "./sections/ContactSection";
import { FooterPro } from "./sections/FooterSection";

const REGISTRY = {
  "hero-pro": HeroPro,
  "hero-centered": HeroCentered,
  "services-grid": ServicesGrid,
  "portfolio-grid": PortfolioGrid,
  "stats-bar": StatsBar,
  "team-grid": TeamGrid,
  "testimonial-single": TestimonialSingle,
  "testimonials-grid": TestimonialsGrid,
  "cta-devis": CTADevis,
  "faq-simple": FAQSimple,
  "contact-pro": ContactPro,
  "footer-pro": FooterPro,
};

export default function SectionRenderer({ section }) {
  const Component = REGISTRY[section.type];
  if (!Component) return <div className="p-8 bg-gray-50 text-center text-gray-400 text-sm">Section inconnue : {section.type}</div>;
  return <Component data={section.data} />;
}
