import { TextField, ImageField, Divider } from "./_fields";
export default function HeroEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div>
      <TextField label="Nom de l'entreprise" value={data.companyName} onChange={(v) => set("companyName", v)} />
      <TextField label="Accroche" value={data.tagline} onChange={(v) => set("tagline", v)} />
      <TextField label="Description" value={data.description} onChange={(v) => set("description", v)} multiline />
      <TextField label="Badge (spécialités)" value={data.badge || ""} onChange={(v) => set("badge", v)} />
      <Divider />
      <TextField label="Texte du bouton" value={data.ctaText} onChange={(v) => set("ctaText", v)} />
      <TextField label="Lien du bouton" value={data.ctaLink} onChange={(v) => set("ctaLink", v)} />
      <TextField label="Texte secondaire" value={data.secondaryText || ""} onChange={(v) => set("secondaryText", v)} />
      <TextField label="Lien secondaire" value={data.secondaryLink || ""} onChange={(v) => set("secondaryLink", v)} />
      <Divider />
      <ImageField label="Image" value={data.imageSrc} onChange={(v) => set("imageSrc", v)} />
      <TextField label="Alt de l'image" value={data.imageAlt || ""} onChange={(v) => set("imageAlt", v)} />
    </div>
  );
}
