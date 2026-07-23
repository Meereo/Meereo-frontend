import { TextField, ImageField, CheckboxField, Divider } from "./_fields";
export default function HeroEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div>
      <ImageField label="Logo" value={data.logoSrc || ""} onChange={(v) => set("logoSrc", v)} />
      <TextField label="Nom de l'entreprise" value={data.companyName} onChange={(v) => set("companyName", v)} />
      <TextField label="Categorie" value={data.category} onChange={(v) => set("category", v)} />
      <TextField label="Localisation" value={data.location} onChange={(v) => set("location", v)} />
      <CheckboxField label="Professionnel vérifié" checked={data.verified ?? true} onChange={(v) => set("verified", v)} />
      {sectionType === "hero-editorial" && (
        <>
          <Divider />
          <TextField label="Slogan" value={data.slogan || ""} onChange={(v) => set("slogan", v)} multiline />
          <TextField label="URL MEEREO" value={data.url || ""} onChange={(v) => set("url", v)} />
        </>
      )}
      {sectionType === "hero-banner" && (
        <>
          <Divider />
          <ImageField label="Photo de couverture" value={data.coverSrc || ""} onChange={(v) => set("coverSrc", v)} />
        </>
      )}
      <Divider />
      <TextField label="Texte bouton principal" value={data.ctaText || ""} onChange={(v) => set("ctaText", v)} />
      <TextField label="Texte bouton secondaire" value={data.secondaryText || ""} onChange={(v) => set("secondaryText", v)} />
    </div>
  );
}
