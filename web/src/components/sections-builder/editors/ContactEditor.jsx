import { TextField, Divider, ListHeader, ListItemWrapper } from "./_fields";

let _uid = Date.now();
const uid = () => `ctc-${_uid++}`;

export default function ContactEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  if (sectionType === "contact-actions") {
    const updateAction = (id, k, v) => set("actions", (data.actions || []).map((a) => a.id === id ? { ...a, [k]: v } : a));
    const addAction = () => set("actions", [...(data.actions || []), { id: uid(), title: "Nouvelle action", description: "", meta: "" }]);
    const removeAction = (id) => set("actions", (data.actions || []).filter((a) => a.id !== id));
    const updateLink = (id, k, v) => set("links", (data.links || []).map((l) => l.id === id ? { ...l, [k]: v } : l));
    const addLink = () => set("links", [...(data.links || []), { id: uid(), label: "Nouveau lien" }]);
    const removeLink = (id) => set("links", (data.links || []).filter((l) => l.id !== id));
    return (
      <div>
        <TextField label="Accroche" value={data.eyebrow || ""} onChange={(v) => set("eyebrow", v)} />
        <Divider />
        <ListHeader label="Actions" onAdd={addAction} />
        {(data.actions || []).map((a) => (
          <ListItemWrapper key={a.id} onRemove={() => removeAction(a.id)}>
            <TextField label="Titre" value={a.title} onChange={(v) => updateAction(a.id, "title", v)} />
            <TextField label="Description" value={a.description || ""} onChange={(v) => updateAction(a.id, "description", v)} />
            <TextField label="Meta" value={a.meta || ""} onChange={(v) => updateAction(a.id, "meta", v)} />
          </ListItemWrapper>
        ))}
        <Divider />
        <ListHeader label="Liens secondaires" onAdd={addLink} />
        {(data.links || []).map((l) => (
          <ListItemWrapper key={l.id} onRemove={() => removeLink(l.id)}>
            <TextField label="Label" value={l.label} onChange={(v) => updateLink(l.id, "label", v)} />
          </ListItemWrapper>
        ))}
      </div>
    );
  }

  if (sectionType === "contact-form") {
    const updateAlt = (id, k, v) => set("altLinks", (data.altLinks || []).map((l) => l.id === id ? { ...l, [k]: v } : l));
    const addAlt = () => set("altLinks", [...(data.altLinks || []), { id: uid(), label: "Nouveau" }]);
    const removeAlt = (id) => set("altLinks", (data.altLinks || []).filter((l) => l.id !== id));
    return (
      <div>
        <TextField label="Titre" value={data.title || ""} onChange={(v) => set("title", v)} />
        <TextField label="Note" value={data.note || ""} onChange={(v) => set("note", v)} multiline />
        <TextField label="Texte du bouton" value={data.submitText || ""} onChange={(v) => set("submitText", v)} />
        <Divider />
        <ListHeader label="Liens alternatifs" onAdd={addAlt} />
        {(data.altLinks || []).map((l) => (
          <ListItemWrapper key={l.id} onRemove={() => removeAlt(l.id)}>
            <TextField label="Label" value={l.label} onChange={(v) => updateAlt(l.id, "label", v)} />
          </ListItemWrapper>
        ))}
      </div>
    );
  }

  // contact-band
  return (
    <div>
      <TextField label="Titre (HTML)" value={data.headline || ""} onChange={(v) => set("headline", v)} multiline />
      <Divider />
      <TextField label="Bouton principal" value={data.ctaText || ""} onChange={(v) => set("ctaText", v)} />
      <TextField label="Bouton secondaire" value={data.secondaryText || ""} onChange={(v) => set("secondaryText", v)} />
    </div>
  );
}
