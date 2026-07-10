import { TextField, CheckboxField, Divider, ListHeader, ListItemWrapper } from "./_fields";

let _uid = Date.now();
const uid = () => `rev-${_uid++}`;

export default function ReviewsEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });

  if (sectionType === "review-testimony") {
    return (
      <div>
        <TextField label="Citation" value={data.quote || ""} onChange={(v) => set("quote", v)} multiline />
        <TextField label="Auteur" value={data.author || ""} onChange={(v) => set("author", v)} />
        <TextField label="Projet" value={data.project || ""} onChange={(v) => set("project", v)} />
        <CheckboxField label="Retour verifie MEEREO" checked={data.verified ?? true} onChange={(v) => set("verified", v)} />
      </div>
    );
  }

  if (sectionType === "review-structured") {
    return (
      <div>
        <TextField label="Contexte" value={data.context || ""} onChange={(v) => set("context", v)} multiline />
        <TextField label="Ce qui a ete livre" value={data.delivered || ""} onChange={(v) => set("delivered", v)} multiline />
        <TextField label="Retour du client" value={data.feedback || ""} onChange={(v) => set("feedback", v)} multiline />
        <Divider />
        <TextField label="Auteur" value={data.author || ""} onChange={(v) => set("author", v)} />
        <CheckboxField label="Retour verifie MEEREO" checked={data.verified ?? true} onChange={(v) => set("verified", v)} />
      </div>
    );
  }

  // review-journal
  const updateReview = (id, k, v) => set("reviews", (data.reviews || []).map((r) => r.id === id ? { ...r, [k]: v } : r));
  const addReview = () => set("reviews", [...(data.reviews || []), { id: uid(), date: "", quote: "", author: "", project: "", verified: true }]);
  const removeReview = (id) => set("reviews", (data.reviews || []).filter((r) => r.id !== id));
  return (
    <div>
      <ListHeader label="Retours" onAdd={addReview} />
      {(data.reviews || []).map((r) => (
        <ListItemWrapper key={r.id} onRemove={() => removeReview(r.id)}>
          <TextField label="Date (ex: JANV. 2025)" value={r.date || ""} onChange={(v) => updateReview(r.id, "date", v)} />
          <TextField label="Citation" value={r.quote || ""} onChange={(v) => updateReview(r.id, "quote", v)} multiline />
          <TextField label="Auteur" value={r.author || ""} onChange={(v) => updateReview(r.id, "author", v)} />
          <TextField label="Projet" value={r.project || ""} onChange={(v) => updateReview(r.id, "project", v)} />
          <CheckboxField label="Verifie MEEREO" checked={r.verified ?? true} onChange={(v) => updateReview(r.id, "verified", v)} />
        </ListItemWrapper>
      ))}
    </div>
  );
}
