import { TextField, Divider } from "./_fields";
export default function ServicesEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateService = (id, k, v) => set("services", data.services.map((s) => s.id === id ? { ...s, [k]: v } : s));
  return (
    <div>
      <TextField label="Titre" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Sous-titre" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />
      <Divider />
      {data.services.map((s, i) => (
        <div key={s.id} className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-2">Service {i + 1}</p>
          <TextField label="Titre" value={s.title} onChange={(v) => updateService(s.id, "title", v)} />
          <TextField label="Description" value={s.description} onChange={(v) => updateService(s.id, "description", v)} multiline />
          <TextField label="Icône" value={s.icon || ""} onChange={(v) => updateService(s.id, "icon", v)} placeholder="building, ruler, hardhat..." />
        </div>
      ))}
    </div>
  );
}
