import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, Typography } from "@mui/material";

import { AiTemplateItem } from "@/types/aiTemplate";
import { getPdfFirstPagePreview } from "@/utils/pdf-preview";

type Props = {
  editable?: boolean;
  items: AiTemplateItem[];
  pageHeightMm?: number;
  pageWidthMm?: number;
  pageUnit?: "mm" | "in" | "px";
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
const pageSizeToMm = (value: number, unit: "mm" | "in" | "px" = "mm") => {
  if (unit === "in") return value * 25.4;
  if (unit === "px") return (value / 96) * 25.4;
  return value;
};

export default function AiTemplateCanvas({
  editable = false,
  items,
  pageHeightMm = 297,
  pageWidthMm = 210,
  pageUnit = "mm",
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
  const dragPreviewRef = useRef<{ el: HTMLDivElement; startX: number; startY: number } | null>(null);
  const resizeRef = useRef<{ id: string; startClientX: number; startWidth: number; currentWidth: number; startX: number; el: HTMLDivElement } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const ratio = useMemo(() => {
    const width = Math.max(1, pageWidthMm);
    const height = Math.max(1, pageHeightMm);
    return height / width;
  }, [pageHeightMm, pageWidthMm]);

  const guideBox = useMemo(() => {
    const width = Math.max(1, pageSizeToMm(pageWidthMm, pageUnit));
    const height = Math.max(1, pageSizeToMm(pageHeightMm, pageUnit));
    const marginTop = pageSizeToMm(marginTopMm, pageUnit);
    const marginRight = pageSizeToMm(marginRightMm, pageUnit);
    const marginBottom = pageSizeToMm(marginBottomMm, pageUnit);
    const marginLeft = pageSizeToMm(marginLeftMm, pageUnit);
    return {
      left: (marginLeft / width) * 100,
      top: (marginTop / height) * 100,
      width: ((width - marginLeft - marginRight) / width) * 100,
      height: ((height - marginTop - marginBottom) / height) * 100,
    };
  }, [marginBottomMm, marginLeftMm, marginRightMm, marginTopMm, pageHeightMm, pageUnit, pageWidthMm]);

  useEffect(() => {
    let active = true;

    const renderPreview = async () => {
      if (!sourceBlob) {
        setPreviewUrl(null);
        setPreviewError("");
        return;
      }

      try {
        if (!active) return;

        setPreviewUrl(await getPdfFirstPagePreview(sourceBlob));
        setPreviewError("");
      } catch (error) {
        if (!active) return;
        console.error("Failed to render PDF preview.", error);
        setPreviewUrl(null);
        setPreviewError("Preview unavailable for this PDF source file.");
      }
    };

    void renderPreview();

    return () => {
      active = false;
    };
  }, [sourceBlob]);

  useEffect(() => {
    if (!editable) return;

    let rafId = 0;

    const handleMove = (event: globalThis.MouseEvent) => {
      if ((!dragRef.current && !resizeRef.current) || !surfaceRef.current) return;

      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (!surfaceRef.current) return;
        const rect = surfaceRef.current.getBoundingClientRect();
        if (resizeRef.current) {
          const deltaWidth = ((event.clientX - resizeRef.current.startClientX) / rect.width) * 100;
          const nextWidth = snap(clamp(resizeRef.current.startWidth + deltaWidth, 0.5, 100 - resizeRef.current.startX), snapToGrid);
          resizeRef.current.el.style.width = `${nextWidth}%`;
          resizeRef.current.currentWidth = nextWidth;
          return;
        }
        if (!dragRef.current) return;
        const nextX = snap(clamp(((event.clientX - rect.left - dragRef.current.dx) / rect.width) * 100, 0, 96), snapToGrid);
        const nextY = snap(clamp(((event.clientY - rect.top - dragRef.current.dy) / rect.height) * 100, 0, 98), snapToGrid);

        // Direct DOM update for instant visual feedback
        if (dragPreviewRef.current?.el) {
          dragPreviewRef.current.el.style.left = `${nextX}%`;
          dragPreviewRef.current.el.style.top = `${nextY}%`;
          dragPreviewRef.current.startX = nextX;
          dragPreviewRef.current.startY = nextY;
        }
      });
    };

    const handleUp = () => {
      cancelAnimationFrame(rafId);
      if (resizeRef.current && onItemsChange) {
        const resizeId = resizeRef.current.id;
        const finalWidth = resizeRef.current.currentWidth;
        onItemsChange(items.map((item) => (item.id === resizeId ? { ...item, width: finalWidth } : item)));
      }
      // Commit the final position to React state on mouseup only
      if (dragRef.current && dragPreviewRef.current && onItemsChange) {
        const finalX = dragPreviewRef.current.startX;
        const finalY = dragPreviewRef.current.startY;
        const dragId = dragRef.current.id;
        onItemsChange(items.map((item) => (item.id === dragId ? { ...item, x: finalX, y: finalY } : item)));
      }
      dragRef.current = null;
      dragPreviewRef.current = null;
      resizeRef.current = null;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      cancelAnimationFrame(rafId);
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
    dragPreviewRef.current = {
      el: event.currentTarget as HTMLDivElement,
      startX: item.x,
      startY: item.y,
    };
    setEditingItemId(null);
    onItemSelect?.(item.id);
    event.preventDefault();
  };

  const handleResizeMouseDown = (event: MouseEvent<HTMLDivElement>, item: AiTemplateItem) => {
    if (!editable || item.locked || !surfaceRef.current) return;
    event.stopPropagation();
    event.preventDefault();
    resizeRef.current = {
      id: item.id,
      startClientX: event.clientX,
      startWidth: item.width,
      currentWidth: item.width,
      startX: item.x,
      el: event.currentTarget.parentElement as HTMLDivElement,
    };
    setEditingItemId(null);
    onItemSelect?.(item.id);
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
                minWidth: 3,
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
                transition: "none",
                willChange: "left, top, width",
                userSelect: item.locked ? "none" : "text",
                whiteSpace: editingItemId === item.id ? "pre-wrap" : "nowrap",
                overflow: editingItemId === item.id ? "visible" : "hidden",
                textOverflow: "ellipsis",
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
              {editable && selectedItemId === item.id && !item.locked && editingItemId !== item.id && (
                <Box
                  onMouseDown={(event) => handleResizeMouseDown(event, item)}
                  sx={{
                    position: "absolute",
                    top: -3,
                    right: -5,
                    bottom: -3,
                    width: 10,
                    cursor: "ew-resize",
                    bgcolor: "primary.main",
                    borderRadius: "999px",
                    opacity: 0.85,
                  }}
                />
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
