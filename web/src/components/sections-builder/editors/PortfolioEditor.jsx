import { TextField, ImageField, Divider, ListHeader, ListItemWrapper } from "./_fields";

let _uid = Date.now();
const uid = () => `proj-${_uid++}`;

export default function PortfolioEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateProject = (id, k, v) => set("projects", (data.projects || []).map((p) => p.id === id ? { ...p, [k]: v } : p));
  const addProject = () => set("projects", [...(data.projects || []), { id: uid(), title: "Nouveau projet", location: "", year: "", mission: "", description: "", src: "" }]);
  const removeProject = (id) => set("projects", (data.projects || []).filter((p) => p.id !== id));

  return (
    <div>
      <TextField label="Titre de section" value={data.title || ""} onChange={(v) => set("title", v)} />
      <TextField label="Sous-titre" value={data.subtitle || ""} onChange={(v) => set("subtitle", v)} />
      <Divider />
      <ListHeader label="Projets" onAdd={addProject} />
      {(data.projects || []).map((p) => (
        <ListItemWrapper key={p.id} onRemove={() => removeProject(p.id)}>
          <TextField label="Titre" value={p.title} onChange={(v) => updateProject(p.id, "title", v)} />
          <TextField label="Localisation" value={p.location || ""} onChange={(v) => updateProject(p.id, "location", v)} />
          <TextField label="Annee" value={p.year || ""} onChange={(v) => updateProject(p.id, "year", v)} />
          <TextField label="Mission" value={p.mission || ""} onChange={(v) => updateProject(p.id, "mission", v)} />
          {sectionType === "portfolio-planches" && (
            <TextField label="Description" value={p.description || ""} onChange={(v) => updateProject(p.id, "description", v)} multiline />
          )}
          <ImageField label="Image" value={p.src || ""} onChange={(v) => updateProject(p.id, "src", v)} />
        </ListItemWrapper>
      ))}
    </div>
  );
}
