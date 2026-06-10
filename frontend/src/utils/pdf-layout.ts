import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import { AiTemplateItem } from "@/types/aiTemplate";
import { SettingDocument } from "@/types/setting";
import { Student } from "@/types/student";
import { DocumentCustomFont } from "@/types/document";

GlobalWorkerOptions.workerSrc = pdfWorker;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const renderPdfSourcePreview = async (sourceBlob: Blob) => {
  const bytes = new Uint8Array(await sourceBlob.arrayBuffer());
  const pdf = await getDocument({ data: bytes }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1.8 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas context unavailable");

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL("image/png");
};

export const buildPdfVariableMap = (student?: Student | null, settings?: SettingDocument | null) => ({
  "{{sys_agency_name}}": settings?.site?.name || "",
  "{{sys_agency_address}}": settings?.site?.address || "",
  "{{sys_agency_phone}}": settings?.site?.phone || "",
  "{{sys_agency_email}}": settings?.site?.email || "",
  ...(student?.docVariables || {}),
});

const replaceTemplateVariables = (value: string, variableMap: Record<string, string>) => {
  let nextValue = String(value || "");

  Object.entries(variableMap)
    .sort(([left], [right]) => right.length - left.length)
    .forEach(([key, replacement]) => {
      nextValue = nextValue.split(key).join(replacement || "");
    });

  return nextValue;
};

export const resolvePdfLayoutItems = (items: AiTemplateItem[], student?: Student | null, settings?: SettingDocument | null) => {
  const variableMap = buildPdfVariableMap(student, settings);

  return items.map((item) => ({
    ...item,
    value:
      item.type === "variable"
        ? variableMap[item.value] || item.value
        : replaceTemplateVariables(item.value, variableMap),
  }));
};

export const openPdfLayoutPrintWindow = ({
  backgroundImageUrl,
  customFonts = [],
  items,
  pageHeightMm,
  pageWidthMm,
  title,
}: {
  backgroundImageUrl: string;
  customFonts?: DocumentCustomFont[];
  items: AiTemplateItem[];
  pageHeightMm: number;
  pageWidthMm: number;
  title: string;
}) => {
  const popup = window.open("", "_blank", "width=1200,height=900");
  if (!popup) throw new Error("Popup blocked");

  const customFontCss = customFonts
    .map(
      (font) => `
        @font-face {
          font-family: "${escapeHtml(font.family)}";
          src: url("${font.source}");
        }
      `,
    )
    .join("\n");

  const overlayHtml = items
    .map(
      (item) => `
        <div
          style="
            position:absolute;
            left:${item.x}%;
            top:${item.y}%;
            width:${item.width}%;
            font-family:${escapeHtml(item.fontFamily)};
            font-size:${item.fontSize}px;
            font-weight:${item.fontWeight};
            color:${item.color};
            background:${item.backgroundColor || "transparent"};
            line-height:${item.lineHeight};
            letter-spacing:${item.letterSpacing}px;
            text-align:${item.textAlign};
            padding:4px 6px;
            border-radius:8px;
            white-space:pre-wrap;
          "
        >${escapeHtml(item.value)}</div>
      `,
    )
    .join("");

  popup.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          @page { size: ${pageWidthMm}mm ${pageHeightMm}mm; margin: 0; }
          ${customFontCss}
          html, body { margin: 0; padding: 0; background: #dbe4ee; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .sheet-wrap { min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; padding: 24px; }
          .sheet {
            position: relative;
            width: ${pageWidthMm}mm;
            height: ${pageHeightMm}mm;
            background: #fff;
            box-shadow: 0 24px 70px rgba(15, 23, 42, 0.16);
            overflow: hidden;
          }
          .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
          @media print {
            html, body { background: #fff; }
            .sheet-wrap { padding: 0; min-height: auto; }
            .sheet { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="sheet-wrap">
          <div class="sheet">
            <img class="bg" src="${backgroundImageUrl}" alt="" />
            ${overlayHtml}
          </div>
        </div>
        <script>
          window.addEventListener("load", () => {
            setTimeout(() => window.print(), 300);
          });
        </script>
      </body>
    </html>
  `);
  popup.document.close();
};
