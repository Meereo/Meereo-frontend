import { TextField, Divider, ListHeader, ListItemWrapper } from "./_fields";

let _uid = Date.now();
const uid = () => `kpi-${_uid++}`;

export default function KpiEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  if (sectionType === "kpi-prose") {
    return (
      <div>
        <TextField label="Phrase (HTML, utiliser <span class='pp-kpi-c-n'>14</span> pour les chiffres)" value={data.prose || ""} onChange={(v) => set("prose", v)} multiline />
      </div>
    );
  }

  // kpi-band & kpi-cards
  const updateItem = (id, k, v) => set("items", (data.items || []).map((x) => x.id === id ? { ...x, [k]: v } : x));
  const addItem = () => set("items", [...(data.items || []), { id: uid(), value: "0", label: "Nouveau", note: "" }]);
  const removeItem = (id) => set("items", (data.items || []).filter((x) => x.id !== id));
  return (
    <div>
      <ListHeader label="Indicateurs" onAdd={addItem} />
      {(data.items || []).map((item) => (
        <ListItemWrapper key={item.id} onRemove={() => removeItem(item.id)}>
          <TextField label="Valeur" value={item.value} onChange={(v) => updateItem(item.id, "value", v)} />
          <TextField label="Label" value={item.label} onChange={(v) => updateItem(item.id, "label", v)} />
          {sectionType === "kpi-cards" && (
            <TextField label="Note" value={item.note || ""} onChange={(v) => updateItem(item.id, "note", v)} />
          )}
        </ListItemWrapper>
      ))}
    </div>
  );
}
