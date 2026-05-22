"use client";

import { History, Save, RotateCcw, RotateCw } from "lucide-react";
import { useEditorStore } from "./use-editor-store";

export function HistoryPanel() {
  const { isDirty, isSaving, undo, redo, pushHistory, doc } = useEditorStore();

  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">History</h3>
          <p className="mt-1 text-sm text-slate-300">{isSaving ? "Saving..." : isDirty ? "Unsaved changes" : "All changes saved"}</p>
        </div>
        <History className="h-5 w-5 text-cyan-300" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="soft-btn" onClick={undo}>
          <RotateCcw className="h-4 w-4" />
          Undo
        </button>
        <button className="soft-btn" onClick={redo}>
          <RotateCw className="h-4 w-4" />
          Redo
        </button>
      </div>

      <button className="soft-btn mt-3 w-full" onClick={pushHistory}>
        <Save className="h-4 w-4" />
        Capture snapshot
      </button>

      <div className="mt-4 rounded-2xl border border-white/8 bg-white/5 p-3 text-xs text-slate-400">
        {doc.layers.length} layers · {doc.width}×{doc.height}px
      </div>
    </div>
  );
}
