import { useState, useCallback, useEffect } from "react";
import TopBar from "./TopBar";
import LeftSidebar from "./LeftSidebar";
import Canvas from "./Canvas";
import RightSidebar from "./RightSidebar";
import Toast from "./ui/Toast";
import SectionRenderer from "./SectionRenderer";
import { DEFAULT_PAGE, genId } from "./constants";

const deepClone = (x) => JSON.parse(JSON.stringify(x));
const reorder = (arr, from, to) => { const next = [...arr]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; };

function PreviewModal({ sections, onClose }) {
  useEffect(() => { const fn = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn); }, [onClose]);
  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-gray-900">
      <div className="flex items-center justify-between px-6 h-12 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-sm font-medium text-gray-300">Aperçu</span></div>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors">✕ Fermer</button>
      </div>
      <div className="flex-1 overflow-auto bg-white">{sections.map((s) => <SectionRenderer key={s.id} section={s} />)}</div>
    </div>
  );
}

// initialSections: sections JSON to load (from DB)
// onSave(sections): called when user saves
// onPublish(sections): called when user publishes
// onClose: called when user closes the builder
export default function SectionsBuilder({ initialSections, onSave: onSaveProp, onPublish: onPublishProp, onClose, pageTitle: initialTitle }) {
  const [sections, setSections] = useState(() => initialSections?.length ? deepClone(initialSections) : deepClone(DEFAULT_PAGE));
  const [selectedId, setSelectedId] = useState(null);
  const [pageTitle, setPageTitle] = useState(initialTitle || "Ma page pro");
  const [saveStatus, setSaveStatus] = useState("saved");
  const [device, setDevice] = useState("desktop");
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [draggedTemplate, setDraggedTemplate] = useState(null);

  const showToast = useCallback((msg) => { setToast({ show: true, message: msg }); setTimeout(() => setToast({ show: false, message: "" }), 3000); }, []);
  const markUnsaved = useCallback(() => setSaveStatus("unsaved"), []);

  const addSection = useCallback((template) => {
    const newSection = { id: genId(), type: template.type, data: deepClone(template.defaultData) };
    setSections((prev) => [...prev, newSection]); setSelectedId(newSection.id); markUnsaved();
  }, [markUnsaved]);

  const handleDropFromLibrary = useCallback(() => { if (!draggedTemplate) return; addSection(draggedTemplate); setDraggedTemplate(null); }, [draggedTemplate, addSection]);
  const handleUpdate = useCallback((id, newData) => { setSections((prev) => prev.map((s) => s.id === id ? { ...s, data: newData } : s)); markUnsaved(); }, [markUnsaved]);
  const handleMove = useCallback((fromIdx, toIdx) => { if (toIdx < 0 || toIdx >= sections.length) return; setSections((prev) => reorder(prev, fromIdx, toIdx)); markUnsaved(); }, [sections.length, markUnsaved]);
  const handleDuplicate = useCallback((id) => { setSections((prev) => { const idx = prev.findIndex((s) => s.id === id); if (idx === -1) return prev; const clone = { ...deepClone(prev[idx]), id: genId() }; const next = [...prev]; next.splice(idx + 1, 0, clone); return next; }); markUnsaved(); }, [markUnsaved]);
  const handleDelete = useCallback((id) => { setSections((prev) => prev.filter((s) => s.id !== id)); setSelectedId((cur) => cur === id ? null : cur); markUnsaved(); }, [markUnsaved]);

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    if (onSaveProp) await onSaveProp(sections);
    setSaveStatus("saved"); showToast("Page sauvegardée !");
  }, [showToast, sections, onSaveProp]);

  const handlePublish = useCallback(async () => {
    setSaveStatus("saving");
    if (onPublishProp) await onPublishProp(sections);
    else if (onSaveProp) await onSaveProp(sections);
    setSaveStatus("saved"); showToast("Page publiée avec succès !");
  }, [showToast, sections, onPublishProp, onSaveProp]);

  useEffect(() => {
    const fn = (e) => {
      const isTyping = ["INPUT","TEXTAREA"].includes(e.target.tagName) || e.target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); handleSave(); }
      if (e.key === "Escape") setSelectedId(null);
      if (e.key === "Backspace" && selectedId && !isTyping) { e.preventDefault(); handleDelete(selectedId); }
    };
    window.addEventListener("keydown", fn); return () => window.removeEventListener("keydown", fn);
  }, [handleSave, handleDelete, selectedId]);

  const selectedSection = selectedId ? sections.find((s) => s.id === selectedId) ?? null : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white font-sans select-none">
      <TopBar pageTitle={pageTitle} setPageTitle={(t) => { setPageTitle(t); markUnsaved(); }} saveStatus={saveStatus}
        onSave={handleSave} onPreview={() => setShowPreview(true)} onPublish={handlePublish} onClose={onClose} device={device} setDevice={setDevice} />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <LeftSidebar onAdd={addSection} onDragStart={setDraggedTemplate} />
        <Canvas sections={sections} selectedId={selectedId} onSelect={setSelectedId} onUpdate={handleUpdate} onMove={handleMove} onDuplicate={handleDuplicate} onDelete={handleDelete} onDropFromLibrary={handleDropFromLibrary} device={device} />
        <RightSidebar section={selectedSection} onChange={handleUpdate} />
      </div>
      {showPreview && <PreviewModal sections={sections} onClose={() => setShowPreview(false)} />}
      <Toast show={toast.show} message={toast.message} />
    </div>
  );
}
