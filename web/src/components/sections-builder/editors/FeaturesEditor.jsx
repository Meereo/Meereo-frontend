import { TextField, ImageField, Divider } from "./_fields";
export default function FeaturesEditor({ data, sectionType, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateFeature = (id, k, v) => set("features", data.features.map((f) => f.id === id ? { ...f, [k]: v } : f));
  return (
    <div>
      <TextField label="Title" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />
      <Divider />
      {data.features.map((f, i) => (
        <div key={f.id} className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-2">Feature {i + 1}</p>
          <TextField label="Title" value={f.title} onChange={(v) => updateFeature(f.id, "title", v)} />
          <TextField label="Description" value={f.description} onChange={(v) => updateFeature(f.id, "description", v)} multiline />
          {sectionType === "features-alternating" && <ImageField label="Image" value={f.imageSrc || ""} onChange={(v) => updateFeature(f.id, "imageSrc", v)} />}
          {sectionType === "features-grid" && <TextField label="Icon" value={f.icon || ""} onChange={(v) => updateFeature(f.id, "icon", v)} placeholder="zap, shield, layers..." />}
        </div>
      ))}
    </div>
  );
}
