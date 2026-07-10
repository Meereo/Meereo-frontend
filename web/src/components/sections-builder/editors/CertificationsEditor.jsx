import { TextField, ListHeader, ListItemWrapper } from "./_fields";

let _uid = Date.now();
const uid = () => `cert-${_uid++}`;

export default function CertificationsEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateCert = (id, k, v) => set("certs", (data.certs || []).map((c) => c.id === id ? { ...c, [k]: v } : c));
  const addCert = () => set("certs", [...(data.certs || []), { id: uid(), name: "Nouvelle certification", issuer: "", year: "", mark: "" }]);
  const removeCert = (id) => set("certs", (data.certs || []).filter((c) => c.id !== id));

  return (
    <div>
      <ListHeader label="Certifications" onAdd={addCert} />
      {(data.certs || []).map((c) => (
        <ListItemWrapper key={c.id} onRemove={() => removeCert(c.id)}>
          <TextField label="Intitule" value={c.name} onChange={(v) => updateCert(c.id, "name", v)} />
          {sectionType === "cert-register" && (
            <TextField label="Organisme" value={c.issuer || ""} onChange={(v) => updateCert(c.id, "issuer", v)} />
          )}
          {sectionType === "cert-seals" && (
            <TextField label="Monogramme (2-3 lettres)" value={c.mark || ""} onChange={(v) => updateCert(c.id, "mark", v)} />
          )}
          <TextField label="Annee" value={c.year || ""} onChange={(v) => updateCert(c.id, "year", v)} />
        </ListItemWrapper>
      ))}
    </div>
  );
}
