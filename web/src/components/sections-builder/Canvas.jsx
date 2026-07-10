import { useState, useRef } from "react";
import Icon from "./ui/Icon";
import SectionRenderer from "./SectionRenderer";

const DEVICE_WIDTH = { desktop: "100%", tablet: "768px", mobile: "390px" };
const DEVICE_RADIUS = { desktop: "0", tablet: "16px", mobile: "20px" };

const DropLine = ({ active }) => (
  <div className={`h-1.5 rounded-full mx-4 transition-all duration-150 ${active ? "bg-blue-400 opacity-100 my-0.5" : "bg-transparent opacity-0 my-0"}`} />
);

function SectionWrapper({ section, index, total, isSelected, isHovered, onSelect, onHover, onMoveUp, onMoveDown, onDuplicate, onDelete, onDragStart, onDragOver, onDrop, dropBeforeActive, dropAfterActive }) {
  return (
    <div draggable onDragStart={() => onDragStart(index)} onDragOver={(e) => { e.preventDefault(); onDragOver(index); }} onDrop={() => onDrop(index)}>
      <DropLine active={dropBeforeActive} />
      <div
        className={`relative group/section transition-all duration-150 ${isSelected ? "ring-2 ring-blue-500 ring-offset-0" : isHovered ? "ring-2 ring-blue-200 ring-offset-0" : ""}`}
        onClick={(e) => { e.stopPropagation(); onSelect(section.id); }}
        onMouseEnter={() => onHover(section.id)}
        onMouseLeave={() => onHover(null)}
      >
        {isSelected && (
          <div className="absolute top-0 left-0 z-30 flex items-center gap-1 bg-blue-500 text-white text-xs px-2.5 py-1 rounded-br-lg font-medium select-none pointer-events-none">
            <Icon name="pencil" size={10} />{section.type}
          </div>
        )}
        <div className={`absolute top-2 right-2 z-30 flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-1.5 py-1 shadow-md transition-all duration-150 ${isHovered || isSelected ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"}`}>
          <span className="px-1 text-gray-400 cursor-grab active:cursor-grabbing"><Icon name="grip" size={14} /></span>
          <div className="w-px h-4 bg-gray-200" />
          <button title="Move up" onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={index === 0} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 transition-colors"><Icon name="arrowUp" size={13} /></button>
          <button title="Move down" onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={index === total - 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 transition-colors"><Icon name="arrowDown" size={13} /></button>
          <button title="Duplicate" onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"><Icon name="copy" size={13} /></button>
          <div className="w-px h-4 bg-gray-200" />
          <button title="Delete" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Icon name="trash" size={13} /></button>
        </div>
        <div className="pointer-events-none"><SectionRenderer section={section} /></div>
      </div>
      {dropAfterActive && <DropLine active={true} />}
    </div>
  );
}

export default function Canvas({ sections, selectedId, onSelect, onUpdate, onMove, onDuplicate, onDelete, onDropFromLibrary, device }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const canvasRef = useRef(null);

  const handleCanvasDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleCanvasDragLeave = (e) => { if (!canvasRef.current?.contains(e.relatedTarget)) setIsDragOver(false); };
  const handleCanvasDrop = (e) => { e.preventDefault(); setIsDragOver(false); onDropFromLibrary(); };
  const handleSectionDragStart = (idx) => setDragIndex(idx);
  const handleSectionDragOver = (idx) => setDropIndex(idx);
  const handleSectionDrop = (targetIdx) => {
    if (dragIndex !== null && dragIndex !== targetIdx) onMove(dragIndex, targetIdx);
    setDragIndex(null); setDropIndex(null);
  };

  return (
    <main className="flex-1 min-w-0 min-h-0 bg-gray-100 overflow-y-auto overflow-x-hidden" style={{ backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      onClick={() => onSelect(null)} onDragOver={handleCanvasDragOver} onDragLeave={handleCanvasDragLeave} onDrop={handleCanvasDrop}>
      <div className="flex justify-center min-h-full">
        <div ref={canvasRef} className={`relative bg-white shadow-xl my-8 transition-all duration-300 ease-in-out w-full pp-page ${isDragOver && sections.length === 0 ? "ring-4 ring-blue-400 ring-offset-4" : ""}`}
          style={{ maxWidth: DEVICE_WIDTH[device] ?? "100%", minHeight: "100vh", borderRadius: DEVICE_RADIUS[device] ?? "0", overflow: "hidden" }}
          id="pp-canvas">
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-5"><Icon name="layers" size={28} className="text-gray-400" /></div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Glissez une section ici pour commencer</h3>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-6">Parcourez la bibliothèque à gauche et glissez une section sur ce canvas.</p>
              <div className={`border-2 border-dashed rounded-2xl px-10 py-6 text-sm transition-all ${isDragOver ? "border-blue-400 bg-blue-50 text-blue-400" : "border-gray-200 text-gray-400"}`}>
                {isDragOver ? "Relâchez pour ajouter" : "↓ Déposez votre première section ici"}
              </div>
            </div>
          ) : (
            <div>
              {sections.map((section, i) => (
                <SectionWrapper key={section.id} section={section} index={i} total={sections.length} isSelected={selectedId === section.id} isHovered={hoveredId === section.id}
                  onSelect={onSelect} onHover={setHoveredId} onMoveUp={() => onMove(i, i - 1)} onMoveDown={() => onMove(i, i + 1)} onDuplicate={() => onDuplicate(section.id)} onDelete={() => onDelete(section.id)}
                  onDragStart={handleSectionDragStart} onDragOver={handleSectionDragOver} onDrop={handleSectionDrop}
                  dropBeforeActive={dropIndex === i && dragIndex !== null && dragIndex !== i} dropAfterActive={i === sections.length - 1 && dropIndex === i && dragIndex !== null && dragIndex !== i} />
              ))}
              <div className={`m-4 rounded-2xl border-2 border-dashed p-6 text-center text-sm transition-all ${isDragOver ? "border-blue-400 bg-blue-50 text-blue-400" : "border-gray-100 text-gray-300"}`}>
                {isDragOver ? "Déposer ici" : "+ Ajouter une section"}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
