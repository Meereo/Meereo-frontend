import { TextField, Divider } from "./_fields";
export default function PricingEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updatePlan = (id, k, v) => set("plans", data.plans.map((p) => p.id === id ? { ...p, [k]: v } : p));
  return (
    <div>
      <TextField label="Title" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} />
      <Divider />
      {data.plans.map((plan, i) => (
        <div key={plan.id} className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-2">Plan {i + 1}</p>
          <TextField label="Name" value={plan.name} onChange={(v) => updatePlan(plan.id, "name", v)} />
          <TextField label="Price" value={plan.price} onChange={(v) => updatePlan(plan.id, "price", v)} />
          <TextField label="Period" value={plan.period} onChange={(v) => updatePlan(plan.id, "period", v)} />
          <TextField label="Description" value={plan.description} onChange={(v) => updatePlan(plan.id, "description", v)} />
          <TextField label="CTA Text" value={plan.ctaText} onChange={(v) => updatePlan(plan.id, "ctaText", v)} />
        </div>
      ))}
    </div>
  );
}
