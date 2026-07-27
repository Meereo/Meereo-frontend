// INS-21 : vignettes de la bibliothèque — les clés doivent correspondre
// aux types réels des sections (hero-banner, pres-essay…), pas à des noms
// hypothétiques (hero-split, hero-centered…). Cause du « ? » universel :
// aucune clé ne matchait.

const THUMBS = {
  // En-tête
  "hero-banner":       { bg: "bg-blue-50",    icon: "▣ ▤" },
  "hero-editorial":    { bg: "bg-blue-50",    icon: "▤" },
  "hero-compact":      { bg: "bg-blue-50",    icon: "▬" },
  // Présentation
  "pres-essay":        { bg: "bg-emerald-50", icon: "¶" },
  "pres-manifesto":    { bg: "bg-emerald-50", icon: "❝" },
  "pres-dossier":      { bg: "bg-emerald-50", icon: "≡" },
  // Chiffres clés
  "kpi-band":          { bg: "bg-amber-50",   icon: "#" },
  "kpi-cards":         { bg: "bg-amber-50",   icon: "▦" },
  "kpi-prose":         { bg: "bg-amber-50",   icon: "…" },
  // Expertise
  "expertise-table":   { bg: "bg-violet-50",  icon: "⊞" },
  "expertise-mosaic":  { bg: "bg-violet-50",  icon: "⊟" },
  "expertise-bars":    { bg: "bg-violet-50",  icon: "▰" },
  // Portfolio
  "portfolio-magazine":   { bg: "bg-pink-50", icon: "🖼" },
  "portfolio-planches":   { bg: "bg-pink-50", icon: "▥" },
  "portfolio-asymmetric": { bg: "bg-pink-50", icon: "◫" },
  // Équipe
  "team-portraits":    { bg: "bg-orange-50",  icon: "👤" },
  "team-directory":    { bg: "bg-orange-50",  icon: "☰" },
  "team-leadership":   { bg: "bg-orange-50",  icon: "★" },
  // Certifications
  "cert-register":     { bg: "bg-teal-50",    icon: "✓" },
  "cert-seals":        { bg: "bg-teal-50",    icon: "◉" },
  "cert-line":         { bg: "bg-teal-50",    icon: "—" },
  // Références
  "ref-casestudy":     { bg: "bg-indigo-50",  icon: "◧" },
  "ref-table":         { bg: "bg-indigo-50",  icon: "☰" },
  "ref-cards":         { bg: "bg-indigo-50",  icon: "▦" },
  // Avis
  "reviews-summary":   { bg: "bg-yellow-50",  icon: "★" },
  // Coordonnées
  "coord-map":         { bg: "bg-cyan-50",    icon: "📍" },
  "coord-sheet":       { bg: "bg-cyan-50",    icon: "☰" },
  "coord-footer":      { bg: "bg-gray-800",   icon: "▬", textColor: "text-white" },
  // Contact
  "contact-actions":   { bg: "bg-green-50",   icon: "→" },
  "contact-form":      { bg: "bg-green-50",   icon: "✉" },
  "contact-band":      { bg: "bg-green-50",   icon: "▬" },
};

export default function SectionThumbnail({ type }) {
  const t = THUMBS[type] || { bg: "bg-gray-50", icon: "?" };
  return (
    <div className={`${t.bg} h-16 flex items-center justify-center`}>
      <span className={`text-lg ${t.textColor || "text-gray-400"}`}>{t.icon}</span>
    </div>
  );
}
