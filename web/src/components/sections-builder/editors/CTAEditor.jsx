import { TextField, Divider } from "./_fields";
export default function CTAEditor({ data, onChange }) {
  const set = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div>
      <TextField label="Title" value={data.title} onChange={(v) => set("title", v)} />
      <TextField label="Subtitle" value={data.subtitle} onChange={(v) => set("subtitle", v)} multiline />
      <Divider />
      <TextField label="CTA Text" value={data.ctaText} onChange={(v) => set("ctaText", v)} />
      <TextField label="CTA Link" value={data.ctaLink} onChange={(v) => set("ctaLink", v)} />
      <TextField label="Secondary Text" value={data.secondaryText || ""} onChange={(v) => set("secondaryText", v)} />
      <TextField label="Secondary Link" value={data.secondaryLink || ""} onChange={(v) => set("secondaryLink", v)} />
    </div>
  );
}
