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
  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Image URL" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400 transition-colors" />
      {value && <img src={value} alt="" className="mt-2 w-full h-20 object-cover rounded-lg border border-gray-100" />}
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
