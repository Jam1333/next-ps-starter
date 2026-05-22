export type Tool = "select" | "brush" | "shape" | "text" | "hand";

export type Point = { x: number; y: number };

export type Stroke = {
  id: string;
  points: Point[];
  color: string;
  size: number;
  opacity: number;
};

export type RasterLayer = {
  id: string;
  type: "raster";
  name: string;
  visible: boolean;
  opacity: number;
  locked: boolean;
  strokes: Stroke[];
};

export type TextLayer = {
  id: string;
  type: "text";
  name: string;
  visible: boolean;
  opacity: number;
  locked: boolean;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
};

export type ShapeLayer = {
  id: string;
  type: "shape";
  name: string;
  visible: boolean;
  opacity: number;
  locked: boolean;
  shape: "rect" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
};

export type Layer = RasterLayer | TextLayer | ShapeLayer;

export type EditorDocument = {
  width: number;
  height: number;
  background: string;
  zoom: number;
  pan: Point;
  selectedLayerId: string | null;
  activeTool: Tool;
  layers: Layer[];
};

export const starterDocument = (width = 1600, height = 1100): EditorDocument => ({
  width,
  height,
  background: "#090b16",
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedLayerId: null,
  activeTool: "brush",
  layers: [
    {
      id: "bg",
      type: "shape",
      name: "Background",
      visible: true,
      opacity: 1,
      locked: true,
      shape: "rect",
      x: 0,
      y: 0,
      width,
      height,
      fill: "linear-gradient(135deg, #0b1120, #111827)",
      stroke: "rgba(255,255,255,0.05)",
      strokeWidth: 1
    }
  ]
});
