import { TextField, ImageField, Divider, ListHeader, ListItemWrapper } from "./_fields";

/* PRJ-06 E1: l'équipe s'édite depuis deux portes (Paramètres ET PageBuilder),
   mais écrit dans la MÊME source (cockpitTeam via le store).
   Ce composant lit et écrit via onChange qui doit propager vers cockpitTeam.
   Le composant parent (SectionsBuilder) doit synchroniser data.members ↔ cockpitTeam. */

let _uid = Date.now();
const uid = () => `tm-${_uid++}`;

export default function TeamEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateMember = (id, k, v) => set("members", (data.members || []).map((m) => m.id === id ? { ...m, [k]: v } : m));
  const addMember = () => set("members", [...(data.members || []), { id: uid(), nom: "Nouveau membre", name: "Nouveau membre", role: "", bio: "", specialties: "", photoSrc: "", isPublic: true }]);
  const removeMember = (id) => set("members", (data.members || []).filter((m) => m.id !== id));

  return (
    <div>
      <TextField label="Titre" value={data.title || ""} onChange={(v) => set("title", v)} />
      <div style={{ padding: '8px 0', fontSize: 11, color: '#888', lineHeight: 1.5 }}>
        Les membres modifiés ici sont synchronisés avec Paramètres &gt; Équipe.
      </div>
      <Divider />
      <ListHeader label="Membres" onAdd={addMember} />
      {(data.members || []).map((m) => (
        <ListItemWrapper key={m.id} onRemove={() => removeMember(m.id)}>
          <TextField label="Nom" value={m.name || m.nom || ""} onChange={(v) => updateMember(m.id, "name", v)} />
          <TextField label="Fonction" value={m.role || m.poste || ""} onChange={(v) => updateMember(m.id, "role", v)} />
          {(sectionType === "team-directory" || sectionType === "team-leadership") && (
            <TextField label="Bio" value={m.bio || ""} onChange={(v) => updateMember(m.id, "bio", v)} multiline />
          )}
          <TextField label="Spécialités" value={m.specialties || ""} onChange={(v) => updateMember(m.id, "specialties", v)} />
          <ImageField label="Photo" value={m.photoSrc || m.photo || ""} onChange={(v) => updateMember(m.id, "photoSrc", v)} />
        </ListItemWrapper>
      ))}
    </div>
  );
}
