import { TextField, Divider, ListHeader, ListItemWrapper } from "./_fields";

let _uid = Date.now();
const uid = () => `pres-${_uid++}`;

export default function PresentationEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  if (sectionType === "pres-essay") {
    const updateValue = (id, k, v) => set("values", (data.values || []).map((x) => x.id === id ? { ...x, [k]: v } : x));
    const addValue = () => set("values", [...(data.values || []), { id: uid(), label: "Nouveau", text: "" }]);
    const removeValue = (id) => set("values", (data.values || []).filter((x) => x.id !== id));
    const updateParagraph = (i, v) => { const p = [...(data.paragraphs || [])]; p[i] = v; set("paragraphs", p); };
    return (
      <div>
        <TextField label="Titre" value={data.title || ""} onChange={(v) => set("title", v)} />
        <Divider />
        {(data.paragraphs || []).map((p, i) => (
          <TextField key={i} label={`Paragraphe ${i + 1}`} value={p} onChange={(v) => updateParagraph(i, v)} multiline />
        ))}
        <button onClick={() => set("paragraphs", [...(data.paragraphs || []), ""])} className="text-xs text-blue-500 mb-4">+ Paragraphe</button>
        <Divider />
        <ListHeader label="Valeurs" onAdd={addValue} />
        {(data.values || []).map((v) => (
          <ListItemWrapper key={v.id} onRemove={() => removeValue(v.id)}>
            <TextField label="Label" value={v.label} onChange={(val) => updateValue(v.id, "label", val)} />
            <TextField label="Texte" value={v.text} onChange={(val) => updateValue(v.id, "text", val)} />
          </ListItemWrapper>
        ))}
      </div>
    );
  }

  if (sectionType === "pres-manifesto") {
    const updateCol = (id, k, v) => set("columns", (data.columns || []).map((x) => x.id === id ? { ...x, [k]: v } : x));
    const addCol = () => set("columns", [...(data.columns || []), { id: uid(), label: "Nouveau", text: "" }]);
    const removeCol = (id) => set("columns", (data.columns || []).filter((x) => x.id !== id));
    return (
      <div>
        <TextField label="Lead (HTML)" value={data.lead || ""} onChange={(v) => set("lead", v)} multiline />
        <Divider />
        <ListHeader label="Colonnes" onAdd={addCol} />
        {(data.columns || []).map((c) => (
          <ListItemWrapper key={c.id} onRemove={() => removeCol(c.id)}>
            <TextField label="Label" value={c.label} onChange={(v) => updateCol(c.id, "label", v)} />
            <TextField label="Texte" value={c.text} onChange={(v) => updateCol(c.id, "text", v)} multiline />
          </ListItemWrapper>
        ))}
      </div>
    );
  }

  // pres-dossier
  const updateSection = (id, k, v) => set("sections", (data.sections || []).map((x) => x.id === id ? { ...x, [k]: v } : x));
  const addSection = () => set("sections", [...(data.sections || []), { id: uid(), title: "Nouveau", text: "" }]);
  const removeSection = (id) => set("sections", (data.sections || []).filter((x) => x.id !== id));
  return (
    <div>
      <ListHeader label="Rubriques" onAdd={addSection} />
      {(data.sections || []).map((s) => (
        <ListItemWrapper key={s.id} onRemove={() => removeSection(s.id)}>
          <TextField label="Titre" value={s.title} onChange={(v) => updateSection(s.id, "title", v)} />
          <TextField label="Texte" value={s.text} onChange={(v) => updateSection(s.id, "text", v)} multiline />
        </ListItemWrapper>
      ))}
    </div>
  );
}
