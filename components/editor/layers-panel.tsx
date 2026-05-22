"use client";

import { Eye, EyeOff, ChevronsUp, ChevronsDown, Plus, Layers2 } from "lucide-react";
import { useEditorStore } from "./use-editor-store";

export function LayersPanel() {
  const { doc, selectLayer, toggleVisibility, reorderLayer, createRasterLayer, addTextLayer, addShapeLayer, activeLayerId } =
    useEditorStore();

  return (
    <div className="h-[95vh] panel overflow-y-scroll p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Layers</h3>
          <p className="mt-1 text-sm text-slate-300">Your document stack.</p>
        </div>
        <Layers2 className="h-5 w-5 text-violet-300" />
      </div>

      <div className="mb-3 grid gap-2">
        <button className="soft-btn justify-start" onClick={() => createRasterLayer("New Brush Layer")}>
          <Plus className="h-4 w-4" />
          New brush layer
        </button>
        <button className="soft-btn justify-start" onClick={() => addTextLayer({ x: 200, y: 220 })}>
          <Plus className="h-4 w-4" />
          Add text
        </button>
        <button className="soft-btn justify-start" onClick={() => addShapeLayer({ x: 260, y: 280 })}>
          <Plus className="h-4 w-4" />
          Add shape
        </button>
      </div>

      <div className="space-y-2 overflow-auto pr-1">
        {doc.layers
          .slice()
          .reverse()
          .map((layer) => (
            <div
              key={layer.id}
              onClick={() => selectLayer(layer.id)}
              className={`group rounded-2xl border px-3 py-3 transition ${
                activeLayerId === layer.id ? "border-violet-400/30 bg-violet-500/12" : "border-white/8 bg-white/5 hover:bg-white/8"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-white">{layer.name}</div>
                  <div className="mt-1 text-xs text-slate-400 capitalize">
                    {layer.type} · opacity {Math.round(layer.opacity * 100)}%
                  </div>
                </div>

                <button
                  className="soft-btn h-9 w-9 shrink-0 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(layer.id);
                  }}
                >
                  {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>

              <div className="mt-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
                <button
                  className="soft-btn h-8 px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderLayer(layer.id, "up");
                  }}
                >
                  <ChevronsUp className="h-3.5 w-3.5" />
                </button>
                <button
                  className="soft-btn h-8 px-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    reorderLayer(layer.id, "down");
                  }}
                >
                  <ChevronsDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
