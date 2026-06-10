import ExcelJS from "exceljs";

export type XlsxPreviewCellStyle = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  bgColor?: string;
  fontSize?: number;
  hAlign?: string;
};

export type XlsxPreviewCell = {
  value: string;
  style: XlsxPreviewCellStyle;
  colSpan?: number;
  rowSpan?: number;
};

export type XlsxPreviewSheet = {
  name: string;
  rows: XlsxPreviewCell[][];
  colWidths: number[];
};

const argbToHex = (argb?: string) => {
  if (!argb || argb === "00000000") return undefined;
  const hex = argb.length === 8 ? `#${argb.slice(2)}` : argb.startsWith("#") ? argb : `#${argb}`;
  return hex.toLowerCase() === "#000000" ? undefined : hex;
};

const extractThemeColor = (color?: Partial<ExcelJS.Color>): string | undefined => {
  if (!color) return undefined;
  if (color.argb) return argbToHex(color.argb);
  return undefined;
};

const getCellDisplayValue = (cell: ExcelJS.Cell): string => {
  const value = cell.value;
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toLocaleDateString();

  if (typeof value === "object" && "richText" in value && Array.isArray(value.richText)) {
    return value.richText.map((part) => part.text || "").join("");
  }

  if (typeof value === "object" && "text" in value) {
    return String((value as { text: string }).text || "");
  }

  if (typeof value === "object" && "result" in value) {
    const result = (value as { result?: unknown }).result;
    return result != null ? String(result) : "";
  }

  return String(value);
};

const extractCellStyle = (cell: ExcelJS.Cell): XlsxPreviewCellStyle => {
  const style: XlsxPreviewCellStyle = {};
  const font = cell.font;
  const fill = cell.fill;
  const alignment = cell.alignment;

  if (font) {
    if (font.bold) style.bold = true;
    if (font.italic) style.italic = true;
    if (font.underline) style.underline = true;
    if (font.strike) style.strike = true;
    if (font.size) style.fontSize = font.size;
    const fontColor = extractThemeColor(font.color);
    if (fontColor) style.color = fontColor;
  }

  if (fill && fill.type === "pattern" && fill.pattern === "solid") {
    const bg = extractThemeColor(fill.fgColor);
    if (bg) style.bgColor = bg;
  }

  if (alignment?.horizontal) {
    style.hAlign = alignment.horizontal;
  }

  return style;
};

export const readXlsxPreview = async (source: Blob): Promise<XlsxPreviewSheet> => {
  const buffer = await source.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return { name: "Sheet1", rows: [], colWidths: [] };
  }

  const maxRows = 40;
  const maxCols = 16;
  const rows: XlsxPreviewCell[][] = [];
  const colWidths: number[] = [];

  for (let c = 1; c <= maxCols; c++) {
    const col = worksheet.getColumn(c);
    colWidths.push(col.width ? Math.round(col.width * 8) : 80);
  }

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > maxRows) return;

    const cells: XlsxPreviewCell[] = [];
    for (let colIndex = 1; colIndex <= maxCols; colIndex++) {
      const cell = row.getCell(colIndex);
      cells.push({
        value: getCellDisplayValue(cell),
        style: extractCellStyle(cell),
      });
    }
    rows.push(cells);
  });

  return {
    name: worksheet.name || "Sheet1",
    rows,
    colWidths,
  };
};
