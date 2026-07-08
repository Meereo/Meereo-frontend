import { TextField, Divider } from "./_fields";
export default function StatsEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateStat = (id, k, v) => set("stats", data.stats.map((s) => s.id === id ? { ...s, [k]: v } : s));
  return (
    <div>
      <TextField label="Titre" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Sous-titre" value={data.subtitle || ""} onChange={(v) => set("subtitle", v)} />
      <Divider />
      {data.stats.map((s, i) => (
        <div key={s.id} className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-2">Chiffre {i + 1}</p>
          <TextField label="Valeur" value={s.value} onChange={(v) => updateStat(s.id, "value", v)} />
          <TextField label="Libellé" value={s.label} onChange={(v) => updateStat(s.id, "label", v)} />
        </div>
      ))}
    </div>
  );
}
