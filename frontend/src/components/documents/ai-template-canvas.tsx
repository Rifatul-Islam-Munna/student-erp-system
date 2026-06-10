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
  selectedItemId?: string | null;
  sourceBlob?: Blob | null;
  onItemSelect?: (id: string | null) => void;
  onItemsChange?: (items: AiTemplateItem[]) => void;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function AiTemplateCanvas({
  editable = false,
  items,
  pageHeightMm = 297,
  pageWidthMm = 210,
  selectedItemId = null,
  sourceBlob = null,
  onItemSelect,
  onItemsChange,
}: Props) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");
  const ratio = useMemo(() => {
    const width = Math.max(1, pageWidthMm);
    const height = Math.max(1, pageHeightMm);
    return height / width;
  }, [pageHeightMm, pageWidthMm]);

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
        const viewport = page.getViewport({ scale: 1.7 });
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
        setPreviewError("Preview works only when the Illustrator file was saved with PDF compatibility.");
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
    const nextX = clamp(((event.clientX - rect.left - dragRef.current.dx) / rect.width) * 100, 0, 92);
    const nextY = clamp(((event.clientY - rect.top - dragRef.current.dy) / rect.height) * 100, 0, 96);

    onItemsChange(
      items.map((item) => (item.id === dragRef.current?.id ? { ...item, x: nextX, y: nextY } : item)),
    );
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

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>, itemId: string) => {
    if (!editable || !surfaceRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    dragRef.current = {
      id: itemId,
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
    };
    onItemSelect?.(itemId);
    event.preventDefault();
  };

  return (
    <Box className="space-y-3">
      {previewError && <Alert severity="warning">{previewError}</Alert>}
      <Box
        ref={surfaceRef}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 960,
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
        onClick={() => onItemSelect?.(null)}
      >
        {previewUrl ? (
          <Box
            component="img"
            src={previewUrl}
            alt="AI template preview"
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", userSelect: "none", pointerEvents: "none" }}
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
              {sourceBlob
                ? "Source file loaded, but preview not available for this AI file."
                : "Upload Illustrator file to preview and place variables here."}
            </Typography>
          </Box>
        )}

        {items.map((item) => (
          <Box
            key={item.id}
            onClick={(event) => {
              event.stopPropagation();
              onItemSelect?.(item.id);
            }}
            onMouseDown={(event) => handleMouseDown(event, item.id)}
            sx={{
              position: "absolute",
              left: `${item.x}%`,
              top: `${item.y}%`,
              px: 1.25,
              py: 0.5,
              borderRadius: "10px",
              border: selectedItemId === item.id ? "2px solid" : "1px dashed",
              borderColor: selectedItemId === item.id ? "primary.main" : "rgba(15,23,42,0.25)",
              backgroundColor: item.backgroundColor || "transparent",
              color: item.color,
              fontFamily: item.fontFamily,
              fontSize: `${item.fontSize}px`,
              fontWeight: item.fontWeight,
              lineHeight: 1.3,
              cursor: editable ? "move" : "default",
              userSelect: "none",
              whiteSpace: "nowrap",
              boxShadow: selectedItemId === item.id ? "0 8px 24px rgba(37, 99, 235, 0.18)" : "none",
            }}
          >
            {item.value}
          </Box>
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary">
        {editable
          ? "Click variable or text box, drag to place, then style it from controls."
          : `Preview ratio ${ratio.toFixed(2)}.`}
      </Typography>
    </Box>
  );
}
