import { TextField, ImageField, Divider } from "./_fields";
export default function HeroEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div>
      <TextField label="Badge" value={data.badge || ""} onChange={(v) => set("badge", v)} />
      <TextField label="Title" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />
      <Divider />
      <TextField label="CTA Text" value={data.ctaText} onChange={(v) => set("ctaText", v)} />
      <TextField label="CTA Link" value={data.ctaLink} onChange={(v) => set("ctaLink", v)} />
      <TextField label="Secondary Text" value={data.secondaryText || ""} onChange={(v) => set("secondaryText", v)} />
      <TextField label="Secondary Link" value={data.secondaryLink || ""} onChange={(v) => set("secondaryLink", v)} />
      <Divider />
      <ImageField label="Image" value={data.imageSrc} onChange={(v) => set("imageSrc", v)} />
      <TextField label="Image Alt" value={data.imageAlt || ""} onChange={(v) => set("imageAlt", v)} />
    </div>
  );
}
