export type AiTemplateItemType = "variable" | "text";

export interface AiTemplateItem {
  id: string;
  type: AiTemplateItemType;
  value: string;
  x: number;
  y: number;
  width: number;
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: "left" | "center" | "right";
  locked: boolean;
}

export interface AiTemplateLayout {
  version: 1;
  type: "ai-layout";
  items: AiTemplateItem[];
}

export const createDefaultAiTemplateLayout = (): AiTemplateLayout => ({
  version: 1,
  type: "ai-layout",
  items: [],
});

export const parseAiTemplateLayout = (value?: string | null): AiTemplateLayout => {
  if (!value) return createDefaultAiTemplateLayout();

  try {
    const parsed = JSON.parse(value) as Partial<AiTemplateLayout>;
    if (parsed?.type !== "ai-layout" || !Array.isArray(parsed.items)) {
      return createDefaultAiTemplateLayout();
    }

    return {
      version: 1,
      type: "ai-layout",
      items: parsed.items.map((item, index) => ({
        id: item?.id || `ai-item-${index + 1}`,
        type: item?.type === "text" ? "text" : "variable",
        value: item?.value || "",
        x: Number.isFinite(Number(item?.x)) ? Number(item?.x) : 10,
        y: Number.isFinite(Number(item?.y)) ? Number(item?.y) : 10,
        width: Math.max(8, Math.min(100, Number(item?.width) || 24)),
        fontFamily: item?.fontFamily || "Arial",
        fontSize: Math.max(8, Number(item?.fontSize) || 20),
        color: item?.color || "#111827",
        backgroundColor: item?.backgroundColor || "transparent",
        fontWeight: Math.max(300, Math.min(800, Number(item?.fontWeight) || 600)),
        lineHeight: Math.max(0.8, Math.min(3, Number(item?.lineHeight) || 1.3)),
        letterSpacing: Number.isFinite(Number(item?.letterSpacing)) ? Number(item?.letterSpacing) : 0,
        textAlign: item?.textAlign === "center" || item?.textAlign === "right" ? item.textAlign : "left",
        locked: Boolean(item?.locked),
      })),
    };
  } catch {
    return createDefaultAiTemplateLayout();
  }
};

export const serializeAiTemplateLayout = (layout: AiTemplateLayout) => JSON.stringify(layout);
