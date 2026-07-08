import { HeroSplit, HeroCentered } from "./sections/HeroSection";
import { FeaturesGrid, FeaturesAlternating } from "./sections/FeaturesSection";
import { TestimonialSingle, TestimonialsGrid } from "./sections/TestimonialSection";
import { CTADark, CTALight } from "./sections/CTASection";
import { PricingSimple } from "./sections/PricingSection";
import { FAQSimple } from "./sections/FAQSection";
import { GalleryGrid } from "./sections/GallerySection";
import { ContactSimple } from "./sections/ContactSection";
import { FooterSimple } from "./sections/FooterSection";

const REGISTRY = {
  "hero-split": HeroSplit,
  "hero-centered": HeroCentered,
  "features-grid": FeaturesGrid,
  "features-alternating": FeaturesAlternating,
  "testimonial-single": TestimonialSingle,
  "testimonials-grid": TestimonialsGrid,
  "cta-dark": CTADark,
  "cta-light": CTALight,
  "pricing-simple": PricingSimple,
  "faq-simple": FAQSimple,
  "gallery-grid": GalleryGrid,
  "contact-simple": ContactSimple,
  "footer-simple": FooterSimple,
};

export default function SectionRenderer({ section }) {
  const Component = REGISTRY[section.type];
  if (!Component) return <div className="p-8 bg-gray-50 text-center text-gray-400 text-sm">Unknown: {section.type}</div>;
  return <Component data={section.data} />;
}
