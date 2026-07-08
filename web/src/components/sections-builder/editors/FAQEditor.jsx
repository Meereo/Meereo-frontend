import { TextField, Divider } from "./_fields";
export default function FAQEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateFaq = (id, k, v) => set("faqs", data.faqs.map((f) => f.id === id ? { ...f, [k]: v } : f));
  return (
    <div>
      <TextField label="Titre" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Sous-titre" value={data.subtitle} onChange={(v) => set("subtitle", v)} />
      <Divider />
      {data.faqs.map((faq, i) => (
        <div key={faq.id} className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-2">Question {i + 1}</p>
          <TextField label="Question" value={faq.question} onChange={(v) => updateFaq(faq.id, "question", v)} />
          <TextField label="Réponse" value={faq.answer} onChange={(v) => updateFaq(faq.id, "answer", v)} multiline />
        </div>
      ))}
    </div>
  );
}
