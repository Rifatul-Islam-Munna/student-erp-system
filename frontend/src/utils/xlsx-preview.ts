import * as XLSX from "xlsx";

export type XlsxPreviewSheet = {
  name: string;
  rows: string[][];
};

export const readXlsxPreview = async (source: Blob) => {
  const buffer = await source.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
    header: 1,
    raw: false,
    blankrows: false,
    defval: "",
  }) as string[][];

  return {
    name: sheetName,
    rows: rows.slice(0, 40).map((row) => row.slice(0, 16).map((cell) => String(cell || ""))),
  } satisfies XlsxPreviewSheet;
};
