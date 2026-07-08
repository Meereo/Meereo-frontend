import { useState } from "react";
import Icon from "./ui/Icon";
import SectionThumbnail from "./ui/SectionThumbnail";
import { SECTION_CATEGORIES, SECTION_TEMPLATES } from "./constants";

function SectionCard({ template, onAdd, onDragStart }) {
  return (
    <div draggable onDragStart={(e) => { e.dataTransfer.effectAllowed = "copy"; onDragStart(template); }}
      className="group bg-white border border-gray-100 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all">
      <SectionThumbnail type={template.type} />
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700 truncate">{template.name}</span>
        <button onClick={(e) => { e.stopPropagation(); onAdd(template); }}
          className="shrink-0 w-5 h-5 rounded-md bg-gray-100 hover:bg-gray-900 text-gray-400 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100" title="Add section">
          <Icon name="plus" size={11} />
        </button>
      </div>
    </div>
  );
}

export default function LeftSidebar({ onAdd, onDragStart }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const filtered = SECTION_TEMPLATES.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "all" || t.category === activeCategory;
    return matchesSearch && matchesCat;
  });
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-100 flex flex-col overflow-hidden min-h-0 shrink-0">
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Bibliothèque</h2>
        <div className="relative">
          <input type="text" placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 pl-8 text-xs text-gray-700 outline-none focus:border-gray-400 transition-colors placeholder-gray-400" />
          <svg className="absolute left-2.5 top-2.5 text-gray-400" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
      </div>
      <div className="px-3 py-2.5 border-b border-gray-100 flex gap-1.5 flex-wrap">
        <button onClick={() => setActiveCategory("all")} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${activeCategory === "all" ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400"}`}>Tout</button>
        {SECTION_CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${activeCategory === cat.id ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-gray-400"}`}>{cat.label}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
        {filtered.length === 0 ? <p className="text-center text-gray-400 text-xs py-8">Aucune section trouvée.</p> : filtered.map((t) => <SectionCard key={t.type} template={t} onAdd={onAdd} onDragStart={onDragStart} />)}
      </div>
      <div className="px-4 py-3 border-t border-gray-100"><p className="text-xs text-gray-400 text-center">Glissez une section sur le canvas ou cliquez +</p></div>
    </aside>
  );
}
