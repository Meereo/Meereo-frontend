import { TextField, Divider } from "./_fields";
export default function FooterEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div>
      <TextField label="Nom de l'entreprise" value={data.companyName} onChange={(v) => set("companyName", v)} />
      <TextField label="Accroche" value={data.tagline} onChange={(v) => set("tagline", v)} />
      <Divider />
      <TextField label="Email" value={data.email || ""} onChange={(v) => set("email", v)} />
      <TextField label="Téléphone" value={data.phone || ""} onChange={(v) => set("phone", v)} />
      <TextField label="Adresse" value={data.address || ""} onChange={(v) => set("address", v)} />
      <TextField label="Copyright" value={data.copyright} onChange={(v) => set("copyright", v)} />
    </div>
  );
}
