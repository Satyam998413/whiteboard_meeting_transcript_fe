import React from 'react';
import { motion } from 'framer-motion';

const TOOLS = [
  { id: 'select', label: 'Select', icon: '↖' },
  { id: 'pen', label: 'Pen', icon: '✎' },
  { id: 'rectangle', label: 'Rectangle', icon: '▭' },
  { id: 'ellipse', label: 'Ellipse', icon: '◯' },
  { id: 'sticky', label: 'Sticky note', icon: '▤' },
];

const COLORS = ['#f8fafc', '#0d9488', '#f97316', '#ef4444', '#a855f7', '#facc15'];

export default function Toolbar({
  tool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) {
  return (
    <div className="glass flex flex-wrap items-center gap-2 p-2">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Drawing tool">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            role="radio"
            aria-checked={tool === t.id}
            title={t.label}
            onClick={() => onToolChange(t.id)}
            className="relative flex h-9 w-9 items-center justify-center rounded text-lg text-text-secondary hover:text-text-primary"
          >
            {tool === t.id && (
              <motion.span
                layoutId="toolbar-active"
                className="absolute inset-0 rounded bg-primary/20"
                transition={{ duration: 0.15 }}
              />
            )}
            <span className="relative">{t.icon}</span>
          </button>
        ))}
      </div>

      <div className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

      <div className="flex items-center gap-1" role="radiogroup" aria-label="Stroke color">
        {COLORS.map((c) => (
          <button
            key={c}
            role="radio"
            aria-checked={color === c}
            aria-label={`Color ${c}`}
            onClick={() => onColorChange(c)}
            className={`h-6 w-6 rounded-full border-2 transition-transform ${
              color === c ? 'scale-110 border-white' : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

      <label className="flex items-center gap-2 text-xs text-text-secondary">
        Width
        <input
          type="range"
          min={1}
          max={12}
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
          className="w-20 accent-primary"
        />
      </label>

      <div className="mx-1 h-6 w-px bg-border" aria-hidden="true" />

      <button
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo"
        className="h-9 w-9 rounded text-text-secondary hover:text-text-primary disabled:opacity-30"
      >
        ↺
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Redo"
        className="h-9 w-9 rounded text-text-secondary hover:text-text-primary disabled:opacity-30"
      >
        ↻
      </button>
    </div>
  );
}
