import { TextField, Divider } from "./_fields";

export default function CoordinatesEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div>
      {(sectionType === "coord-footer") && (
        <>
          <TextField label="Nom de l'entreprise" value={data.companyName || ""} onChange={(v) => set("companyName", v)} />
          <TextField label="Catégorie" value={data.category || ""} onChange={(v) => set("category", v)} />
          <Divider />
        </>
      )}
      <TextField label="Adresse" value={data.address || ""} onChange={(v) => set("address", v)} multiline />
      <TextField label="Téléphone" value={data.phone || ""} onChange={(v) => set("phone", v)} />
      <TextField label="E-mail" value={data.email || ""} onChange={(v) => set("email", v)} />
      <TextField label="Site Internet" value={data.website || ""} onChange={(v) => set("website", v)} />
      {(sectionType === "coord-sheet") && (
        <TextField label="Réseaux sociaux" value={data.socials || ""} onChange={(v) => set("socials", v)} />
      )}
      {(sectionType === "coord-footer" || sectionType === "coord-map") && (
        <TextField label="URL MEEREO" value={data.url || ""} onChange={(v) => set("url", v)} />
      )}
    </div>
  );
}
