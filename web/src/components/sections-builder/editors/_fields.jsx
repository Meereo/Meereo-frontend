import { useState, useRef } from 'react'

export function TextField({ label, value, onChange, placeholder, multiline }) {
  const cls = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors";
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3} className={cls} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  );
}

export function ImageField({ label, value, onChange }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const { uploadFile } = await import('../../../utils/upload')
      const url = await uploadFile(file, 'pages', file.name)
      onChange(url)
    } catch {
      // Fallback base64
      const reader = new FileReader()
      reader.onload = () => onChange(reader.result)
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]) }
  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      {value ? (
        <div className="relative group">
          <img src={value} alt="" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <button onClick={() => inputRef.current?.click()} className="px-3 py-1.5 bg-white text-gray-800 text-xs font-semibold rounded-md">Changer</button>
            <button onClick={() => onChange('')} className="px-3 py-1.5 bg-white/20 text-white text-xs font-semibold rounded-md border border-white/30">Supprimer</button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
          className={`flex flex-col items-center justify-center gap-1.5 py-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${dragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span className="text-xs text-gray-400 font-medium">Cliquer ou glisser une image</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function CheckboxField({ label, checked, onChange }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 rounded border-gray-300" />
      <label className="text-xs font-medium text-gray-500">{label}</label>
    </div>
  );
}

export function Divider() {
  return <div className="border-t border-gray-100 my-5" />;
}

export function ListHeader({ label, onAdd }) {
  return (
    <div className="flex items-center justify-between mb-2 mt-1">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <button onClick={onAdd} className="text-xs text-blue-500 hover:text-blue-700 font-medium">+ Ajouter</button>
    </div>
  );
}

export function ListItemWrapper({ children, onRemove }) {
  return (
    <div className="relative bg-gray-50 rounded-lg p-3 mb-2 border border-gray-100">
      <button onClick={onRemove} className="absolute top-2 right-2 text-gray-300 hover:text-red-400 text-xs font-bold">✕</button>
      {children}
    </div>
  );
}
