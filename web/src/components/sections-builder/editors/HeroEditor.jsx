import { TextField, ImageField, Divider } from "./_fields";

// INS-04 / INS-17 : les champs dérivés (companyName, category, location,
// verified) sont injectés depuis le profil, jamais saisis.
// Seuls restent éditables : photo de couverture, slogan, URL, textes de boutons.

export default function HeroEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div>
      {/* Champs dérivés — lecture seule */}
      <div style={{ fontSize: 12, color: '#888', padding: '8px 0 12px', borderBottom: '1px solid #eee', marginBottom: 12 }}>
        <div><strong>Nom</strong> : {data.companyName || <em style={{ color: '#bbb' }}>dérivé du profil</em>}</div>
        <div><strong>Catégorie</strong> : {data.category || <em style={{ color: '#bbb' }}>dérivée des secteurs</em>}</div>
        <div><strong>Localisation</strong> : {data.location || <em style={{ color: '#bbb' }}>dérivée de la ville</em>}</div>
        <div><strong>Badge vérifié</strong> : {data.verified ? '✓ affiché' : <em style={{ color: '#bbb' }}>dérivé de la vérification INS-04</em>}</div>
      </div>

      <ImageField label="Logo" value={data.logoSrc || ""} onChange={(v) => set("logoSrc", v)} />

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
