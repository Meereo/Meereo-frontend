import { TextField, ImageField, Divider, ListHeader, ListItemWrapper } from "./_fields";

let _uid = Date.now();
const uid = () => `ref-${_uid++}`;

export default function ReferencesEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateRef = (id, k, v) => set("references", (data.references || []).map((r) => r.id === id ? { ...r, [k]: v } : r));
  const addRef = () => set("references", [...(data.references || []), { id: uid(), project: "Nouveau projet", location: "", year: "", mission: "", description: "", origin: "", src: "" }]);
  const removeRef = (id) => set("references", (data.references || []).filter((r) => r.id !== id));

  return (
    <div>
      <ListHeader label="References" onAdd={addRef} />
      {(data.references || []).map((r) => (
        <ListItemWrapper key={r.id} onRemove={() => removeRef(r.id)}>
          <TextField label="Projet" value={r.project} onChange={(v) => updateRef(r.id, "project", v)} />
          <TextField label="Localisation" value={r.location || ""} onChange={(v) => updateRef(r.id, "location", v)} />
          <TextField label="Annee" value={r.year || ""} onChange={(v) => updateRef(r.id, "year", v)} />
          <TextField label="Mission" value={r.mission || ""} onChange={(v) => updateRef(r.id, "mission", v)} />
          {(sectionType === "ref-casestudy" || sectionType === "ref-cards") && (
            <TextField label="Description" value={r.description || ""} onChange={(v) => updateRef(r.id, "description", v)} multiline />
          )}
          {(sectionType === "ref-casestudy" || sectionType === "ref-cards") && (
            <TextField label="Origine (ex: Projet MEEREO)" value={r.origin || ""} onChange={(v) => updateRef(r.id, "origin", v)} />
          )}
          {sectionType === "ref-casestudy" && (
            <ImageField label="Image" value={r.src || ""} onChange={(v) => updateRef(r.id, "src", v)} />
          )}
        </ListItemWrapper>
      ))}
    </div>
  );
}
