"use client";

import { useMemo } from "react";
import { useEditorStore } from "./use-editor-store";
import { TextLayer, ShapeLayer, RasterLayer } from "@/lib/editor-state";

export function Inspector() {
  const { doc, activeLayerId, updateLayer, brushColor, brushSize, setBrushColor, setBrushSize } = useEditorStore();
  const layer = useMemo(() => doc.layers.find((item) => item.id === activeLayerId), [doc.layers, activeLayerId]);

  const inputClass = "input";
  const labelClass = "label";

  return (
    <div className="panel h-[95vh] overflow-y-scroll p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Inspector</h3>
        <p className="mt-1 text-sm text-slate-300">Tweak selected layer and brush settings.</p>
      </div>

      <div className="space-y-4">
        <section className="rounded-3xl border border-white/8 bg-white/5 p-4">
          <span className={labelClass}>Brush</span>
          <label className="mb-3 block text-xs text-slate-400">Color</label>
          <input className={inputClass + " h-11 p-1"} type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} />
          <label className="mt-4 mb-2 block text-xs text-slate-400">Size: {brushSize}px</label>
          <input className="w-full accent-violet-400" type="range" min="2" max="60" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} />
        </section>

        {layer ? (
          <section className="rounded-3xl border border-white/8 bg-white/5 p-4">
            <span className={labelClass}>Layer</span>
            <input
              className={inputClass}
              value={layer.name}
              onChange={(e) => updateLayer(layer.id, (current) => ({ ...current, name: e.target.value }))}
            />
            <div className="mt-3 grid gap-3">
              <label className="text-xs text-slate-400">Opacity: {Math.round(layer.opacity * 100)}%</label>
              <input
                className="w-full accent-violet-400"
                type="range"
                min="0.1"
                max="1"
                step="0.01"
                value={layer.opacity}
                onChange={(e) => updateLayer(layer.id, (current) => ({ ...current, opacity: Number(e.target.value) }))}
              />
            </div>

            {layer.type === "text" ? (
              <TextInspector layer={layer} onChange={(next) => updateLayer(layer.id, () => next)} />
            ) : null}

            {layer.type === "shape" ? (
              <ShapeInspector layer={layer} onChange={(next) => updateLayer(layer.id, () => next)} />
            ) : null}

            {layer.type === "raster" ? <RasterInspector layer={layer} /> : null}
          </section>
        ) : (
          <section className="rounded-3xl border border-white/8 bg-white/5 p-4 text-sm text-slate-400">
            Select a layer to edit its properties.
          </section>
        )}
      </div>
    </div>
  );
}

function TextInspector({ layer, onChange }: { layer: TextLayer; onChange: (next: TextLayer) => void }) {
  return (
    <div className="mt-4 space-y-3">
      <div>
        <label className="mb-2 block text-xs text-slate-400">Text</label>
        <textarea
          className="input min-h-28 resize-none"
          value={layer.text}
          onChange={(e) => onChange({ ...layer, text: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-xs text-slate-400">Font size</label>
          <input className="input" type="number" value={layer.fontSize} onChange={(e) => onChange({ ...layer, fontSize: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-2 block text-xs text-slate-400">Color</label>
          <input className="input h-11 p-1" type="color" value={layer.color} onChange={(e) => onChange({ ...layer, color: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function ShapeInspector({ layer, onChange }: { layer: ShapeLayer; onChange: (next: ShapeLayer) => void }) {
  return (
    <div className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-xs text-slate-400">X</label>
          <input className="input" type="number" value={layer.x} onChange={(e) => onChange({ ...layer, x: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-2 block text-xs text-slate-400">Y</label>
          <input className="input" type="number" value={layer.y} onChange={(e) => onChange({ ...layer, y: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-2 block text-xs text-slate-400">Width</label>
          <input className="input" type="number" value={layer.width} onChange={(e) => onChange({ ...layer, width: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-2 block text-xs text-slate-400">Height</label>
          <input className="input" type="number" value={layer.height} onChange={(e) => onChange({ ...layer, height: Number(e.target.value) })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-2 block text-xs text-slate-400">Fill</label>
          <input className="input h-11 p-1" type="color" value={toHex(layer.fill)} onChange={(e) => onChange({ ...layer, fill: e.target.value })} />
        </div>
        <div>
          <label className="mb-2 block text-xs text-slate-400">Stroke</label>
          <input className="input h-11 p-1" type="color" value={toHex(layer.stroke)} onChange={(e) => onChange({ ...layer, stroke: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function RasterInspector({ layer }: { layer: RasterLayer }) {
  return (
    <div className="mt-4 rounded-2xl border border-white/8 bg-slate-950/40 p-3 text-xs text-slate-400">
      {layer.strokes.length} stroke(s) in this layer
    </div>
  );
}

function toHex(value: string) {
  if (value.startsWith("#")) return value;
  return "#ffffff";
}
