import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import { AiTemplateItem } from "@/types/aiTemplate";

GlobalWorkerOptions.workerSrc = pdfWorker;

type Props = {
  editable?: boolean;
  items: AiTemplateItem[];
  pageHeightMm?: number;
  pageWidthMm?: number;
  marginBottomMm?: number;
  marginLeftMm?: number;
  marginRightMm?: number;
  marginTopMm?: number;
  selectedItemId?: string | null;
  showGrid?: boolean;
  showGuides?: boolean;
  showRulers?: boolean;
  snapToGrid?: boolean;
  sourceBlob?: Blob | null;
  zoom?: number;
  onItemSelect?: (id: string | null) => void;
  onItemsChange?: (items: AiTemplateItem[]) => void;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const snap = (value: number, enabled: boolean) => (enabled ? Math.round(value * 2) / 2 : value);

export default function AiTemplateCanvas({
  editable = false,
  items,
  pageHeightMm = 297,
  pageWidthMm = 210,
  marginBottomMm = 16,
  marginLeftMm = 16,
  marginRightMm = 16,
  marginTopMm = 16,
  selectedItemId = null,
  showGrid = true,
  showGuides = true,
  showRulers = true,
  snapToGrid = true,
  sourceBlob = null,
  zoom = 1,
  onItemSelect,
  onItemsChange,
}: Props) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const ratio = useMemo(() => {
    const width = Math.max(1, pageWidthMm);
    const height = Math.max(1, pageHeightMm);
    return height / width;
  }, [pageHeightMm, pageWidthMm]);

  const guideBox = useMemo(() => {
    const width = Math.max(1, pageWidthMm);
    const height = Math.max(1, pageHeightMm);
    return {
      left: (marginLeftMm / width) * 100,
      top: (marginTopMm / height) * 100,
      width: ((width - marginLeftMm - marginRightMm) / width) * 100,
      height: ((height - marginTopMm - marginBottomMm) / height) * 100,
    };
  }, [marginBottomMm, marginLeftMm, marginRightMm, marginTopMm, pageHeightMm, pageWidthMm]);

  useEffect(() => {
    let active = true;

    const renderPreview = async () => {
      if (!sourceBlob) {
        setPreviewUrl(null);
        setPreviewError("");
        return;
      }

      try {
        const bytes = new Uint8Array(await sourceBlob.arrayBuffer());
        const loadingTask = getDocument({ data: bytes });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.9 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Canvas context unavailable");

        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        await page.render({ canvasContext: context, viewport }).promise;
        if (!active) return;

        setPreviewUrl(canvas.toDataURL("image/png"));
        setPreviewError("");
      } catch {
        if (!active) return;
        setPreviewUrl(null);
        setPreviewError("Preview unavailable for this PDF source file.");
      }
    };

    void renderPreview();

    return () => {
      active = false;
    };
  }, [sourceBlob]);

  const commitMove = (event: globalThis.MouseEvent) => {
    if (!dragRef.current || !surfaceRef.current || !onItemsChange) return;

    const rect = surfaceRef.current.getBoundingClientRect();
    const nextX = snap(clamp(((event.clientX - rect.left - dragRef.current.dx) / rect.width) * 100, 0, 96), snapToGrid);
    const nextY = snap(clamp(((event.clientY - rect.top - dragRef.current.dy) / rect.height) * 100, 0, 98), snapToGrid);

    onItemsChange(items.map((item) => (item.id === dragRef.current?.id ? { ...item, x: nextX, y: nextY } : item)));
  };

  useEffect(() => {
    if (!editable) return;

    const handleMove = (event: globalThis.MouseEvent) => commitMove(event);
    const handleUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  });

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>, item: AiTemplateItem) => {
    if (!editable || !surfaceRef.current || item.locked) return;
    const rect = event.currentTarget.getBoundingClientRect();
    dragRef.current = {
      id: item.id,
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
    };
    setEditingItemId(null);
    onItemSelect?.(item.id);
    event.preventDefault();
  };

  const selectedItem = items.find((item) => item.id === selectedItemId) || null;

  return (
    <Box className="space-y-3">
      {previewError && <Alert severity="warning">{previewError}</Alert>}
      <Box sx={{ overflow: "auto", borderRadius: "24px", background: "#edf2f7", p: 2 }}>
        <Box
          ref={surfaceRef}
          sx={{
            position: "relative",
            width: `${zoom * 100}%`,
            maxWidth: "none",
            aspectRatio: `${pageWidthMm} / ${pageHeightMm}`,
            minHeight: 520,
            mx: "auto",
            overflow: "hidden",
            borderRadius: "20px",
            border: "1px solid",
            borderColor: "divider",
            background: previewUrl ? "#f8fafc" : "linear-gradient(135deg, #f8fafc, #e2e8f0)",
            boxShadow: "0 24px 70px rgba(15, 23, 42, 0.16)",
          }}
          onClick={() => {
            onItemSelect?.(null);
            setEditingItemId(null);
          }}
        >
          {previewUrl ? (
            <Box
              component="img"
              src={previewUrl}
              alt="PDF template preview"
              sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", userSelect: "none", pointerEvents: "none" }}
            />
          ) : (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {sourceBlob ? "PDF source loaded, but preview unavailable." : "Upload PDF to preview and place variables here."}
              </Typography>
            </Box>
          )}

          {showGrid && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                backgroundImage:
                  "linear-gradient(rgba(37,99,235,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.12) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          )}

          {showGuides && (
            <Box
              sx={{
                position: "absolute",
                left: `${guideBox.left}%`,
                top: `${guideBox.top}%`,
                width: `${guideBox.width}%`,
                height: `${guideBox.height}%`,
                border: "2px dashed rgba(16,185,129,0.55)",
                pointerEvents: "none",
              }}
            />
          )}

          {showRulers && (
            <>
              <Box sx={{ position: "absolute", left: 0, right: 0, top: 0, height: 22, background: "rgba(15,23,42,0.76)", pointerEvents: "none" }}>
                {Array.from({ length: 21 }).map((_, index) => (
                  <Box key={`ruler-top-${index}`} sx={{ position: "absolute", left: `${index * 5}%`, top: 0, bottom: 0, width: 1, bgcolor: "rgba(255,255,255,0.55)" }} />
                ))}
              </Box>
              <Box sx={{ position: "absolute", top: 0, bottom: 0, left: 0, width: 22, background: "rgba(15,23,42,0.76)", pointerEvents: "none" }}>
                {Array.from({ length: 21 }).map((_, index) => (
                  <Box key={`ruler-left-${index}`} sx={{ position: "absolute", top: `${index * 5}%`, left: 0, right: 0, height: 1, bgcolor: "rgba(255,255,255,0.55)" }} />
                ))}
              </Box>
            </>
          )}

          {items.map((item) => (
            <Box
              key={item.id}
              onClick={(event) => {
                event.stopPropagation();
                onItemSelect?.(item.id);
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                if (!item.locked) setEditingItemId(item.id);
              }}
              onMouseDown={(event) => handleMouseDown(event, item)}
              sx={{
                position: "absolute",
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: `${item.width}%`,
                px: 1.25,
                py: 0.5,
                borderRadius: "10px",
                border: selectedItemId === item.id ? "2px solid" : item.locked ? "1px solid" : "1px dashed",
                borderColor: selectedItemId === item.id ? "primary.main" : item.locked ? "warning.main" : "rgba(15,23,42,0.25)",
                backgroundColor: item.backgroundColor || "transparent",
                color: item.color,
                fontFamily: item.fontFamily,
                fontSize: `${item.fontSize}px`,
                fontWeight: item.fontWeight,
                lineHeight: item.lineHeight,
                letterSpacing: `${item.letterSpacing}px`,
                textAlign: item.textAlign,
                cursor: editable ? (item.locked ? "not-allowed" : "move") : "default",
                userSelect: item.locked ? "none" : "text",
                whiteSpace: "pre-wrap",
                boxShadow: selectedItemId === item.id ? "0 8px 24px rgba(37, 99, 235, 0.18)" : "none",
              }}
            >
              {editingItemId === item.id ? (
                <Box
                  component="textarea"
                  autoFocus
                  defaultValue={item.value}
                  onBlur={(event) => {
                    setEditingItemId(null);
                    onItemsChange?.(items.map((entry) => (entry.id === item.id ? { ...entry, value: event.target.value } : entry)));
                  }}
                  onClick={(event) => event.stopPropagation()}
                  sx={{
                    width: "100%",
                    minHeight: 48,
                    resize: "vertical",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    color: "inherit",
                    font: "inherit",
                    lineHeight: "inherit",
                    letterSpacing: "inherit",
                    textAlign: "inherit",
                  }}
                />
              ) : (
                item.value
              )}
            </Box>
          ))}
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary">
        {editable
          ? `Zoom ${Math.round(zoom * 100)}%. Double click text for inline edit. ${selectedItem?.locked ? "Selected item locked." : "Drag carefully or use X/Y controls."}`
          : `Preview ratio ${ratio.toFixed(2)}.`}
      </Typography>
    </Box>
  );
}
