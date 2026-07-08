import { TextField, ImageField, Divider } from "./_fields";
export default function TeamEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateMember = (id, k, v) => set("members", data.members.map((m) => m.id === id ? { ...m, [k]: v } : m));
  return (
    <div>
      <TextField label="Titre" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Sous-titre" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />
      <Divider />
      {data.members.map((m, i) => (
        <div key={m.id} className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-2">Membre {i + 1}</p>
          <TextField label="Nom" value={m.name} onChange={(v) => updateMember(m.id, "name", v)} />
          <TextField label="Poste" value={m.role} onChange={(v) => updateMember(m.id, "role", v)} />
          <ImageField label="Photo" value={m.photoSrc} onChange={(v) => updateMember(m.id, "photoSrc", v)} />
        </div>
      ))}
    </div>
  );
}
