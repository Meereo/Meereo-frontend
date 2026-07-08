const THUMBS = {
  "hero-split": { bg: "bg-blue-50", icon: "▣ ▤" },
  "hero-centered": { bg: "bg-blue-50", icon: "▣" },
  "features-grid": { bg: "bg-emerald-50", icon: "⊞" },
  "features-alternating": { bg: "bg-emerald-50", icon: "⇆" },
  "testimonial-single": { bg: "bg-amber-50", icon: "❝" },
  "testimonials-grid": { bg: "bg-amber-50", icon: "❝❝❝" },
  "cta-dark": { bg: "bg-gray-800", icon: "→", textColor: "text-white" },
  "cta-light": { bg: "bg-gray-50", icon: "→" },
  "pricing-simple": { bg: "bg-violet-50", icon: "$" },
  "faq-simple": { bg: "bg-orange-50", icon: "?" },
  "gallery-grid": { bg: "bg-pink-50", icon: "🖼" },
  "contact-simple": { bg: "bg-cyan-50", icon: "✉" },
  "footer-simple": { bg: "bg-gray-100", icon: "▬" },
};

export default function SectionThumbnail({ type }) {
  const t = THUMBS[type] || { bg: "bg-gray-50", icon: "?" };
  return (
    <div className={`${t.bg} h-16 flex items-center justify-center`}>
      <span className={`text-lg ${t.textColor || "text-gray-400"}`}>{t.icon}</span>
    </div>
  );
}
