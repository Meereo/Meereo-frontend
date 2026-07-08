import Icon from "./ui/Icon";
import HeroEditor from "./editors/HeroEditor";
import ServicesEditor from "./editors/ServicesEditor";
import PortfolioEditor from "./editors/PortfolioEditor";
import StatsEditor from "./editors/StatsEditor";
import TeamEditor from "./editors/TeamEditor";
import TestimonialEditor from "./editors/TestimonialEditor";
import CTAEditor from "./editors/CTAEditor";
import FAQEditor from "./editors/FAQEditor";
import ContactEditor from "./editors/ContactEditor";
import FooterEditor from "./editors/FooterEditor";

const EDITOR_MAP = {
  "hero": HeroEditor,
  "services": ServicesEditor,
  "portfolio": PortfolioEditor,
  "stats": StatsEditor,
  "team": TeamEditor,
  "testimonial": TestimonialEditor,
  "testimonials": TestimonialEditor,
  "cta": CTAEditor,
  "faq": FAQEditor,
  "contact": ContactEditor,
  "footer": FooterEditor,
};

function resolveEditor(type) {
  for (const prefix of Object.keys(EDITOR_MAP)) { if (type.startsWith(prefix)) return EDITOR_MAP[prefix]; }
  return null;
}

export default function RightSidebar({ section, onChange }) {
  if (!section) return (
    <aside className="w-72 bg-white border-l border-gray-100 flex flex-col min-h-0 shrink-0">
      <div className="px-4 pt-4 pb-3 border-b border-gray-100"><h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Éditeur</h2></div>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400"><Icon name="pencil" size={18} /></div>
        <div><p className="text-sm font-medium text-gray-700 mb-1">Aucune section sélectionnée</p><p className="text-xs text-gray-400 leading-relaxed">Cliquez sur une section pour modifier son contenu.</p></div>
      </div>
    </aside>
  );
  const Editor = resolveEditor(section.type);
  return (
    <aside className="w-72 bg-white border-l border-gray-100 flex flex-col overflow-hidden min-h-0 shrink-0">
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Édition</p>
        <p className="text-sm font-semibold text-gray-900 capitalize">{section.type.replace(/-/g, " ")}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {Editor ? <Editor data={section.data} sectionType={section.type} onChange={(newData) => onChange(section.id, newData)} /> : <div className="text-center py-8 text-gray-400 text-sm">Pas d'éditeur pour <code className="text-xs">{section.type}</code>.</div>}
      </div>
    </aside>
  );
}
