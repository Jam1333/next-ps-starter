"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  type EditorDocument,
  type Layer,
  type Point,
  type RasterLayer,
  type ShapeLayer,
  type Stroke,
  type TextLayer,
  type Tool,
  starterDocument,
} from "@/lib/editor-state";

type Snapshot = EditorDocument;

type EditorStore = {
  doc: EditorDocument;
  history: Snapshot[];
  future: Snapshot[];

  isDirty: boolean;
  isSaving: boolean;

  activeLayerId: string | null;

  brushColor: string;
  brushSize: number;

  selectedTool: Tool;

  setDocument: (doc: EditorDocument) => void;

  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  setTool: (tool: Tool) => void;
  setBrushColor: (color: string) => void;
  setBrushSize: (size: number) => void;

  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;

  markSaving: (saving: boolean) => void;
  markDirty: (dirty: boolean) => void;

  selectLayer: (layerId: string | null) => void;

  toggleVisibility: (layerId: string) => void;

  updateLayer: (layerId: string, updater: (layer: Layer) => Layer) => void;

  reorderLayer: (layerId: string, direction: "up" | "down") => void;

  addTextLayer: (position: Point) => void;
  addShapeLayer: (position: Point) => void;

  addBrushStroke: (layerId: string, stroke: Stroke) => void;
  appendStrokePoint: (layerId: string, strokeId: string, point: Point) => void;
  finishStroke: (layerId: string) => void;

  createRasterLayer: (name?: string) => string;
};

// =========================
// utils
// =========================

function snap(doc: EditorDocument): EditorDocument {
  return structuredClone(doc);
}

// =========================
// STORE
// =========================

export const useEditorStore = create<EditorStore>()(
  devtools((set, get) => ({
    doc: starterDocument(),
    history: [],
    future: [],

    isDirty: false,
    isSaving: false,

    activeLayerId: null,

    brushColor: "#ffffff",
    brushSize: 14,

    selectedTool: "brush",

    // =========================
    // CORE FIX: atomic history push
    // =========================

    pushHistory: () => {
      const { doc, history } = get();

      set({
        history: [...history.slice(-50), snap(doc)],
        future: [],
        isDirty: true,
      });
    },

    // =========================
    // FIXED UNDO (no stale state)
    // =========================

    undo: () => {
      for (let index = 0; index < 1; index++) {
        set((state) => {
          if (state.history.length === 0) return state;

          const prev = state.history[state.history.length - 1];

          return {
            doc: snap(prev),
            history: state.history.slice(0, -1),
            future: [snap(state.doc), ...state.future],
            isDirty: true,
          };
        });
      }
    },

    // =========================
    // FIXED REDO (no stale state)
    // =========================

    redo: () => {
      for (let index = 0; index < 1; index++) {
        set((state) => {
          if (state.future.length === 0) return state;

          const next = state.future[0];

          return {
            doc: snap(next),
            history: [...state.history, snap(state.doc)],
            future: state.future.slice(1),
            isDirty: true,
          };
        });
      }
    },

    // =========================
    // DOC
    // =========================

    setDocument: (doc) =>
      set({
        doc: snap(doc),
        history: [],
        future: [],
        isDirty: false,
      }),

    // =========================
    // TOOLING
    // =========================

    setTool: (tool) =>
      set((state) => ({
        selectedTool: tool,
        doc: { ...state.doc, activeTool: tool },
      })),

    setBrushColor: (color) => set({ brushColor: color }),
    setBrushSize: (size) => set({ brushSize: size }),

    setZoom: (zoom) =>
      set((state) => ({
        doc: { ...state.doc, zoom },
      })),

    setPan: (pan) =>
      set((state) => ({
        doc: { ...state.doc, pan },
      })),

    markSaving: (isSaving) => set({ isSaving }),
    markDirty: (isDirty) => set({ isDirty }),

    // =========================
    // SELECTION
    // =========================

    selectLayer: (layerId) =>
      set((state) => ({
        activeLayerId: layerId,
        doc: { ...state.doc, selectedLayerId: layerId },
      })),

    toggleVisibility: (layerId) =>
      set((state) => ({
        doc: {
          ...state.doc,
          layers: state.doc.layers.map((l) =>
            l.id === layerId ? { ...l, visible: !l.visible } : l,
          ),
        },
      })),

    updateLayer: (layerId, updater) =>
      set((state) => ({
        doc: {
          ...state.doc,
          layers: state.doc.layers.map((l) =>
            l.id === layerId ? updater(l) : l,
          ),
        },
      })),

    reorderLayer: (layerId, direction) =>
      set((state) => {
        const layers = [...state.doc.layers];
        const i = layers.findIndex((l) => l.id === layerId);
        if (i === -1) return state;

        const j = direction === "up" ? i + 1 : i - 1;
        if (j < 0 || j >= layers.length) return state;

        [layers[i], layers[j]] = [layers[j], layers[i]];

        return {
          doc: {
            ...state.doc,
            layers,
          },
        };
      }),

    // =========================
    // TEXT
    // =========================

    addTextLayer: (position) =>
      set((state) => {
        const layer: TextLayer = {
          id: crypto.randomUUID(),
          type: "text",
          name: "Text",
          visible: true,
          opacity: 1,
          locked: false,
          x: position.x,
          y: position.y,
          text: "Neon headline",
          fontSize: 64,
          color: "#ffffff",
          fontFamily: "Inter",
        };

        const doc = {
          ...state.doc,
          layers: [...state.doc.layers, layer],
          selectedLayerId: layer.id,
        };

        return {
          doc,
          activeLayerId: layer.id,
          history: [...state.history.slice(-50), snap(state.doc)],
          future: [],
          isDirty: true,
        };
      }),

    // =========================
    // SHAPE
    // =========================

    addShapeLayer: (position) =>
      set((state) => {
        const layer: ShapeLayer = {
          id: crypto.randomUUID(),
          type: "shape",
          name: "Shape",
          visible: true,
          opacity: 1,
          locked: false,
          shape: "rect",
          x: position.x - 100,
          y: position.y - 60,
          width: 200,
          height: 120,
          fill: "rgba(168,85,247,0.35)",
          stroke: "rgba(255,255,255,0.16)",
          strokeWidth: 2,
        };

        return {
          doc: {
            ...state.doc,
            layers: [...state.doc.layers, layer],
            selectedLayerId: layer.id,
          },
          activeLayerId: layer.id,
          history: [...state.history.slice(-50), snap(state.doc)],
          future: [],
          isDirty: true,
        };
      }),

    // =========================
    // RASTER
    // =========================

    createRasterLayer: (name = "Brush Layer") => {
      const layer: RasterLayer = {
        id: crypto.randomUUID(),
        type: "raster",
        name,
        visible: true,
        opacity: 1,
        locked: false,
        strokes: [],
      };

      set((state) => ({
        doc: {
          ...state.doc,
          layers: [...state.doc.layers, layer],
          selectedLayerId: layer.id,
        },
        activeLayerId: layer.id,
        history: [...state.history.slice(-50), snap(state.doc)],
        future: [],
        isDirty: true,
      }));

      return layer.id;
    },

    // =========================
    // BRUSH
    // =========================

    addBrushStroke: (layerId, stroke) =>
      set((state) => ({
        doc: {
          ...state.doc,
          layers: state.doc.layers.map((l) =>
            l.id === layerId && l.type === "raster"
              ? { ...l, strokes: [...l.strokes, stroke] }
              : l,
          ),
        },
        isDirty: true,
      })),

    appendStrokePoint: (layerId, strokeId, point) =>
      set((state) => ({
        doc: {
          ...state.doc,
          layers: state.doc.layers.map((l) => {
            if (l.id !== layerId || l.type !== "raster") return l;

            return {
              ...l,
              strokes: l.strokes.map((s) =>
                s.id === strokeId ? { ...s, points: [...s.points, point] } : s,
              ),
            };
          }),
        },
      })),

    finishStroke: (layerId) =>
      set((state) => ({
        history: [...state.history.slice(-50), snap(state.doc)],
        future: [],
        isDirty: true,
      })),
  })),
);
