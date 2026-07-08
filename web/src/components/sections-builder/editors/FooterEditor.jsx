import { TextField, Divider } from "./_fields";
export default function FooterEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateCol = (id, k, v) => set("columns", data.columns.map((c) => c.id === id ? { ...c, [k]: v } : c));
  return (
    <div>
      <TextField label="Logo text" value={data.logo} onChange={(v) => set("logo", v)} />
      <TextField label="Tagline" value={data.tagline} onChange={(v) => set("tagline", v)} />
      <TextField label="Copyright" value={data.copyright} onChange={(v) => set("copyright", v)} />
      <Divider />
      {data.columns.map((col, i) => (
        <div key={col.id} className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-2">Column {i + 1}</p>
          <TextField label="Heading" value={col.heading} onChange={(v) => updateCol(col.id, "heading", v)} />
        </div>
      ))}
    </div>
  );
}
