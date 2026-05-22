"use client";

import { useEffect, useMemo, useRef } from "react";
import { Toolbar } from "./toolbar";
import { Inspector } from "./inspector";
import { LayersPanel } from "./layers-panel";
import { HistoryPanel } from "./history-panel";
import { EditorCanvas } from "./editor-canvas";
import { useEditorStore } from "./use-editor-store";
import type { EditorDocument } from "@/lib/editor-state";

export function EditorClient({
  documentId,
  initialDocument
}: {
  documentId: string;
  initialDocument: EditorDocument;
}) {
  const { setDocument, doc, markSaving, markDirty } = useEditorStore();
  const saveTimer = useRef<number | null>(null);
  const lastSerialized = useRef<string>("");

  useEffect(() => {
    setDocument(initialDocument);
  }, [initialDocument, setDocument]);

  const serialized = useMemo(() => JSON.stringify(doc), [doc]);

  useEffect(() => {
    if (!doc.layers.length) return;
    if (serialized === lastSerialized.current) return;

    markDirty(true);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);

    saveTimer.current = window.setTimeout(async () => {
      try {
        markSaving(true);
        await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: doc })
        });
        lastSerialized.current = serialized;
        markDirty(false);
      } finally {
        markSaving(false);
      }
    }, 900);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [doc, serialized, documentId, markSaving, markDirty]);

  return (
    <div className="grid grid-cols-12 gap-4 pl-4 pr-4 pt-4">
      <div className="col-span-12 xl:col-span-2">
        <LayersPanel />
      </div>

      <div className="col-span-12 flex flex-col gap-4 xl:col-span-8 h-[95vh]">
        <div className="panel flex flex-wrap items-center justify-between gap-3 p-4">
          <Toolbar />
          <HistoryPanel />
        </div>

        <div className="flex-1">
          <EditorCanvas initialDocumentId={documentId} />
        </div>
      </div>

      <div className="col-span-12 xl:col-span-2">
        <Inspector />
      </div>
    </div>
  );
}
