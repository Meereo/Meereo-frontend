import { useState, useRef } from "react";
import Icon from "./ui/Icon";

const DEVICES = [
  { id: "desktop", icon: "desktop", label: "Desktop" },
  { id: "tablet", icon: "tablet", label: "Tablet" },
  { id: "mobile", icon: "mobile", label: "Mobile" },
];
const STATUS = {
  saved: { dot: "bg-emerald-400", text: "Sauvegardé", cls: "text-emerald-500" },
  unsaved: { dot: "bg-amber-400 animate-pulse", text: "Non sauvegardé", cls: "text-amber-500" },
  saving: { dot: "bg-blue-400 animate-pulse", text: "Sauvegarde…", cls: "text-blue-500" },
};
const Sep = () => <div className="w-px h-5 bg-gray-200" />;

export default function TopBar({ pageTitle, setPageTitle, saveStatus, onSave, onPreview, onPublish, onClose, device, setDevice, publicUrl }) {
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const s = STATUS[saveStatus] ?? STATUS.saved;
  const copyUrl = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => {});
  };
  return (
    <header className="h-13 bg-white border-b border-gray-100 flex items-center px-4 gap-3 shrink-0 z-50 shadow-sm" style={{ height: "52px" }}>
      <div className="flex items-center gap-2 mr-1 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gray-950 flex items-center justify-center"><Icon name="lightning" size={14} className="text-white" /></div>
        <span className="text-gray-900 text-sm font-bold tracking-tight">meereo</span>
      </div>
      <Sep />
      <div className="flex items-center gap-1.5 flex-1 min-w-0 max-w-xs">
        {editing ? (
          <input ref={inputRef} value={pageTitle} autoFocus onChange={(e) => setPageTitle(e.target.value)} onBlur={() => setEditing(false)} onKeyDown={(e) => e.key === "Enter" && setEditing(false)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-900 outline-none focus:border-gray-400 w-full font-medium" />
        ) : (
          <button onClick={() => { setEditing(true); setTimeout(() => inputRef.current?.select(), 0); }}
            className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors truncate max-w-full flex items-center gap-1.5">
            {pageTitle}<Icon name="pencil" size={11} className="text-gray-300 shrink-0" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-auto"><div className={`w-1.5 h-1.5 rounded-full ${s.dot}`} /><span className={`text-xs font-medium ${s.cls}`}>{s.text}</span></div>
      <Sep />
      <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5 shrink-0">
        {DEVICES.map(({ id, icon, label }) => (
          <button key={id} title={label} onClick={() => setDevice(id)} className={`p-1.5 rounded-md transition-all ${device === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}><Icon name={icon} size={14} /></button>
        ))}
      </div>
      <Sep />
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onPreview} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"><Icon name="eye" size={13} /> Aperçu</button>
        <button onClick={onSave} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"><Icon name="save" size={13} /> Sauvegarder</button>
        <button onClick={onPublish} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-gray-950 text-white rounded-lg hover:bg-gray-800 transition-colors"><Icon name="upload" size={13} /> Publier</button>
        {publicUrl && (
          <button onClick={copyUrl} title={publicUrl} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
            <Icon name={copied ? "check" : "link"} size={13} /> {copied ? "Copié !" : "Partager"}
          </button>
        )}
        {onClose && <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg border border-gray-200 transition-all"><Icon name="x" size={13} /></button>}
      </div>
    </header>
  );
}
