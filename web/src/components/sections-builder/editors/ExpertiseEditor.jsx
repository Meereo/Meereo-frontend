import { TextField, Divider, ListHeader, ListItemWrapper } from "./_fields";

let _uid = Date.now();
const uid = () => `dom-${_uid++}`;

export default function ExpertiseEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateDomain = (id, k, v) => set("domains", (data.domains || []).map((x) => x.id === id ? { ...x, [k]: v } : x));
  const addDomain = () => set("domains", [...(data.domains || []), { id: uid(), name: "Nouveau domaine", scope: "", count: 0, percent: 0 }]);
  const removeDomain = (id) => set("domains", (data.domains || []).filter((x) => x.id !== id));

  return (
    <div>
      {sectionType === "expertise-bars" && (
        <TextField label="Note" value={data.note || ""} onChange={(v) => set("note", v)} />
      )}
      <ListHeader label="Domaines" onAdd={addDomain} />
      {(data.domains || []).map((d) => (
        <ListItemWrapper key={d.id} onRemove={() => removeDomain(d.id)}>
          <TextField label="Nom" value={d.name} onChange={(v) => updateDomain(d.id, "name", v)} />
          {sectionType === "expertise-table" && (
            <TextField label="Périmètre" value={d.scope || ""} onChange={(v) => updateDomain(d.id, "scope", v)} />
          )}
          {sectionType === "expertise-bars" && (
            <>
              <TextField label="Nombre" value={String(d.count || 0)} onChange={(v) => updateDomain(d.id, "count", v)} />
              <TextField label="Pourcentage" value={String(d.percent || 0)} onChange={(v) => updateDomain(d.id, "percent", Number(v))} />
            </>
          )}
        </ListItemWrapper>
      ))}
    </div>
  );
}
