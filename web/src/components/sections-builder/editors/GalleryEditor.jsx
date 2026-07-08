import { TextField, ImageField, Divider } from "./_fields";
export default function GalleryEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  const updateImage = (id, k, v) => set("images", data.images.map((img) => img.id === id ? { ...img, [k]: v } : img));
  return (
    <div>
      <TextField label="Title" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} />
      <Divider />
      {data.images.map((img, i) => (
        <div key={img.id} className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-xs font-semibold text-gray-400 mb-2">Image {i + 1}</p>
          <ImageField label="Source" value={img.src} onChange={(v) => updateImage(img.id, "src", v)} />
          <TextField label="Alt text" value={img.alt} onChange={(v) => updateImage(img.id, "alt", v)} />
        </div>
      ))}
    </div>
  );
}
