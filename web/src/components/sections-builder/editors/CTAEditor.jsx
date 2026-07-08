import { TextField, Divider } from "./_fields";
export default function CTAEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div>
      <TextField label="Titre" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Sous-titre" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />
      <Divider />
      <TextField label="Texte du bouton" value={data.ctaText} onChange={(v) => set("ctaText", v)} />
      <TextField label="Lien du bouton" value={data.ctaLink} onChange={(v) => set("ctaLink", v)} />
      <TextField label="Texte secondaire" value={data.secondaryText || ""} onChange={(v) => set("secondaryText", v)} />
      <TextField label="Lien secondaire" value={data.secondaryLink || ""} onChange={(v) => set("secondaryLink", v)} />
    </div>
  );
}
