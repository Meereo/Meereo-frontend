import { TextField, ImageField, Divider } from "./_fields";
export default function PortfolioEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateProject = (id, k, v) => set("projects", data.projects.map((p) => p.id === id ? { ...p, [k]: v } : p));
  return (
    <div>
      <TextField label="Titre" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Sous-titre" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />
      <Divider />
      {data.projects.map((p, i) => (
        <div key={p.id} className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-2">Projet {i + 1}</p>
          <TextField label="Titre" value={p.title} onChange={(v) => updateProject(p.id, "title", v)} />
          <TextField label="Lieu" value={p.location || ""} onChange={(v) => updateProject(p.id, "location", v)} />
          <TextField label="Année" value={p.year || ""} onChange={(v) => updateProject(p.id, "year", v)} />
          <ImageField label="Photo" value={p.src} onChange={(v) => updateProject(p.id, "src", v)} />
          <TextField label="Alt" value={p.alt || ""} onChange={(v) => updateProject(p.id, "alt", v)} />
        </div>
      ))}
    </div>
  );
}
