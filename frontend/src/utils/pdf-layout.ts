import { AiTemplateItem } from "@/types/aiTemplate";
import { SettingDocument } from "@/types/setting";
import { Student } from "@/types/student";
import { DocumentCustomFont, DocumentPageUnit } from "@/types/document";
import { getPdfFirstPagePreview } from "@/utils/pdf-preview";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const renderPdfSourcePreview = async (sourceBlob: Blob) => getPdfFirstPagePreview(sourceBlob, 1.8);

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
  pageUnit = "mm",
  pageWidthMm,
  title,
}: {
  backgroundImageUrl: string;
  customFonts?: DocumentCustomFont[];
  items: AiTemplateItem[];
  pageHeightMm: number;
  pageUnit?: DocumentPageUnit;
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


  popup.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&family=Noto+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>
          @page { size: ${pageWidthMm}${pageUnit} ${pageHeightMm}${pageUnit}; margin: 0; }
          ${customFontCss}
          html, body { margin: 0; padding: 0; background: #dbe4ee; font-family: 'Noto Sans', 'Noto Sans JP', Arial, sans-serif; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .sheet-wrap { min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; padding: 24px; }
          .sheet {
            position: relative;
            width: ${pageWidthMm}${pageUnit};
            height: ${pageHeightMm}${pageUnit};
            background: #fff;
            box-shadow: 0 24px 70px rgba(15, 23, 42, 0.16);
            overflow: hidden;
          }
          .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
          .overlay-item {
            position: absolute;
            padding: 4px 6px;
            border-radius: 4px;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
            word-break: break-word;
            text-rendering: geometricPrecision;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          @media print {
            html, body { background: #fff; }
            .sheet-wrap { padding: 0; min-height: auto; }
            .sheet { box-shadow: none; }
            .overlay-item { border-radius: 0; padding: 2px 4px; }
          }
        </style>
      </head>
      <body>
        <div class="sheet-wrap">
          <div class="sheet">
            <img class="bg" src="${backgroundImageUrl}" alt="" />
            ${items
              .map(
                (item) => `
              <div
                class="overlay-item"
                style="
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
                "
              >${escapeHtml(item.value)}</div>
            `,
              )
              .join("")}
          </div>
        </div>
        <script>
          window.addEventListener("load", () => {
            setTimeout(() => window.print(), 400);
          });
        </script>
      </body>
    </html>
  `);
  popup.document.close();
};
