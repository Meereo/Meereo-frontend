import { TextField } from "./_fields";
export default function ContactEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div>
      <TextField label="Title" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />
      <TextField label="Email" value={data.email} onChange={(v) => set("email", v)} />
      <TextField label="Phone" value={data.phone} onChange={(v) => set("phone", v)} />
      <TextField label="Address" value={data.address} onChange={(v) => set("address", v)} />
    </div>
  );
}
