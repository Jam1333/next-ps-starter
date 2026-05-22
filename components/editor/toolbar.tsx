"use client";

import { Paintbrush2, Move3D, Type, Square, Hand, Undo2, Redo2 } from "lucide-react";
import { useEditorStore } from "./use-editor-store";
import { Tool } from "@/lib/editor-state";

const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: "select", icon: <Move3D className="h-4 w-4" />, label: "Move" },
  { id: "brush", icon: <Paintbrush2 className="h-4 w-4" />, label: "Brush" },
  { id: "shape", icon: <Square className="h-4 w-4" />, label: "Shape" },
  { id: "text", icon: <Type className="h-4 w-4" />, label: "Text" },
  { id: "hand", icon: <Hand className="h-4 w-4" />, label: "Hand" }
];

export function Toolbar() {
  const { selectedTool, setTool, undo, redo } = useEditorStore();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button className="soft-btn" onClick={undo}>
        <Undo2 className="h-4 w-4" />
        Undo
      </button>
      <button className="soft-btn" onClick={redo}>
        <Redo2 className="h-4 w-4" />
        Redo
      </button>

      <div className="mx-2 hidden h-8 w-px bg-white/10 md:block" />

      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`soft-btn ${selectedTool === tool.id ? "soft-btn-active" : ""}`}
          onPointerDown={(e) => {e.preventDefault(); setTool(tool.id);}}
        >
          {tool.icon}
          {tool.label}
        </button>
      ))}
    </div>
  );
}
