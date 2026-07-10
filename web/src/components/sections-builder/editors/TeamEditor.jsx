import { TextField, ImageField, Divider, ListHeader, ListItemWrapper } from "./_fields";

let _uid = Date.now();
const uid = () => `tm-${_uid++}`;

export default function TeamEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateMember = (id, k, v) => set("members", (data.members || []).map((m) => m.id === id ? { ...m, [k]: v } : m));
  const addMember = () => set("members", [...(data.members || []), { id: uid(), name: "Nouveau membre", role: "", bio: "", specialties: "", photoSrc: "" }]);
  const removeMember = (id) => set("members", (data.members || []).filter((m) => m.id !== id));

  return (
    <div>
      <TextField label="Titre" value={data.title || ""} onChange={(v) => set("title", v)} />
      <Divider />
      <ListHeader label="Membres" onAdd={addMember} />
      {(data.members || []).map((m) => (
        <ListItemWrapper key={m.id} onRemove={() => removeMember(m.id)}>
          <TextField label="Nom" value={m.name} onChange={(v) => updateMember(m.id, "name", v)} />
          <TextField label="Fonction" value={m.role || ""} onChange={(v) => updateMember(m.id, "role", v)} />
          {(sectionType === "team-directory" || sectionType === "team-leadership") && (
            <TextField label="Bio" value={m.bio || ""} onChange={(v) => updateMember(m.id, "bio", v)} multiline />
          )}
          <TextField label="Specialites" value={m.specialties || ""} onChange={(v) => updateMember(m.id, "specialties", v)} />
          <ImageField label="Photo" value={m.photoSrc || ""} onChange={(v) => updateMember(m.id, "photoSrc", v)} />
        </ListItemWrapper>
      ))}
    </div>
  );
}
