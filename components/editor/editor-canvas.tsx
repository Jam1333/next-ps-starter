"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "./use-editor-store";
import { type Point, type Stroke } from "@/lib/editor-state";
import { clamp } from "@/lib/utils";

function screenToDoc(
  e: React.PointerEvent<HTMLCanvasElement>,
  rect: DOMRect,
  zoom: number,
  pan: Point,
): Point {
  return {
    x: (e.clientX - rect.left - pan.x) / zoom,
    y: (e.clientY - rect.top - pan.y) / zoom,
  };
}

export function EditorCanvas({
  initialDocumentId,
}: {
  initialDocumentId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const drag = useRef<any>({
    drawing: false,
    moving: false,
    layerId: null,
    strokeId: null,
    last: null,
  });

  const {
    doc,
    selectedTool,
    activeLayerId,
    brushColor,
    brushSize,
    selectLayer,
    createRasterLayer,
    addBrushStroke,
    appendStrokePoint,
    finishStroke,
    updateLayer,
    setPan,
    setZoom,
    addTextLayer,
    addShapeLayer,
  } = useEditorStore();

  const [size, setSize] = useState({ width: 0, height: 0 });

  const [hoveredLayerId, setHoveredLayerId] = useState<string | null>(null);

  // ===== SIZE =====
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const box = el.getBoundingClientRect();
      setSize({
        width: Math.floor(box.width),
        height: Math.floor(box.height),
      });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ===== RENDER =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.width || !size.height) return;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;

    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    draw(ctx, size.width, size.height, doc, activeLayerId, hoveredLayerId);
  }, [doc, size, activeLayerId, hoveredLayerId]);

  const getRect = () => canvasRef.current!.getBoundingClientRect();

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = getRect();
    const p = screenToDoc(e, rect, doc.zoom, doc.pan);

    canvasRef.current?.setPointerCapture(e.pointerId);

    if (selectedTool === "text") {
      addTextLayer(p);
      return;
    }

    if (selectedTool === "shape") {
      addShapeLayer(p);
      return;
    }

    if (selectedTool === "brush") {
      const layerId = createRasterLayer("Brush");

      const stroke: Stroke = {
        id: crypto.randomUUID(),
        points: [p],
        color: brushColor,
        size: brushSize,
        opacity: 1,
      };

      drag.current = {
        drawing: true,
        layerId,
        strokeId: stroke.id,
        last: p,
      };

      addBrushStroke(layerId, stroke);
      return;
    }

    if (selectedTool === "select") {
      const hit = [...doc.layers].reverse().find((l) => contains(l, p));

      selectLayer(hit?.id ?? null);

      if (hit) {
        drag.current = {
          moving: true,
          layerId: hit.id,
          last: p,
        };
      }
    }

    if (selectedTool === "hand") {
      drag.current = { moving: true, last: p };
    }
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = getRect();
    const p = screenToDoc(e, rect, doc.zoom, doc.pan);
    const d = drag.current;

    // hover detection (cheap)
    if (!d.drawing && !d.moving && selectedTool === "select") {
      const hit = [...doc.layers].reverse().find((l) => contains(l, p));
      setHoveredLayerId(hit?.id ?? null);
    }

    if (d.drawing) {
      appendStrokePoint(d.layerId, d.strokeId, p);
      return;
    }

    if (d.moving && selectedTool === "select") {
      const dx = p.x - d.last.x;
      const dy = p.y - d.last.y;

      updateLayer(d.layerId, (l: any) => ({
        ...l,
        x: l.x + dx,
        y: l.y + dy,
      }));

      d.last = p;
    }

    if (d.moving && selectedTool === "hand") {
      setPan({
        x: doc.pan.x + e.movementX,
        y: doc.pan.y + e.movementY,
      });
    }
  };

  const onUp = () => {
    const d = drag.current;
    if (d.drawing) finishStroke(d.layerId);
    drag.current = {};
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[100%] w-full overflow-hidden bg-neutral-950"
    >
      {/* GRID BACKGROUND */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 touch-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        style={{
          cursor:
            selectedTool === "hand"
              ? "grab"
              : selectedTool === "brush"
                ? "crosshair"
                : "default",
        }}
      />

      {/* HUD */}
      <div className="absolute left-4 top-4 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/70 backdrop-blur-md border border-white/10">
        {initialDocumentId} · {Math.round(doc.zoom * 100)}%
      </div>

      {/* ZOOM */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 border border-white/10"
          onClick={() => setZoom(clamp(doc.zoom - 0.1, 0.3, 2.5))}
        >
          -
        </button>
        <button
          className="px-3 py-1 rounded-lg bg-white/10 text-white hover:bg-white/20 border border-white/10"
          onClick={() => setZoom(clamp(doc.zoom + 0.1, 0.3, 2.5))}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ================= DRAW =================

function draw(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  doc: any,
  activeLayerId: string | null,
  hoveredLayerId: string | null,
) {
  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.translate(doc.pan.x, doc.pan.y);
  ctx.scale(doc.zoom, doc.zoom);

  for (const l of doc.layers) {
    if (!l.visible) continue;

    ctx.save();
    ctx.globalAlpha = l.opacity ?? 1;

    // BRUSH
    if (l.type === "raster") {
      for (const s of l.strokes) {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        if (s.points.length) {
          ctx.moveTo(s.points[0].x, s.points[0].y);
          for (let i = 1; i < s.points.length; i++) {
            ctx.lineTo(s.points[i].x, s.points[i].y);
          }
        }
        ctx.stroke();
      }
    }

    // TEXT
    if (l.type === "text") {
      ctx.fillStyle = l.color;
      ctx.font = `${l.fontSize}px sans-serif`;
      ctx.fillText(l.text, l.x, l.y);
    }

    // SHAPE
    if (l.type === "shape") {
      ctx.fillStyle = l.fill;
      ctx.fillRect(l.x, l.y, l.width, l.height);
    }

    const bounds = getBounds(l, ctx);

    // HOVER
    if (l.id === hoveredLayerId) {
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1 / doc.zoom;
      ctx.strokeRect(bounds.x, bounds.y, bounds.w, bounds.h);
    }

    // ACTIVE SELECTION
    if (l.id === activeLayerId) {
      ctx.strokeStyle = "rgba(59,130,246,0.9)";
      ctx.lineWidth = 2 / doc.zoom;

      ctx.strokeRect(bounds.x - 4, bounds.y - 4, bounds.w + 8, bounds.h + 8);

      // handles
      const size = 6 / doc.zoom;
      const pts = [
        [bounds.x, bounds.y],
        [bounds.x + bounds.w, bounds.y],
        [bounds.x, bounds.y + bounds.h],
        [bounds.x + bounds.w, bounds.y + bounds.h],
      ];

      ctx.fillStyle = "white";
      for (const [x, y] of pts) {
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }
    }

    ctx.restore();
  }

  ctx.restore();
}

// ================= HELPERS =================

function getBounds(l: any, ctx?: CanvasRenderingContext2D) {
  if (l.type === "shape") {
    return { x: l.x, y: l.y, w: l.width, h: l.height };
  }

  if (l.type === "text") {
    if (!ctx) {
      return { x: l.x, y: l.y - 20, w: 200, h: 40 };
    }

    ctx.save();
    ctx.font = `${l.fontSize}px ${l.fontFamily || "sans-serif"}`;

    const metrics = ctx.measureText(l.text);

    const w = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;

    const h =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    ctx.restore();

    return {
      x: l.x - metrics.actualBoundingBoxLeft,
      y: l.y - metrics.actualBoundingBoxAscent,
      w,
      h,
    };
  }

  return { x: 0, y: 0, w: 0, h: 0 };
}

function contains(l: any, p: Point) {
  const b = getBounds(l);

  return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
}
