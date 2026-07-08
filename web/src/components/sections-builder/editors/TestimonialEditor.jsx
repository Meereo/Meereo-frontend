import { TextField, ImageField, Divider } from "./_fields";
export default function TestimonialEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  if (sectionType === "testimonial-single") {
    return (
      <div>
        <TextField label="Quote" value={data.quote} onChange={(v) => set("quote", v)} multiline />
        <TextField label="Name" value={data.name} onChange={(v) => set("name", v)} />
        <TextField label="Role" value={data.role} onChange={(v) => set("role", v)} />
        <ImageField label="Avatar" value={data.avatarSrc} onChange={(v) => set("avatarSrc", v)} />
      </div>
    );
  }
  const updateTestimonial = (id, k, v) => set("testimonials", data.testimonials.map((t) => t.id === id ? { ...t, [k]: v } : t));
  return (
    <div>
      <TextField label="Title" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} />
      <Divider />
      {data.testimonials.map((t, i) => (
        <div key={t.id} className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-2">Testimonial {i + 1}</p>
          <TextField label="Quote" value={t.quote} onChange={(v) => updateTestimonial(t.id, "quote", v)} multiline />
          <TextField label="Name" value={t.name} onChange={(v) => updateTestimonial(t.id, "name", v)} />
          <TextField label="Role" value={t.role} onChange={(v) => updateTestimonial(t.id, "role", v)} />
          <ImageField label="Avatar" value={t.avatarSrc} onChange={(v) => updateTestimonial(t.id, "avatarSrc", v)} />
        </div>
      ))}
    </div>
  );
}
