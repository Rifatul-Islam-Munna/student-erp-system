import { Box, Typography } from "@mui/material";

import { XlsxPreviewSheet } from "@/utils/xlsx-preview";

type Props = {
  sheet: XlsxPreviewSheet | null;
};

export default function XlsxPreviewTable({ sheet }: Props) {
  if (!sheet) {
    return <Typography variant="body2" color="text.secondary">No XLSX preview available.</Typography>;
  }

  return (
    <Box className="overflow-auto rounded-xl border border-divider bg-white">
      <table className="min-w-full border-collapse text-sm">
        <colgroup>
          {sheet.colWidths.map((width, index) => (
            <col key={`xlsx-col-${index}`} style={{ width }} />
          ))}
        </colgroup>
        <tbody>
          {sheet.rows.map((row, rowIndex) => (
            <tr key={`xlsx-row-${rowIndex}`} style={{ height: sheet.rowHeights[rowIndex] || 32 }}>
              {row.map((cell, cellIndex) => {
                if (cell.hidden) return null;

                return (
                  <td
                    key={`xlsx-cell-${rowIndex}-${cellIndex}`}
                    colSpan={cell.colSpan}
                    rowSpan={cell.rowSpan}
                    className="border border-slate-200 px-3 py-2 align-middle"
                    style={{
                      backgroundColor: cell.style.bgColor,
                      color: cell.style.color,
                      fontWeight: cell.style.bold ? 700 : 400,
                      fontStyle: cell.style.italic ? "italic" : "normal",
                      textDecoration: `${cell.style.underline ? "underline " : ""}${cell.style.strike ? "line-through" : ""}`.trim() || "none",
                      fontSize: cell.style.fontSize ? `${cell.style.fontSize}px` : undefined,
                      textAlign: cell.style.hAlign as any,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {cell.value || "\u00A0"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  );
}
