import { TextField, Divider } from "./_fields";

export default function CoordinatesEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div>
      {(sectionType === "coord-footer") && (
        <div style={{ fontSize: 12, color: '#888', padding: '0 0 12px', borderBottom: '1px solid #eee', marginBottom: 12 }}>
          <div><strong>Nom</strong> : {data.companyName || <em style={{ color: '#bbb' }}>dérivé du profil</em>}</div>
          <div><strong>Catégorie</strong> : {data.category || <em style={{ color: '#bbb' }}>dérivée des secteurs</em>}</div>
        </div>
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
      {sectionType === "coord-map" && (
        <>
          <Divider />
          <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>Position GPS (carte)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <TextField label="Latitude" value={data.lat || ""} onChange={(v) => set("lat", v)} />
            <TextField label="Longitude" value={data.lng || ""} onChange={(v) => set("lng", v)} />
          </div>
        </>
      )}
    </div>
  );
}
