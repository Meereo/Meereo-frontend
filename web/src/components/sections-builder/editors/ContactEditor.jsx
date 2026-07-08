import { TextField } from "./_fields";
export default function ContactEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div>
      <TextField label="Titre" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Sous-titre" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />
      <TextField label="Email" value={data.email} onChange={(v) => set("email", v)} />
      <TextField label="Téléphone" value={data.phone} onChange={(v) => set("phone", v)} />
      <TextField label="Adresse" value={data.address} onChange={(v) => set("address", v)} />
      <TextField label="Horaires" value={data.hours || ""} onChange={(v) => set("hours", v)} />
    </div>
  );
}
