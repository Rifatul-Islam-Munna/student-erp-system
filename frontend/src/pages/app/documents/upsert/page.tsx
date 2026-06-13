import "react-quill-new/dist/quill.snow.css";

import Icons from "quill/ui/icons";
import { ChangeEvent, MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from "react";
import ReactDOMServer from "react-dom/server";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as yup from "yup";
import Quill from "quill";
import ReactQuill from "react-quill-new";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Slider,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";

import AiTemplateCanvas from "@/components/documents/ai-template-canvas";
import XlsxPreviewTable from "@/components/documents/xlsx-preview-table";
import {
  DEFAULT_DOCUMENT_PAGE_SETTINGS,
  getPageSettingsFromPreset,
  STUDENT_DOCUMENT_VARIABLES,
  SYSTEM_DOCUMENT_VARIABLES,
} from "@/constants/documentVariables";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiBrackets from "@/icons/nexture/ni-brackets";
import NiClipboard from "@/icons/nexture/ni-clipboard";
import NiCode from "@/icons/nexture/ni-code";
import NiCross from "@/icons/nexture/ni-cross";
import NiDocumentCode from "@/icons/nexture/ni-document-code";
import NiDocumentImage from "@/icons/nexture/ni-document-image";
import NiDocumentVideo from "@/icons/nexture/ni-document-video";
import NiEndLeftSmall from "@/icons/nexture/ni-end-left-small";
import NiEndRightSmall from "@/icons/nexture/ni-end-right-small";
import NiEraser from "@/icons/nexture/ni-eraser";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiKnobs from "@/icons/nexture/ni-knobs";
import NiLayout from "@/icons/nexture/ni-layout";
import NiLink from "@/icons/nexture/ni-link";
import NiList from "@/icons/nexture/ni-list";
import NiListCheck from "@/icons/nexture/ni-list-check";
import NiListNumber from "@/icons/nexture/ni-list-number";
import NiMagicWand from "@/icons/nexture/ni-magic-wand";
import NiMenuLeft from "@/icons/nexture/ni-menu-left";
import NiMenuRight from "@/icons/nexture/ni-menu-right";
import NiPaintBucket from "@/icons/nexture/ni-paint-bucket";
import NiPaintRoller from "@/icons/nexture/ni-paint-roller";
import NiRefresh from "@/icons/nexture/ni-refresh";
import NiScriptSub from "@/icons/nexture/ni-script-sub";
import NiScriptSuper from "@/icons/nexture/ni-script-super";
import NiSearch from "@/icons/nexture/ni-search";
import NiSquare from "@/icons/nexture/ni-square";
import NiCircle from "@/icons/nexture/ni-circle";
import NiMinusSquare from "@/icons/nexture/ni-minus-square";
import NiTextBold from "@/icons/nexture/ni-text-bold";
import NiTextCenter from "@/icons/nexture/ni-text-center";
import NiTextItalic from "@/icons/nexture/ni-text-italic";
import NiTextJustify from "@/icons/nexture/ni-text-justify";
import NiTextLeft from "@/icons/nexture/ni-text-left";
import NiTextQuote from "@/icons/nexture/ni-text-quote";
import NiTextRight from "@/icons/nexture/ni-text-right";
import NiTextStrikethrough from "@/icons/nexture/ni-text-strikethrough";
import NiTextUnderline from "@/icons/nexture/ni-text-underline";
import { DocumentService } from "@/services/documentService";
import { AiTemplateItem, createDefaultAiTemplateLayout, parseAiTemplateLayout, serializeAiTemplateLayout } from "@/types/aiTemplate";
import { DocumentCustomFont, DocumentFormat, DocumentPageSettings, DocumentPageUnit, DocumentTemplate, DocumentVariableDefinition } from "@/types/document";
import { readXlsxPreview, XlsxPreviewCell, XlsxPreviewSheet } from "@/utils/xlsx-preview";

const validationSchema = yup.object({
  name: yup.string().required("Title is required"),
  docType: yup.string().oneOf(["system", "student", "other"]).required("Document type is required"),
  documentFormat: yup.string().oneOf(["html", "pdf", "xlsx", "fillable_pdf", "docx"]).required("Document format is required"),
  status: yup.string().oneOf(["draft", "active", "inactive"]).required("Status is required"),
  templateContent: yup.string().when("documentFormat", {
    is: "html",
    then: (schema) => schema.required("Document content is required"),
    otherwise: (schema) => schema.default(""),
  }),
});

const DOCUMENT_TYPES = [
  { value: "system", label: "System" },
  { value: "student", label: "Student" },
  { value: "other", label: "Other" },
] as const;

const DOCUMENT_FORMATS: { value: DocumentFormat; label: string }[] = [
  { value: "html", label: "Rich Document / PDF" },
  { value: "pdf", label: "PDF Layout Builder" },
  { value: "xlsx", label: "XLSX Template" },
  { value: "fillable_pdf", label: "Fillable PDF" },
  { value: "docx", label: "DOCX Template" },
];

const DOCUMENT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;
const PAGE_SIZE_UNITS: DocumentPageUnit[] = ["mm", "in", "px"];
const MM_PER_INCH = 25.4;
const CSS_PX_PER_INCH = 96;

const toMmForUnit = (value: number, unit: DocumentPageUnit) => {
  if (unit === "in") return value * MM_PER_INCH;
  if (unit === "px") return (value / CSS_PX_PER_INCH) * MM_PER_INCH;
  return value;
};

const fromMmForUnit = (valueMm: number, unit: DocumentPageUnit) => {
  if (unit === "in") return valueMm / MM_PER_INCH;
  if (unit === "px") return (valueMm / MM_PER_INCH) * CSS_PX_PER_INCH;
  return valueMm;
};

const convertPageSizeUnit = (value: number, fromUnit: DocumentPageUnit, toUnit: DocumentPageUnit) =>
  Number(fromMmForUnit(toMmForUnit(value, fromUnit), toUnit).toFixed(4));

const pageCssValue = (value: number, unit: DocumentPageUnit = "mm") => `${value}${unit}`;

const PAGE_PRESETS = ["A4", "A3", "Letter", "Legal", "Custom"] as const;
const PAGE_ORIENTATIONS = ["portrait", "landscape"] as const;
const IMAGE_FORMAT_ATTRIBUTES = ["width", "height", "style", "data-position-mode", "data-x", "data-y", "data-opacity"] as const;
const FONT_SIZE_OPTIONS = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "40px"] as const;
const FONT_FAMILY_OPTIONS = [
  { value: "Arial", label: "Arial" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" },
  { value: "Courier New", label: "Courier New" },
] as const;
const SHAPE_TYPES = ["square", "rectangle", "circle", "line"] as const;
const SHAPE_BORDER_STYLES = ["solid", "dotted", "dashed"] as const;

const BaseImageFormat = Quill.import("formats/image");
const SizeStyle = Quill.import("attributors/style/size");
const FontStyle = Quill.import("attributors/style/font");
const BlockEmbed = Quill.import("blots/block/embed");
let imageBlotRegistered = false;
let editorFormatsRegistered = false;

const extractVariables = (content: string) =>
  Array.from(new Set((content.match(/\{\{[^}]+\}\}/g) || []).map((item) => item.trim())));

const normalizePageSettings = (pageSettings?: Partial<DocumentPageSettings>): DocumentPageSettings => {
  const preset = pageSettings?.preset || DEFAULT_DOCUMENT_PAGE_SETTINGS.preset;
  const orientation = pageSettings?.orientation || DEFAULT_DOCUMENT_PAGE_SETTINGS.orientation;
  const unit = pageSettings?.unit || DEFAULT_DOCUMENT_PAGE_SETTINGS.unit;
  const presetSize = getPageSettingsFromPreset(preset, orientation);
  const customWidth = Number(pageSettings?.widthMm) || presetSize.widthMm;
  const customHeight = Number(pageSettings?.heightMm) || presetSize.heightMm;
  const defaultMargin = fromMmForUnit(DEFAULT_DOCUMENT_PAGE_SETTINGS.marginTopMm, unit);
  const getMargin = (value?: number) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : defaultMargin;
  };

  return {
    preset,
    orientation,
    unit,
    widthMm: preset === "Custom" ? customWidth : presetSize.widthMm,
    heightMm: preset === "Custom" ? customHeight : presetSize.heightMm,
    marginTopMm: getMargin(pageSettings?.marginTopMm),
    marginRightMm: getMargin(pageSettings?.marginRightMm),
    marginBottomMm: getMargin(pageSettings?.marginBottomMm),
    marginLeftMm: getMargin(pageSettings?.marginLeftMm),
  };
};

const extractAiVariables = (items: AiTemplateItem[]) =>
  Array.from(new Set(items.filter((item) => item.type === "variable").map((item) => item.value.trim()).filter(Boolean)));

const preparePayload = (values: Partial<DocumentTemplate>, aiItems: AiTemplateItem[] = []) => ({
  name: values.name || "",
  docType: values.docType || "other",
  documentFormat: values.documentFormat || "html",
  fileType: values.fileType || "",
  templateContent:
    values.documentFormat === "pdf"
      ? serializeAiTemplateLayout({ version: 1, type: "ai-layout", items: aiItems })
      : values.documentFormat === "xlsx" || values.documentFormat === "fillable_pdf" || values.documentFormat === "docx"
      ? ""
      : values.templateContent || "",
  backgroundImageUrl: values.backgroundImageUrl || "",
  shortcodes: values.documentFormat === "pdf" ? extractAiVariables(aiItems) : values.documentFormat === "xlsx" || values.documentFormat === "fillable_pdf" || values.documentFormat === "docx" ? values.shortcodes || [] : extractVariables(values.templateContent || ""),
  description: values.description || "",
  customFonts: Array.isArray(values.customFonts) ? values.customFonts : [],
  status: values.status || "draft",
  isActive: Boolean(values.isActive),
  pageSettings: normalizePageSettings(values.pageSettings),
});

type ShapeType = (typeof SHAPE_TYPES)[number];
type ShapeBorderStyle = (typeof SHAPE_BORDER_STYLES)[number];

type DocumentShapeValue = {
  shape: ShapeType;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  borderWidth: number;
  borderColor: string;
  fillColor: string;
  borderStyle: ShapeBorderStyle;
  opacity: number;
};

const getLineDashArray = (borderStyle: ShapeBorderStyle, borderWidth: number) => {
  if (borderStyle === "dotted") return `${Math.max(1, borderWidth)} ${Math.max(2, borderWidth * 2)}`;
  if (borderStyle === "dashed") return `${Math.max(4, borderWidth * 4)} ${Math.max(3, borderWidth * 2)}`;
  return "";
};

const buildShapeMarkup = (shapeState: DocumentShapeValue) => {
  if (shapeState.shape !== "line") return "";

  const width = Math.max(20, shapeState.width);
  const height = Math.max(20, shapeState.height);
  const strokeWidth = Math.max(1, shapeState.borderWidth);
  const dashArray = getLineDashArray(shapeState.borderStyle, strokeWidth);
  const centerY = height / 2;

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="display:block;overflow:visible;pointer-events:none">
      <line
        x1="0"
        y1="${centerY}"
        x2="${width}"
        y2="${centerY}"
        stroke="${shapeState.borderColor}"
        stroke-width="${strokeWidth}"
        ${dashArray ? `stroke-dasharray="${dashArray}"` : ""}
        stroke-linecap="${shapeState.borderStyle === "dotted" ? "round" : "square"}"
      />
    </svg>
  `.trim();
};

const buildShapeStyle = (shapeState: DocumentShapeValue) =>
  [
    "display:block",
    "box-sizing:border-box",
    `background:${shapeState.shape === "line" ? "transparent" : shapeState.fillColor || "transparent"}`,
    "pointer-events:auto",
    "content:normal",
    "position:absolute",
    `left:${shapeState.x}px`,
    `top:${shapeState.y}px`,
    `width:${Math.max(20, shapeState.width)}px`,
    `height:${Math.max(20, shapeState.height)}px`,
    `opacity:${Math.max(0.05, Math.min(1, shapeState.opacity))}`,
    `border:${shapeState.shape === "line" ? "none" : `${Math.max(1, shapeState.borderWidth)}px ${shapeState.borderStyle} ${shapeState.borderColor || "#111827"}`}`,
    `border-radius:${shapeState.shape === "circle" ? "999px" : "0px"}`,
    `transform:rotate(${shapeState.rotation}deg)`,
    "transform-origin:center center",
    "z-index:3",
    `overflow:${shapeState.shape === "line" ? "visible" : "hidden"}`,
  ].join(";");

const normalizeShapeState = (shapeState?: Partial<DocumentShapeValue>): DocumentShapeValue => ({
  shape: SHAPE_TYPES.includes(shapeState?.shape as ShapeType) ? (shapeState?.shape as ShapeType) : "square",
  width: Math.max(20, Number(shapeState?.width) || 160),
  height: Math.max(20, Number(shapeState?.height) || (shapeState?.shape === "square" ? Number(shapeState?.width) || 160 : shapeState?.shape === "line" ? 24 : 120)),
  x: Number(shapeState?.x) || 24,
  y: Number(shapeState?.y) || 24,
  rotation: Number.isFinite(Number(shapeState?.rotation)) ? Number(shapeState?.rotation) : 0,
  borderWidth: Math.max(1, Number(shapeState?.borderWidth) || 2),
  borderColor: shapeState?.borderColor || "#111827",
  fillColor: shapeState?.fillColor || "transparent",
  borderStyle: SHAPE_BORDER_STYLES.includes(shapeState?.borderStyle as ShapeBorderStyle)
    ? (shapeState?.borderStyle as ShapeBorderStyle)
    : "solid",
  opacity: Math.max(0.05, Math.min(1, Number(shapeState?.opacity) || 1)),
});

const ensureEditorRootMinHeight = (editorRoot: HTMLElement) => {
  const images = Array.from(editorRoot.querySelectorAll("img"));
  const shapes = Array.from(editorRoot.querySelectorAll(".document-shape-embed"));

  const bottomValues = [
    editorRoot.scrollHeight,
    ...images.map((node) => {
      const image = node as HTMLImageElement;
      const y = parseInt(image.getAttribute("data-y") || image.style.top || "0", 10) || 0;
      const height = image.clientHeight || parseInt(image.getAttribute("height") || "0", 10) || 120;
      return y + height + 80;
    }),
    ...shapes.map((node) => {
      const shape = node as HTMLElement;
      const y = parseInt(shape.getAttribute("data-y") || shape.style.top || "0", 10) || 0;
      const height = parseInt(shape.getAttribute("data-height") || shape.style.height || "0", 10) || 120;
      const width = parseInt(shape.getAttribute("data-width") || shape.style.width || "0", 10) || 120;
      return y + Math.max(width, height) + 80;
    }),
  ];

  editorRoot.style.minHeight = `${Math.max(720, ...bottomValues)}px`;
};

const registerDocumentImageFormat = () => {
  if (imageBlotRegistered) return;

  class DocumentImageFormat extends BaseImageFormat {
    static formats(domNode: Element) {
      const baseFormats = super.formats ? super.formats(domNode) : {};

      return IMAGE_FORMAT_ATTRIBUTES.reduce<Record<string, string>>((formats, attribute) => {
        const value = domNode.getAttribute(attribute);
        if (value) formats[attribute] = value;
        return formats;
      }, baseFormats || {});
    }

    format(name: string, value: string) {
      if (IMAGE_FORMAT_ATTRIBUTES.includes(name as (typeof IMAGE_FORMAT_ATTRIBUTES)[number])) {
        if (value) {
          this.domNode.setAttribute(name, value);
        } else {
          this.domNode.removeAttribute(name);
        }
        return;
      }

      super.format(name, value);
    }
  }

  Quill.register(DocumentImageFormat, true);
  imageBlotRegistered = true;
};

const registerEditorFormats = () => {
  if (editorFormatsRegistered) return;

  SizeStyle.whitelist = [...FONT_SIZE_OPTIONS];
  FontStyle.whitelist = [...FONT_FAMILY_OPTIONS.map((font) => font.value)];
  Quill.register(SizeStyle, true);
  Quill.register(FontStyle, true);

  class DocumentShapeBlot extends BlockEmbed {
    static blotName = "document-shape";
    static tagName = "div";
    static className = "document-shape-embed";

    static create(value?: Partial<DocumentShapeValue>) {
      const node = super.create() as HTMLElement;
      const shapeState = normalizeShapeState(value);

      node.setAttribute("contenteditable", "false");
      node.setAttribute("data-shape", shapeState.shape);
      node.setAttribute("data-width", String(shapeState.width));
      node.setAttribute("data-height", String(shapeState.height));
      node.setAttribute("data-x", String(shapeState.x));
      node.setAttribute("data-y", String(shapeState.y));
      node.setAttribute("data-rotation", String(shapeState.rotation));
      node.setAttribute("data-border-width", String(shapeState.borderWidth));
      node.setAttribute("data-border-color", shapeState.borderColor);
      node.setAttribute("data-fill-color", shapeState.fillColor);
      node.setAttribute("data-border-style", shapeState.borderStyle);
      node.setAttribute("data-opacity", String(shapeState.opacity));
      node.setAttribute("style", buildShapeStyle(shapeState));
      node.innerHTML = buildShapeMarkup(shapeState);
      return node;
    }

    static value(domNode: HTMLElement): DocumentShapeValue {
      return normalizeShapeState({
        shape: domNode.getAttribute("data-shape") as ShapeType,
        width: Number(domNode.getAttribute("data-width")),
        height: Number(domNode.getAttribute("data-height")),
        x: Number(domNode.getAttribute("data-x")),
        y: Number(domNode.getAttribute("data-y")),
        rotation: Number(domNode.getAttribute("data-rotation")),
        borderWidth: Number(domNode.getAttribute("data-border-width")),
        borderColor: domNode.getAttribute("data-border-color") || "#111827",
        fillColor: domNode.getAttribute("data-fill-color") || "transparent",
        borderStyle: domNode.getAttribute("data-border-style") as ShapeBorderStyle,
        opacity: Number(domNode.getAttribute("data-opacity")),
      });
    }
  }

  Quill.register(DocumentShapeBlot, true);
  editorFormatsRegistered = true;
};

registerDocumentImageFormat();
registerEditorFormats();

const setupEditorIcons = () => {
  Icons["bold"] = ReactDOMServer.renderToString(<NiTextBold />);
  Icons["italic"] = ReactDOMServer.renderToString(<NiTextItalic />);
  Icons["underline"] = ReactDOMServer.renderToString(<NiTextUnderline />);
  Icons["strike"] = ReactDOMServer.renderToString(<NiTextStrikethrough />);
  Icons["blockquote"] = ReactDOMServer.renderToString(<NiTextQuote />);
  Icons["code-block"] = ReactDOMServer.renderToString(<NiCode />);
  Icons["code"] = ReactDOMServer.renderToString(<NiDocumentCode />);
  Icons["color"] = ReactDOMServer.renderToString(<NiPaintRoller />);
  Icons["background"] = ReactDOMServer.renderToString(<NiPaintBucket />);
  Icons["clean"] = ReactDOMServer.renderToString(<NiEraser />);
  Icons["table"] = ReactDOMServer.renderToString(<NiLayout />);
  Icons["image"] = ReactDOMServer.renderToString(<NiDocumentImage />);
  Icons["video"] = ReactDOMServer.renderToString(<NiDocumentVideo />);
  Icons["formula"] = ReactDOMServer.renderToString(<NiBrackets />);
  Icons["link"] = ReactDOMServer.renderToString(<NiLink />);
  Icons["list"] = {
    ordered: ReactDOMServer.renderToString(<NiListNumber />),
    bullet: ReactDOMServer.renderToString(<NiList />),
    check: ReactDOMServer.renderToString(<NiListCheck />),
  };
  Icons["script"] = {
    sub: ReactDOMServer.renderToString(<NiScriptSub />),
    super: ReactDOMServer.renderToString(<NiScriptSuper />),
  };
  Icons["indent"] = {
    "-1": ReactDOMServer.renderToString(<NiMenuLeft />),
    "+1": ReactDOMServer.renderToString(<NiMenuRight />),
  };
  Icons["direction"] = {
    rtl: ReactDOMServer.renderToString(<NiEndLeftSmall />),
    "": ReactDOMServer.renderToString(<NiEndRightSmall />),
  };
  Icons["align"] = {
    "": ReactDOMServer.renderToString(<NiTextLeft />),
    center: ReactDOMServer.renderToString(<NiTextCenter />),
    right: ReactDOMServer.renderToString(<NiTextRight />),
    justify: ReactDOMServer.renderToString(<NiTextJustify />),
  };
};

const buildImageStyle = (imageState: SelectedImageState) =>
  [
    `width:${Math.max(40, imageState.width)}px`,
    "max-width:none",
    `opacity:${Math.max(0.05, Math.min(1, imageState.opacity))}`,
    `cursor:${imageState.positionMode === "absolute" ? "grab" : "pointer"}`,
    "display:block",
    `position:${imageState.positionMode === "absolute" ? "absolute" : "relative"}`,
    `left:${imageState.positionMode === "absolute" ? imageState.x : 0}px`,
    `top:${imageState.positionMode === "absolute" ? imageState.y : 0}px`,
    `z-index:${imageState.positionMode === "absolute" ? 4 : 1}`,
    `margin:${imageState.positionMode === "absolute" ? "0" : "12px 0"}`,
  ].join(";");

const TOOLBAR_TITLES: Record<string, string> = {
  "ql-header": "Heading",
  "ql-align": "Alignment",
  "ql-bold": "Bold",
  "ql-italic": "Italic",
  "ql-strike": "Strikethrough",
  "ql-underline": "Underline",
  "ql-blockquote": "Quote",
  "ql-code-block": "Code Block",
  "ql-code": "Inline Code",
  "ql-list": "List",
  "ql-script": "Subscript / Superscript",
  "ql-indent": "Indent",
  "ql-direction": "Text Direction",
  "ql-color": "Text Color",
  "ql-background": "Background Color",
  "ql-table": "Insert Table",
  "ql-image": "Insert Image",
  "ql-video": "Insert Video",
  "ql-formula": "Formula",
  "ql-link": "Insert Link",
  "ql-clean": "Clear Formatting",
};

type SelectedImageState = {
  index: number;
  src: string;
  width: number;
  opacity: number;
  positionMode: "flow" | "absolute";
  x: number;
  y: number;
};

type SelectedImageFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type SelectedShapeState = DocumentShapeValue & {
  index: number;
};

type SelectedShapeFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type UploadedFontOption = DocumentCustomFont;

type EditorSelectionRange = {
  index: number;
  length: number;
};

type ClearableNumberFieldProps = Omit<TextFieldProps, "value" | "onChange" | "type"> & {
  value: number;
  fallbackValue: number;
  onCommit: (value: number) => void;
  normalize?: (value: number) => number;
};

const FONT_UPLOAD_ACCEPT = ".ttf,.otf,.woff,.woff2";
const IMAGE_UPLOAD_ACCEPT = "image/*";

const getAngleFromCenter = (centerX: number, centerY: number, clientX: number, clientY: number) =>
  (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI;

const getFontSizeSelectValue = (fontSizePx: string) => {
  const value = `${Math.max(8, Number(fontSizePx) || 16)}px`;
  return FONT_SIZE_OPTIONS.includes(value as (typeof FONT_SIZE_OPTIONS)[number]) ? value : "custom";
};

const normalizeFontFamilyValue = (value?: string) => (value || "").replace(/^['"]|['"]$/g, "");
const normalizeFontUploadName = (value: string) => value.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9 -]/g, "").trim() || "Custom Font";
const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read font file"));
    reader.readAsDataURL(file);
  });

function ClearableNumberField({
  value,
  fallbackValue,
  onCommit,
  normalize,
  onFocus,
  onBlur,
  ...props
}: ClearableNumberFieldProps) {
  const [draftValue, setDraftValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDraftValue(String(value));
    }
  }, [value, isFocused]);

  return (
    <TextField
      {...props}
      type="number"
      value={draftValue}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onChange={(event) => {
        setDraftValue(event.target.value);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        const rawValue = event.target.value.trim();
        const parsedValue = rawValue === "" ? fallbackValue : Number(rawValue);
        const safeValue = Number.isFinite(parsedValue) ? parsedValue : value;
        const nextValue = normalize ? normalize(safeValue) : safeValue;

        setDraftValue(String(nextValue));
        onCommit(nextValue);
        onBlur?.(event);
      }}
    />
  );
}

export default function DocumentUpsert() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const isBuilderStep = isEdit || searchParams.get("step") === "builder";

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [variableSearch, setVariableSearch] = useState("");
  const [variableDialogOpen, setVariableDialogOpen] = useState(false);
  const [paperDialogOpen, setPaperDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [shapeDialogOpen, setShapeDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImageState | null>(null);
  const [selectedImageFrame, setSelectedImageFrame] = useState<SelectedImageFrame | null>(null);
  const [selectedShape, setSelectedShape] = useState<SelectedShapeState | null>(null);
  const [selectedShapeFrame, setSelectedShapeFrame] = useState<SelectedShapeFrame | null>(null);
  const [fontSizePx, setFontSizePx] = useState("16");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [uploadedFonts, setUploadedFonts] = useState<UploadedFontOption[]>([]);
  const [pendingSourceFile, setPendingSourceFile] = useState<File | null>(null);
  const [pdfSourceBlob, setPdfSourceBlob] = useState<Blob | null>(null);
  const [xlsxPreview, setXlsxPreview] = useState<XlsxPreviewSheet | null>(null);
  const [sourcePreviewLoading, setSourcePreviewLoading] = useState(false);
  const [sourceLoadError, setSourceLoadError] = useState<string | null>(null);
  const [aiItems, setAiItems] = useState<AiTemplateItem[]>([]);
  const [selectedAiItemId, setSelectedAiItemId] = useState<string | null>(null);
  const [pdfCanvasZoom, setPdfCanvasZoom] = useState(1);
  const [pdfShowGrid, setPdfShowGrid] = useState(true);
  const [pdfShowGuides, setPdfShowGuides] = useState(true);
  const [pdfShowRulers, setPdfShowRulers] = useState(true);
  const [pdfSnapToGrid, setPdfSnapToGrid] = useState(true);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [fitZoom, setFitZoom] = useState(1);
  const quillRef = useRef<ReactQuill | null>(null);
  const savedSelectionRef = useRef<EditorSelectionRange | null>(null);
  const fontUploadInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundImageInputRef = useRef<HTMLInputElement | null>(null);
  const sourceUploadInputRef = useRef<HTMLInputElement | null>(null);
  const toolbarHostRef = useRef<HTMLDivElement | null>(null);
  const pageCanvasRef = useRef<HTMLDivElement | null>(null);
  const previewViewportRef = useRef<HTMLDivElement | null>(null);
  const dragImageRef = useRef<
    | {
        mode: "drag" | "resize";
        index: number;
        startX: number;
        startY: number;
        originX: number;
        originY: number;
        originWidth: number;
      }
    | null
  >(null);
  const dragShapeRef = useRef<
    | {
        mode: "drag" | "resize" | "rotate";
        index: number;
        startX: number;
        startY: number;
        originX: number;
        originY: number;
        originWidth: number;
        originHeight: number;
        originRotation: number;
        originAngle: number;
      }
    | null
  >(null);

  useEffect(() => {
    registerDocumentImageFormat();
    registerEditorFormats();
    setupEditorIcons();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const host = toolbarHostRef.current;
      const toolbar = document.querySelector(".document-editor .ql-toolbar") || host?.querySelector(".ql-toolbar");
      if (!toolbar) return;

      if (host && toolbar.parentElement !== host) {
        host.appendChild(toolbar);
      }

      Object.entries(TOOLBAR_TITLES).forEach(([className, title]) => {
        toolbar.querySelectorAll(`.${className}`).forEach((element) => {
          element.setAttribute("title", title);
          element.setAttribute("aria-label", title);
        });
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isBuilderStep]);

  const syncEditorHtmlToForm = () => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    formik.setFieldValue("templateContent", editor.root.innerHTML);
  };

  const syncActiveFontSize = () => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection() || savedSelectionRef.current;
    const formats = range ? editor.getFormat(range) : editor.getFormat();
    const sizeValue = typeof formats.size === "string" ? formats.size : "16px";
    const nextFontFamily = typeof formats.font === "string" ? normalizeFontFamilyValue(formats.font) : "Arial";
    const parsed = parseInt(sizeValue, 10);
    setFontSizePx(String(Number.isNaN(parsed) ? 16 : parsed));
    setFontFamily(nextFontFamily || "Arial");
  };

  const applyInlineFormat = (format: "size" | "font", value: string) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const range = editor.getSelection() || savedSelectionRef.current;
    editor.focus();

    if (range) {
      editor.setSelection(range.index, range.length, "silent");
      if (range.length > 0) {
        editor.formatText(range.index, range.length, format, value, "user");
      } else {
        editor.format(format, value, "user");
      }
      savedSelectionRef.current = range;
    } else {
      editor.format(format, value, "user");
    }

    syncEditorHtmlToForm();
  };

  const getImageElement = (imageState?: SelectedImageState | null) => {
    const editor = quillRef.current?.getEditor();
    if (!editor || !imageState) return null;
    const images = Array.from(editor.root.querySelectorAll("img"));
    return (images[imageState.index] as HTMLImageElement | undefined) || null;
  };

  const getShapeElement = (shapeState?: SelectedShapeState | null) => {
    const editor = quillRef.current?.getEditor();
    if (!editor || !shapeState) return null;
    const shapes = Array.from(editor.root.querySelectorAll(".document-shape-embed"));
    return (shapes[shapeState.index] as HTMLDivElement | undefined) || null;
  };

  const updateSelectedImageFrame = (imageState?: SelectedImageState | null) => {
    const image = getImageElement(imageState || selectedImage);
    const page = pageCanvasRef.current;
    if (!image || !page) {
      setSelectedImageFrame(null);
      return;
    }

    const imageRect = image.getBoundingClientRect();
    const pageRect = page.getBoundingClientRect();

    setSelectedImageFrame({
      left: imageRect.left - pageRect.left,
      top: imageRect.top - pageRect.top,
      width: imageRect.width,
      height: imageRect.height,
    });
  };

  const updateSelectedShapeFrame = (shapeState?: SelectedShapeState | null) => {
    const shape = getShapeElement(shapeState || selectedShape);
    const page = pageCanvasRef.current;
    if (!shape || !page) {
      setSelectedShapeFrame(null);
      return;
    }

    const shapeRect = shape.getBoundingClientRect();
    const pageRect = page.getBoundingClientRect();

    setSelectedShapeFrame({
      left: shapeRect.left - pageRect.left,
      top: shapeRect.top - pageRect.top,
      width: shapeRect.width,
      height: shapeRect.height,
    });
  };

  const readImageState = (image: HTMLImageElement): SelectedImageState => {
    const editor = quillRef.current?.getEditor();
    const images = editor ? Array.from(editor.root.querySelectorAll("img")) : [];
    const index = images.indexOf(image);
    const width = parseInt(image.getAttribute("width") || image.style.width || "", 10) || image.clientWidth || 240;
    const opacity = Number(image.getAttribute("data-opacity") || image.style.opacity || "1");
    const positionMode = image.getAttribute("data-position-mode") === "absolute" ? "absolute" : "flow";
    const x = parseInt(image.getAttribute("data-x") || image.style.left || "0", 10) || 0;
    const y = parseInt(image.getAttribute("data-y") || image.style.top || "0", 10) || 0;

    return {
      index,
      src: image.getAttribute("src") || "",
      width,
      opacity: Number.isNaN(opacity) ? 1 : opacity,
      positionMode,
      x,
      y,
    };
  };

  const applyImageState = (nextState: SelectedImageState) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const images = Array.from(editor.root.querySelectorAll("img"));
    const image = images[nextState.index] as HTMLImageElement | undefined;
    if (!image) {
      setSelectedImage(null);
      setSelectedImageFrame(null);
      return;
    }

    const safeWidth = Math.max(40, nextState.width);
    const safeOpacity = Math.max(0.05, Math.min(1, nextState.opacity));

    image.setAttribute("width", String(safeWidth));
    image.setAttribute("data-position-mode", nextState.positionMode);
    image.setAttribute("data-x", String(nextState.x));
    image.setAttribute("data-y", String(nextState.y));
    image.setAttribute("data-opacity", String(safeOpacity));
    image.setAttribute(
      "style",
      buildImageStyle({
        ...nextState,
        width: safeWidth,
        opacity: safeOpacity,
      }),
    );

    if (image.parentElement) {
      image.parentElement.style.position = "";
      image.parentElement.style.minHeight = "";
    }

    editor.root.style.position = "relative";
    ensureEditorRootMinHeight(editor.root);

    setSelectedImage({ ...nextState });
    window.requestAnimationFrame(() => updateSelectedImageFrame(nextState));
    syncEditorHtmlToForm();
  };

  const readShapeState = (shapeNode: HTMLElement): SelectedShapeState => {
    const editor = quillRef.current?.getEditor();
    const shapes = editor ? Array.from(editor.root.querySelectorAll(".document-shape-embed")) : [];
    const index = shapes.indexOf(shapeNode);
    const shapeState = normalizeShapeState({
      shape: shapeNode.getAttribute("data-shape") as ShapeType,
      width: Number(shapeNode.getAttribute("data-width")),
      height: Number(shapeNode.getAttribute("data-height")),
      x: Number(shapeNode.getAttribute("data-x")),
      y: Number(shapeNode.getAttribute("data-y")),
      rotation: Number(shapeNode.getAttribute("data-rotation")),
      borderWidth: Number(shapeNode.getAttribute("data-border-width")),
      borderColor: shapeNode.getAttribute("data-border-color") || "#111827",
      fillColor: shapeNode.getAttribute("data-fill-color") || "transparent",
      borderStyle: shapeNode.getAttribute("data-border-style") as ShapeBorderStyle,
      opacity: Number(shapeNode.getAttribute("data-opacity")),
    });

    return {
      index,
      ...shapeState,
    };
  };

  const applyShapeState = (nextState: SelectedShapeState) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const shapes = Array.from(editor.root.querySelectorAll(".document-shape-embed"));
    const shape = shapes[nextState.index] as HTMLElement | undefined;
    if (!shape) {
      setSelectedShape(null);
      setSelectedShapeFrame(null);
      return;
    }

    const safeState = normalizeShapeState(nextState);
    shape.setAttribute("data-shape", safeState.shape);
    shape.setAttribute("data-width", String(safeState.width));
    shape.setAttribute("data-height", String(safeState.height));
    shape.setAttribute("data-x", String(safeState.x));
    shape.setAttribute("data-y", String(safeState.y));
    shape.setAttribute("data-rotation", String(safeState.rotation));
    shape.setAttribute("data-border-width", String(safeState.borderWidth));
    shape.setAttribute("data-border-color", safeState.borderColor);
    shape.setAttribute("data-fill-color", safeState.fillColor);
    shape.setAttribute("data-border-style", safeState.borderStyle);
    shape.setAttribute("data-opacity", String(safeState.opacity));
    shape.setAttribute("style", buildShapeStyle(safeState));
    shape.innerHTML = buildShapeMarkup(safeState);

    editor.root.style.position = "relative";
    ensureEditorRootMinHeight(editor.root);

    const selectedState = { index: nextState.index, ...safeState };
    setSelectedShape(selectedState);
    window.requestAnimationFrame(() => updateSelectedShapeFrame(selectedState));
    syncEditorHtmlToForm();
  };

  const removeSelectedImage = () => {
    const editor = quillRef.current?.getEditor();
    const image = getImageElement(selectedImage);
    if (!editor || !image) return;

    const blot = Quill.find(image);
    if (!blot) return;

    const index = editor.getIndex(blot);
    editor.deleteText(index, 1, "user");
    setSelectedImage(null);
    setSelectedImageFrame(null);
    syncEditorHtmlToForm();
    ensureEditorRootMinHeight(editor.root);
  };

  const removeSelectedShape = () => {
    const editor = quillRef.current?.getEditor();
    const shape = getShapeElement(selectedShape);
    if (!editor || !shape) return;

    const blot = Quill.find(shape);
    if (!blot) return;

    const index = editor.getIndex(blot);
    editor.deleteText(index, 1, "user");
    setSelectedShape(null);
    setSelectedShapeFrame(null);
    syncEditorHtmlToForm();
    ensureEditorRootMinHeight(editor.root);
  };

  const formik = useFormik<Partial<DocumentTemplate>>({
    initialValues: {
      name: "",
      docType: "other",
      documentFormat: "html",
      fileType: "",
      originalFileName: "",
      templateContent: "<p></p>",
      backgroundImageUrl: "",
      shortcodes: [],
      description: "",
      status: "draft",
      isActive: true,
      pageSettings: DEFAULT_DOCUMENT_PAGE_SETTINGS,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = preparePayload(values, aiItems);
        let savedDocumentId = id;
        if (isEdit && id) {
          await DocumentService.updateDocument(id, payload);
        } else {
          const response = await DocumentService.createDocument(payload);
          savedDocumentId = response?.data?._id;
        }
        if (pendingSourceFile && savedDocumentId) {
          await DocumentService.uploadTemplateSource(savedDocumentId, pendingSourceFile);
        }
        navigate(`/${role}/documents`);
      } catch (error) {
        console.error("Failed to save document", error);
        setLoadError("Failed to save document");
      } finally {
        setLoading(false);
      }
    },
  });

  const pageSettings = normalizePageSettings(formik.values.pageSettings);
  const paperSizeUnit = pageSettings.unit || "mm";
  const isPdfFormat = formik.values.documentFormat === "pdf";
  const isXlsxFormat = formik.values.documentFormat === "xlsx";
  const isFillablePdfFormat = formik.values.documentFormat === "fillable_pdf";
  const isDocxFormat = formik.values.documentFormat === "docx";
  const isSpecialFormat = isPdfFormat || isXlsxFormat || isFillablePdfFormat || isDocxFormat;
  const usedVariables = extractVariables(formik.values.templateContent || "");
  const currentCanvasZoom = Math.max(0.35, Math.min(1.5, canvasZoom));
  const availableFonts = useMemo(
    () => [
      ...FONT_FAMILY_OPTIONS,
      ...uploadedFonts.map((font) => ({
        value: font.family,
        label: font.label,
      })),
    ],
    [uploadedFonts],
  );

  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchDocument = async () => {
      setLoading(true);
      setSourceLoadError(null);
      try {
        const response = await DocumentService.getDocumentById(id);
        if (response.success && response.data) {
          const {
            _id,
            createdAt,
            updatedAt,
            __v,
            ...documentData
          } = response.data;

          formik.setValues({
            ...formik.initialValues,
            ...documentData,
            pageSettings: normalizePageSettings(documentData.pageSettings),
          });
          setUploadedFonts(Array.isArray(documentData.customFonts) ? documentData.customFonts : []);
          if (documentData.documentFormat === "pdf") {
            setAiItems(parseAiTemplateLayout(documentData.templateContent).items);
            if ((_id || id) && (documentData.originalFileName || documentData.originalFilePath)) {
              try {
                setSourcePreviewLoading(true);
                const sourceBlob = await DocumentService.getTemplateSourceBlob((_id || id) as string);
                setPdfSourceBlob(sourceBlob);
                setXlsxPreview(null);
              } catch (sourceError) {
                console.error("Failed to load PDF source", sourceError);
                setSourceLoadError(sourceError instanceof Error ? sourceError.message : "Failed to load source file");
              } finally {
                setSourcePreviewLoading(false);
              }
            }
          } else if (documentData.documentFormat === "xlsx") {
            setAiItems(createDefaultAiTemplateLayout().items);
            setPdfSourceBlob(null);
            if ((_id || id) && (documentData.originalFileName || documentData.originalFilePath)) {
              try {
                setSourcePreviewLoading(true);
                const sourceBlob = await DocumentService.getTemplateSourceBlob((_id || id) as string);
                const preview = await readXlsxPreview(sourceBlob);
                setXlsxPreview(preview);
              } catch (sourceError) {
                console.error("Failed to load XLSX source", sourceError);
                setSourceLoadError(sourceError instanceof Error ? sourceError.message : "Failed to load source file");
              } finally {
                setSourcePreviewLoading(false);
              }
            }
          } else if (documentData.documentFormat === "fillable_pdf") {
            setAiItems(createDefaultAiTemplateLayout().items);
            setXlsxPreview(null);
            if ((_id || id) && (documentData.originalFileName || documentData.originalFilePath)) {
              try {
                setSourcePreviewLoading(true);
                const sourceBlob = await DocumentService.getTemplateSourceBlob((_id || id) as string);
                setPdfSourceBlob(sourceBlob);
              } catch (sourceError) {
                console.error("Failed to load fillable PDF source", sourceError);
                setSourceLoadError(sourceError instanceof Error ? sourceError.message : "Failed to load source file");
              } finally {
                setSourcePreviewLoading(false);
              }
            }
          } else if (documentData.documentFormat === "docx") {
            setAiItems(createDefaultAiTemplateLayout().items);
            setPdfSourceBlob(null);
            setXlsxPreview(null);
          } else {
            setAiItems(createDefaultAiTemplateLayout().items);
            setPdfSourceBlob(null);
            setXlsxPreview(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch document", error);
        setLoadError("Failed to fetch document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  useEffect(() => {
    if (!isBuilderStep) return;
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const root = editor.root;

    root.style.position = "relative";
    ensureEditorRootMinHeight(root);

    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.tagName === "IMG") {
        const nextState = readImageState(target as HTMLImageElement);
        setSelectedImage(nextState);
        setSelectedShape(null);
        setSelectedShapeFrame(null);
        window.requestAnimationFrame(() => updateSelectedImageFrame(nextState));
        return;
      }
      const shapeNode = target.closest(".document-shape-embed") as HTMLElement | null;
      if (shapeNode) {
        const nextState = readShapeState(shapeNode);
        setSelectedShape(nextState);
        setSelectedImage(null);
        setSelectedImageFrame(null);
        window.requestAnimationFrame(() => updateSelectedShapeFrame(nextState));
        return;
      }
      if (!target.closest("img")) {
        setSelectedImage(null);
        setSelectedImageFrame(null);
      }
      if (!target.closest(".document-shape-embed")) {
        setSelectedShape(null);
        setSelectedShapeFrame(null);
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.tagName === "IMG") {
        const state = readImageState(target as HTMLImageElement);
        if (state.positionMode !== "absolute") return;
        dragImageRef.current = {
          mode: "drag",
          index: state.index,
          startX: event.clientX,
          startY: event.clientY,
          originX: state.x,
          originY: state.y,
          originWidth: state.width,
        };
        (target as HTMLImageElement).style.cursor = "grabbing";
        event.preventDefault();
        return;
      }

      const shapeNode = target.closest(".document-shape-embed") as HTMLElement | null;
      if (!shapeNode) return;
      const state = readShapeState(shapeNode);
      dragShapeRef.current = {
        mode: "drag",
        index: state.index,
        startX: event.clientX,
        startY: event.clientY,
        originX: state.x,
        originY: state.y,
        originWidth: state.width,
        originHeight: state.height,
        originRotation: state.rotation,
        originAngle: 0,
      };
      shapeNode.style.cursor = "grabbing";
      event.preventDefault();
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!dragImageRef.current) return;
      if (dragImageRef.current.mode === "resize") {
        updateImageFromIndex(dragImageRef.current.index, (currentState) => ({
          ...currentState,
          width: Math.max(40, dragImageRef.current!.originWidth + (event.clientX - dragImageRef.current!.startX)),
        }));
        return;
      }

      updateImageFromIndex(dragImageRef.current.index, (currentState) => ({
        ...currentState,
        positionMode: "absolute",
        x: dragImageRef.current!.originX + (event.clientX - dragImageRef.current!.startX),
        y: dragImageRef.current!.originY + (event.clientY - dragImageRef.current!.startY),
      }));
    };

    const handleShapeMouseMove = (event: MouseEvent) => {
      if (!dragShapeRef.current) return;
      if (dragShapeRef.current.mode === "rotate") {
        const shapes = Array.from(root.querySelectorAll(".document-shape-embed"));
        const shape = shapes[dragShapeRef.current.index] as HTMLElement | undefined;
        if (!shape) return;
        const rect = shape.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentAngle = getAngleFromCenter(centerX, centerY, event.clientX, event.clientY);

        updateShapeFromIndex(dragShapeRef.current.index, (currentState) => ({
          ...currentState,
          rotation: Math.round(dragShapeRef.current!.originRotation + (currentAngle - dragShapeRef.current!.originAngle)),
        }));
        return;
      }
      if (dragShapeRef.current.mode === "resize") {
        updateShapeFromIndex(dragShapeRef.current.index, (currentState) => ({
          ...currentState,
          width: Math.max(20, dragShapeRef.current!.originWidth + (event.clientX - dragShapeRef.current!.startX)),
          height: currentState.shape === "line"
            ? dragShapeRef.current!.originHeight
            : Math.max(20, dragShapeRef.current!.originHeight + (event.clientY - dragShapeRef.current!.startY)),
        }));
        return;
      }

      updateShapeFromIndex(dragShapeRef.current.index, (currentState) => ({
        ...currentState,
        x: dragShapeRef.current!.originX + (event.clientX - dragShapeRef.current!.startX),
        y: dragShapeRef.current!.originY + (event.clientY - dragShapeRef.current!.startY),
      }));
    };

    const handleMouseUp = () => {
      Array.from(root.querySelectorAll("img")).forEach((imageNode) => {
        const image = imageNode as HTMLImageElement;
        if (image.dataset.positionMode === "absolute") image.style.cursor = "grab";
      });
      Array.from(root.querySelectorAll(".document-shape-embed")).forEach((shapeNode) => {
        (shapeNode as HTMLElement).style.cursor = "grab";
      });
      dragImageRef.current = null;
      dragShapeRef.current = null;
    };

    root.addEventListener("click", handleClick);
    root.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousemove", handleShapeMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      root.removeEventListener("click", handleClick);
      root.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handleShapeMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isBuilderStep]);

  useEffect(() => {
    if (!isBuilderStep) return;

    const updateFitZoom = () => {
      const viewport = previewViewportRef.current;
      const page = pageCanvasRef.current;
      if (!viewport || !page) return;

      const pageWidth = page.offsetWidth || 1;
      const pageHeight = page.offsetHeight || 1;
      const widthZoom = (viewport.clientWidth - 24) / pageWidth;
      const heightZoom = (viewport.clientHeight - 24) / pageHeight;
      const nextFitZoom = Math.max(0.35, Math.min(1, widthZoom, heightZoom));
      setFitZoom(nextFitZoom);
    };

    updateFitZoom();
    window.addEventListener("resize", updateFitZoom);
    return () => window.removeEventListener("resize", updateFitZoom);
  }, [isBuilderStep, pageSettings.unit, pageSettings.widthMm, pageSettings.heightMm, pageSettings.marginTopMm, pageSettings.marginRightMm, pageSettings.marginBottomMm, pageSettings.marginLeftMm, formik.values.templateContent]);

  useEffect(() => {
    if (!selectedImage) return;

    const handleWindowChange = () => updateSelectedImageFrame(selectedImage);

    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    window.requestAnimationFrame(() => updateSelectedImageFrame(selectedImage));

    return () => {
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [selectedImage]);

  useEffect(() => {
    if (!selectedShape) return;

    const handleWindowChange = () => updateSelectedShapeFrame(selectedShape);

    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    window.requestAnimationFrame(() => updateSelectedShapeFrame(selectedShape));

    return () => {
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [selectedShape]);

  useEffect(() => {
    if (!isBuilderStep) return;
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const handleSelectionChange = (range: EditorSelectionRange | null) => {
      if (range) {
        savedSelectionRef.current = range;
      }
      syncActiveFontSize();
    };
    const handleTextChange = () => syncActiveFontSize();

    editor.on("selection-change", handleSelectionChange);
    editor.on("text-change", handleTextChange);
    syncActiveFontSize();

    return () => {
      editor.off("selection-change", handleSelectionChange);
      editor.off("text-change", handleTextChange);
    };
  }, [isBuilderStep]);

  useEffect(() => {
    const styleId = "document-builder-uploaded-fonts";
    const existingNode = document.getElementById(styleId) as HTMLStyleElement | null;
    FontStyle.whitelist = availableFonts.map((font) => font.value);

    if (!uploadedFonts.length) {
      existingNode?.remove();
      return;
    }

    const styleNode = existingNode || document.createElement("style");
    styleNode.id = styleId;
    styleNode.textContent = uploadedFonts
      .map(
        (font) => `
          @font-face {
            font-family: "${font.family}";
            src: url("${font.source}");
          }
        `,
      )
      .join("\n");

    if (!existingNode) {
      document.head.appendChild(styleNode);
    }

    return () => {
      if (!uploadedFonts.length) styleNode.remove();
    };
  }, [availableFonts, uploadedFonts]);

  const availableVariableGroups = useMemo(() => {
    const groups: Array<{ title: string; items: DocumentVariableDefinition[] }> = [
      { title: "System Variables", items: SYSTEM_DOCUMENT_VARIABLES },
    ];

    if (formik.values.docType === "student") {
      groups.push({ title: "Student Variables", items: STUDENT_DOCUMENT_VARIABLES });
    }

    return groups.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.templateVariable.toLowerCase().includes(variableSearch.trim().toLowerCase())),
    }));
  }, [formik.values.docType, variableSearch]);

  const aiAvailableVariables = useMemo(
    () => availableVariableGroups.flatMap((group) => group.items),
    [availableVariableGroups],
  );
  const selectedPdfItem = useMemo(
    () => aiItems.find((item) => item.id === selectedAiItemId) || null,
    [aiItems, selectedAiItemId],
  );

  const handlePagePresetChange = (preset: DocumentPageSettings["preset"]) => {
    const orientation = formik.values.pageSettings?.orientation || DEFAULT_DOCUMENT_PAGE_SETTINGS.orientation;
    const nextBase = preset === "Custom"
      ? formik.values.pageSettings || DEFAULT_DOCUMENT_PAGE_SETTINGS
      : getPageSettingsFromPreset(preset, orientation);

    formik.setFieldValue("pageSettings", {
      ...normalizePageSettings(formik.values.pageSettings),
      preset,
      unit: preset === "Custom" ? pageSettings.unit : "mm",
      ...nextBase,
    });
  };

  const handleOrientationChange = (orientation: DocumentPageSettings["orientation"]) => {
    const preset = formik.values.pageSettings?.preset || DEFAULT_DOCUMENT_PAGE_SETTINGS.preset;
    const nextBase = preset === "Custom"
      ? {
          widthMm: Number(formik.values.pageSettings?.widthMm) || DEFAULT_DOCUMENT_PAGE_SETTINGS.widthMm,
          heightMm: Number(formik.values.pageSettings?.heightMm) || DEFAULT_DOCUMENT_PAGE_SETTINGS.heightMm,
        }
      : getPageSettingsFromPreset(preset, orientation);

    formik.setFieldValue("pageSettings", {
      ...normalizePageSettings(formik.values.pageSettings),
      orientation,
      ...nextBase,
    });
  };

  const updatePageField = (field: keyof DocumentPageSettings, value: string) => {
    formik.setFieldValue("pageSettings", {
      ...normalizePageSettings(formik.values.pageSettings),
      preset: field === "widthMm" || field === "heightMm" ? "Custom" : pageSettings.preset,
      [field]: Number(value) || 0,
    });
  };

  const updatePageDimensionField = (field: "widthMm" | "heightMm", value: number) => {
    updatePageField(field, String(value));
  };

  const handlePageSizeUnitChange = (unit: DocumentPageUnit) => {
    const currentSettings = normalizePageSettings(formik.values.pageSettings);
    const currentUnit = currentSettings.unit || "mm";
    formik.setFieldValue("pageSettings", {
      ...currentSettings,
      preset: "Custom",
      unit,
      widthMm: convertPageSizeUnit(currentSettings.widthMm, currentUnit, unit),
      heightMm: convertPageSizeUnit(currentSettings.heightMm, currentUnit, unit),
      marginTopMm: convertPageSizeUnit(currentSettings.marginTopMm, currentUnit, unit),
      marginRightMm: convertPageSizeUnit(currentSettings.marginRightMm, currentUnit, unit),
      marginBottomMm: convertPageSizeUnit(currentSettings.marginBottomMm, currentUnit, unit),
      marginLeftMm: convertPageSizeUnit(currentSettings.marginLeftMm, currentUnit, unit),
    });
  };

  const insertVariable = async (variable: string) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) {
      await navigator.clipboard.writeText(variable);
      return;
    }

    const range = editor.getSelection(true);
    const index = range?.index ?? editor.getLength();
    editor.insertText(index, variable, "user");
    editor.setSelection(index + variable.length, 0, "user");
    syncEditorHtmlToForm();
  };

  const copyVariable = async (variable: string) => {
    await navigator.clipboard.writeText(variable);
    enqueueSnackbar(`${variable} ${t("copied")}`, { variant: "success" });
  };

  const handlePdfVariableClick = async (variable: string) => {
    addPdfVariable(variable);
    await copyVariable(variable);
  };

  const addPdfVariable = (variable: string) => {
    const nextItem: AiTemplateItem = {
      id: `pdf-item-${Date.now()}`,
      type: "variable",
      value: variable,
      x: 10,
      y: 10 + aiItems.length * 5,
      width: 28,
      fontFamily,
      fontSize: Math.max(8, Number(fontSizePx) || 16),
      color: "#111827",
      backgroundColor: "transparent",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: 0,
      textAlign: "left",
      locked: false,
    };
    setAiItems((current) => [...current, nextItem]);
    setSelectedAiItemId(nextItem.id);
  };

  const addPdfText = () => {
    const nextItem: AiTemplateItem = {
      id: `pdf-text-${Date.now()}`,
      type: "text",
      value: "Custom Text",
      x: 12,
      y: 14 + aiItems.length * 5,
      width: 28,
      fontFamily,
      fontSize: Math.max(8, Number(fontSizePx) || 16),
      color: "#111827",
      backgroundColor: "transparent",
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: 0,
      textAlign: "left",
      locked: false,
    };
    setAiItems((current) => [...current, nextItem]);
    setSelectedAiItemId(nextItem.id);
  };

  const updateSelectedPdfItem = (patch: Partial<AiTemplateItem>) => {
    if (!selectedAiItemId) return;
    setAiItems((current) => current.map((item) => (item.id === selectedAiItemId ? { ...item, ...patch } : item)));
  };

  const removeSelectedPdfItem = () => {
    if (!selectedAiItemId) return;
    setAiItems((current) => current.filter((item) => item.id !== selectedAiItemId));
    setSelectedAiItemId(null);
  };

  const applyFontSize = (value: string) => {
    const px = Math.max(8, Number(value) || 16);
    const normalized = `${px}px`;
    setFontSizePx(String(px));
    applyInlineFormat("size", normalized);
  };

  const applyFontFamily = (value: string) => {
    const normalized = normalizeFontFamilyValue(value) || "Arial";
    setFontFamily(normalized);
    applyInlineFormat("font", normalized);
  };

  const handleBackgroundImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const source = await readFileAsDataUrl(file);
      formik.setFieldValue("backgroundImageUrl", source);
    } catch (error) {
      console.error("Failed to upload background image", error);
    }
  };

  const handleFontUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const source = await readFileAsDataUrl(file);
      const label = normalizeFontUploadName(file.name);
      const family = `${label}-${Date.now()}`;
      const nextFont = { family, label, source };

      setUploadedFonts((current) => {
        const withoutSameLabel = current.filter((font) => font.label !== label);
        const nextFonts = [...withoutSameLabel, nextFont];
        formik.setFieldValue("customFonts", nextFonts);
        return nextFonts;
      });

      window.setTimeout(() => applyFontFamily(family), 0);
    } catch (error) {
      console.error("Failed to upload font", error);
    }
  };

  const insertShape = (shape: ShapeType = "square") => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true);
    const index = range?.index ?? editor.getLength();
    const defaultShape = normalizeShapeState({
      shape,
      width: shape === "square" ? 120 : shape === "line" ? 220 : 180,
      height: shape === "line" ? 24 : 120,
      x: 24,
      y: 24,
      rotation: 0,
      borderStyle: "solid",
      borderColor: "#111827",
      fillColor: shape === "line" ? "transparent" : "transparent",
      borderWidth: shape === "line" ? 3 : 2,
      opacity: 1,
    });

    editor.insertEmbed(index, "document-shape", defaultShape, "user");
    editor.insertText(index + 1, "\n", "user");
    editor.setSelection(index + 2, 0, "user");
    ensureEditorRootMinHeight(editor.root);
    syncEditorHtmlToForm();

    window.requestAnimationFrame(() => {
      const shapes = Array.from(editor.root.querySelectorAll(".document-shape-embed"));
      const shapeNode = shapes[shapes.length - 1] as HTMLElement | undefined;
      if (!shapeNode) return;
      const nextState = readShapeState(shapeNode);
      setSelectedShape(nextState);
      setSelectedImage(null);
      setSelectedImageFrame(null);
      updateSelectedShapeFrame(nextState);
    });
  };

  const handleEditorMouseDownCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (target.tagName === "IMG") {
      const nextState = readImageState(target as HTMLImageElement);
      setSelectedImage(nextState);
      setSelectedShape(null);
      setSelectedShapeFrame(null);
      window.requestAnimationFrame(() => updateSelectedImageFrame(nextState));
      return;
    }

    const shapeNode = target.closest(".document-shape-embed") as HTMLElement | null;
    if (!shapeNode) return;
    const nextState = readShapeState(shapeNode);
    setSelectedShape(nextState);
    setSelectedImage(null);
    setSelectedImageFrame(null);
    window.requestAnimationFrame(() => updateSelectedShapeFrame(nextState));
  };

  const handleResizeStart = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!selectedImage) return;

    dragImageRef.current = {
      mode: "resize",
      index: selectedImage.index,
      startX: event.clientX,
      startY: event.clientY,
      originX: selectedImage.x,
      originY: selectedImage.y,
      originWidth: selectedImage.width,
    };
  };

  const handleOverlayDragStart = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!selectedImage || selectedImage.positionMode !== "absolute") return;

    dragImageRef.current = {
      mode: "drag",
      index: selectedImage.index,
      startX: event.clientX,
      startY: event.clientY,
      originX: selectedImage.x,
      originY: selectedImage.y,
      originWidth: selectedImage.width,
    };
  };

  const handleShapeResizeStart = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!selectedShape) return;

    dragShapeRef.current = {
      mode: "resize",
      index: selectedShape.index,
      startX: event.clientX,
      startY: event.clientY,
      originX: selectedShape.x,
      originY: selectedShape.y,
      originWidth: selectedShape.width,
      originHeight: selectedShape.height,
      originRotation: selectedShape.rotation,
      originAngle: 0,
    };
  };

  const handleShapeOverlayDragStart = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!selectedShape) return;

    dragShapeRef.current = {
      mode: "drag",
      index: selectedShape.index,
      startX: event.clientX,
      startY: event.clientY,
      originX: selectedShape.x,
      originY: selectedShape.y,
      originWidth: selectedShape.width,
      originHeight: selectedShape.height,
      originRotation: selectedShape.rotation,
      originAngle: 0,
    };
  };

  const handleShapeRotateStart = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!selectedShape) return;

    const shape = getShapeElement(selectedShape);
    if (!shape) return;
    const rect = shape.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    dragShapeRef.current = {
      mode: "rotate",
      index: selectedShape.index,
      startX: event.clientX,
      startY: event.clientY,
      originX: selectedShape.x,
      originY: selectedShape.y,
      originWidth: selectedShape.width,
      originHeight: selectedShape.height,
      originRotation: selectedShape.rotation,
      originAngle: getAngleFromCenter(centerX, centerY, event.clientX, event.clientY),
    };
  };

  const updateImageFromIndex = (
    index: number,
    updater: (currentState: SelectedImageState) => SelectedImageState,
  ) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const images = Array.from(editor.root.querySelectorAll("img"));
    const image = images[index] as HTMLImageElement | undefined;
    if (!image) return;

    applyImageState(updater(readImageState(image)));
  };

  const updateShapeFromIndex = (
    index: number,
    updater: (currentState: SelectedShapeState) => SelectedShapeState,
  ) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const shapes = Array.from(editor.root.querySelectorAll(".document-shape-embed"));
    const shape = shapes[index] as HTMLElement | undefined;
    if (!shape) return;

    applyShapeState(updater(readShapeState(shape)));
  };

  const handleSourceFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSourceLoadError(null);
    setPendingSourceFile(file);
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    formik.setFieldValue("fileType", extension);
    formik.setFieldValue("originalFileName", file.name);
    if (formik.values.documentFormat === "xlsx") {
      setSourcePreviewLoading(true);
      void readXlsxPreview(file).then(setXlsxPreview).catch(() => setXlsxPreview(null)).finally(() => setSourcePreviewLoading(false));
      setPdfSourceBlob(null);
    } else if (formik.values.documentFormat === "docx") {
      setPdfSourceBlob(null);
      setXlsxPreview(null);
      setSourcePreviewLoading(false);
    } else {
      setPdfSourceBlob(file);
      setXlsxPreview(null);
      setSourcePreviewLoading(false);
    }
    if (event.target) event.target.value = "";
  };

  const goToBuilder = async () => {
    const errors = await formik.validateForm();
    formik.setTouched({ name: true, docType: true, documentFormat: true, status: true });
    if (errors.name || errors.docType || errors.documentFormat || errors.status) return;
    setSearchParams({ step: "builder" });
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {isEdit ? t("Edit Document") : isBuilderStep ? t("Create Document") : t("Document Setup")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/settings`}>{t("Settings")}</Link>
            <Link to={`/${role}/documents`}>{t("Documents")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : isBuilderStep ? t("Builder") : t("Setup")}</Typography>
          </Breadcrumbs>
        </Box>

        <Box className="flex flex-wrap items-center gap-2">
          {!isEdit && isBuilderStep && (
            <Button variant="text" color="grey" startIcon={<NiArrowLeft size="medium" />} onClick={() => setSearchParams({})}>
              {t("Back")}
            </Button>
          )}
          <Button variant="text" color="grey" startIcon={<NiArrowLeft size="medium" />} onClick={() => navigate(`/${role}/documents`)}>
            {t("Back to List")}
          </Button>
        </Box>
      </Box>

      {loadError && (
        <Alert severity="error" className="mb-4">
          {t(loadError)}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        {!isBuilderStep ? (
          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Typography variant="h6">{t("Basic Information")}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t("Start with title, type, and status. Builder opens next.")}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label={t("Document Title")}
                    value={formik.values.name || ""}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    select
                    id="docType"
                    name="docType"
                    label={t("Document Type")}
                    value={formik.values.docType || "other"}
                    onChange={formik.handleChange}
                    error={formik.touched.docType && Boolean(formik.errors.docType)}
                    helperText={formik.touched.docType && formik.errors.docType}
                  >
                    {DOCUMENT_TYPES.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {t(item.label)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    select
                    id="status"
                    name="status"
                    label={t("Status")}
                    value={formik.values.status || "draft"}
                    onChange={formik.handleChange}
                    error={formik.touched.status && Boolean(formik.errors.status)}
                    helperText={formik.touched.status && formik.errors.status}
                  >
                    {DOCUMENT_STATUSES.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {t(item.label)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField
                    fullWidth
                    select
                    id="documentFormat"
                    name="documentFormat"
                    label={t("Document Format")}
                    value={formik.values.documentFormat || "html"}
                    onChange={formik.handleChange}
                    error={formik.touched.documentFormat && Boolean(formik.errors.documentFormat)}
                    helperText={formik.touched.documentFormat && formik.errors.documentFormat}
                  >
                    {DOCUMENT_FORMATS.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {t(item.label)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={12}>
                  <Alert severity={isSpecialFormat ? "info" : "success"}>
                    {isPdfFormat
                      ? t("PDF layout mode lets you upload a PDF, preview it, place variables visually, and style text before printing.")
                      : isXlsxFormat
                      ? t("XLSX mode uses a real Excel template. Put variables inside the XLSX file, upload it here, preview the first sheet, and student download will stay XLSX.")
                      : isFillablePdfFormat
                      ? t("Fillable PDF mode uses a PDF with named form fields like {{name_en}}. Upload it here and student download will stay PDF with fields filled automatically.")
                      : isDocxFormat
                      ? t("DOCX mode uses a real Word template. Put variables like {{name_en}} inside the Word file, upload it here, and student download will stay DOCX with replaced values.")
                      : t("Rich Document mode keeps the current visual builder, custom fonts, colors, and PDF output.")}
                  </Alert>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth select label={t("Paper Size")} value={pageSettings.preset} onChange={(event) => handlePagePresetChange(event.target.value as DocumentPageSettings["preset"])}>
                    {PAGE_PRESETS.map((preset) => (
                      <MenuItem key={preset} value={preset}>{preset}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth select label={t("Orientation")} value={pageSettings.orientation} onChange={(event) => handleOrientationChange(event.target.value as DocumentPageSettings["orientation"])}>
                    {PAGE_ORIENTATIONS.map((orientation) => (
                      <MenuItem key={orientation} value={orientation}>{t(orientation)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControlLabel
                    control={<Switch checked={Boolean(formik.values.isActive)} onChange={(event) => formik.setFieldValue("isActive", event.target.checked)} />}
                    label={t("Active")}
                  />
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <Box className="flex justify-end gap-2 p-4">
              <Button color="grey" onClick={() => navigate(`/${role}/documents`)}>
                {t("Cancel")}
              </Button>
              <Button variant="surface" color="primary" startIcon={<NiMagicWand size="medium" />} onClick={goToBuilder}>
                {t("Open Builder")}
              </Button>
            </Box>
          </Card>
        ) : (
          <Card className="rounded-xl shadow-sm">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }} className="p-4">
              <Grid container spacing={2} alignItems="center" className="mb-3">
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField fullWidth size="small" label={t("Title")} name="name" value={formik.values.name || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField fullWidth size="small" select label={t("Type")} name="docType" value={formik.values.docType || "other"} onChange={formik.handleChange}>
                    {DOCUMENT_TYPES.map((item) => (
                      <MenuItem key={item.value} value={item.value}>{t(item.label)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField fullWidth size="small" select label={t("Format")} name="documentFormat" value={formik.values.documentFormat || "html"} onChange={formik.handleChange}>
                    {DOCUMENT_FORMATS.map((item) => (
                      <MenuItem key={item.value} value={item.value}>{t(item.label)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                  <TextField fullWidth size="small" select label={t("Status")} name="status" value={formik.values.status || "draft"} onChange={formik.handleChange}>
                    {DOCUMENT_STATUSES.map((item) => (
                      <MenuItem key={item.value} value={item.value}>{t(item.label)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box className="flex justify-end gap-2">
                    <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
                      {loading ? t("Saving...") : t("Save Document")}
                    </Button>
                  </Box>
                </Grid>
              </Grid>

            </Box>

            <CardContent>
              <Box className="mb-4 flex flex-wrap gap-2">
                <Chip label={`${pageSettings.preset} / ${pageSettings.orientation}`} size="small" variant="outlined" />
                <Chip label={t(isPdfFormat ? "PDF Layout Builder" : isXlsxFormat ? "XLSX Template" : isFillablePdfFormat ? "Fillable PDF" : isDocxFormat ? "DOCX Template" : "Rich Document / PDF")} size="small" variant="outlined" color={isSpecialFormat ? "info" : "default"} />
                {!isSpecialFormat && <Chip label={`${usedVariables.length} ${t("variables used")}`} size="small" variant="outlined" color="warning" />}
                {formik.values.docType === "student" && <Chip label={t("Student variable mode")} size="small" color="primary" variant="outlined" />}
                {selectedImage && <Chip label={t("Image Selected")} size="small" color="secondary" variant="outlined" onClick={() => setImageDialogOpen(true)} />}
                {selectedShape && <Chip label={t("Shape Selected")} size="small" color="info" variant="outlined" onClick={() => setShapeDialogOpen(true)} />}
              </Box>

              {isPdfFormat ? (
                <Box className="space-y-4">
                  <Alert severity="info">
                    {t("Upload your PDF file, preview first page here, add variables or custom text, drag them where you want, then style font, size, color, and background.")}
                  </Alert>
                  {sourceLoadError && <Alert severity="warning">{t(sourceLoadError === "Source file not found." ? "Saved source file is missing on server. Please upload the PDF again and save." : sourceLoadError)}</Alert>}
                  <Card variant="outlined">
                    <CardContent>
                      <Box className="space-y-4">
                        <Box>
                          <Typography variant="h6">{t("PDF Source File")}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {pendingSourceFile?.name || formik.values.originalFileName || t("No source file selected yet")}
                          </Typography>
                          <Box className="mt-3 flex flex-wrap gap-2">
                            <Button size="small" variant="surface" color="grey" onClick={() => sourceUploadInputRef.current?.click()}>
                              {t("Choose PDF")}
                            </Button>
                            <Button size="small" variant="surface" color="grey" startIcon={<NiKnobs size="medium" />} onClick={() => setPaperDialogOpen(true)}>
                              {t("Paper Setup")}
                            </Button>
                            <Button size="small" variant="surface" color="grey" startIcon={<NiClipboard size="medium" />} onClick={() => setVariableDialogOpen(true)}>
                              {t("Open Variable Modal")}
                            </Button>
                            <Button size="small" variant="surface" color="grey" onClick={addPdfText}>
                              {t("Add Text Box")}
                            </Button>
                            <Button size="small" variant="surface" color="grey" onClick={() => fontUploadInputRef.current?.click()}>
                              {t("Upload Custom Font")}
                            </Button>
                            {isEdit && id && formik.values.originalFileName && (
                              <Button size="small" variant="surface" color="primary" onClick={() => void DocumentService.downloadTemplateSource(id, formik.values.originalFileName)}>
                                {t("Download Source")}
                              </Button>
                            )}
                          </Box>
                          <Card variant="outlined" sx={{ borderRadius: 4, mt: 3 }}>
                            <CardContent className="space-y-3">
                              <Typography variant="h6">{t("Precision Tools")}</Typography>
                              <Box className="px-2">
                                <Typography variant="body2" className="mb-2">{t("Zoom")}: {Math.round(pdfCanvasZoom * 100)}%</Typography>
                                <Slider
                                  value={Math.round(pdfCanvasZoom * 100)}
                                  min={50}
                                  max={250}
                                  step={5}
                                  onChange={(_event, value) => setPdfCanvasZoom((Array.isArray(value) ? value[0] : value) / 100)}
                                  valueLabelDisplay="auto"
                                />
                              </Box>
                              <Box className="flex flex-wrap gap-x-6 gap-y-1">
                                <FormControlLabel control={<Switch checked={pdfShowGrid} onChange={(event) => setPdfShowGrid(event.target.checked)} />} label={t("Show Grid")} />
                                <FormControlLabel control={<Switch checked={pdfShowGuides} onChange={(event) => setPdfShowGuides(event.target.checked)} />} label={t("Show Print Guides")} />
                                <FormControlLabel control={<Switch checked={pdfShowRulers} onChange={(event) => setPdfShowRulers(event.target.checked)} />} label={t("Show Rulers")} />
                                <FormControlLabel control={<Switch checked={pdfSnapToGrid} onChange={(event) => setPdfSnapToGrid(event.target.checked)} />} label={t("Snap To Grid")} />
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {t("Uploaded custom fonts are embedded as data URLs, so preview and print use the same uploaded font source.")}
                              </Typography>
                              <Alert severity="success">
                                {t("Green guide box is print-safe area based on current page margins. Use zoom plus X/Y for pixel-perfect placement.")}
                              </Alert>
                            </CardContent>
                          </Card>
                        </Box>
                        <input
                          ref={fontUploadInputRef}
                          type="file"
                          accept={FONT_UPLOAD_ACCEPT}
                          onChange={handleFontUpload}
                          style={{ display: "none" }}
                        />
                        <Box sx={{ display: 'block' }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            {sourcePreviewLoading ? (
                              <Box className="rounded-2xl border border-divider bg-slate-50 p-10 text-center">
                                <Typography variant="body1">{t("Loading PDF preview...")}</Typography>
                              </Box>
                            ) : (
                              <AiTemplateCanvas
                                editable
                                items={aiItems}
                                selectedItemId={selectedAiItemId}
                                sourceBlob={pdfSourceBlob}
                                pageWidthMm={pageSettings.widthMm}
                                pageHeightMm={pageSettings.heightMm}
                                pageUnit={paperSizeUnit}
                                marginTopMm={pageSettings.marginTopMm}
                                marginRightMm={pageSettings.marginRightMm}
                                marginBottomMm={pageSettings.marginBottomMm}
                                marginLeftMm={pageSettings.marginLeftMm}
                                zoom={pdfCanvasZoom}
                                showGrid={pdfShowGrid}
                                showGuides={pdfShowGuides}
                                showRulers={pdfShowRulers}
                                snapToGrid={pdfSnapToGrid}
                                onItemSelect={setSelectedAiItemId}
                                onItemsChange={setAiItems}
                              />
                            )}
                          </Box>
                        </Box>
                        <Card variant="outlined" sx={{ borderRadius: 4, mt: 3 }}>
                            <CardContent className="space-y-3">
                              <Typography variant="h6">{t("Selected Item Style")}</Typography>
                              {!selectedPdfItem ? (
                                <Typography variant="body2" color="text.secondary">
                                  {t("Select a text or variable box from PDF preview first.")}
                                </Typography>
                              ) : (
                                <>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label={t("Text / Variable")}
                                    value={selectedPdfItem.value}
                                    onChange={(event) => updateSelectedPdfItem({ value: event.target.value })}
                                    helperText={t("Double click item on canvas for direct inline editing too.")}
                                  />
                                  <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                      <ClearableNumberField
                                        fullWidth
                                        size="small"
                                        label={t("X %")}
                                        value={selectedPdfItem.x}
                                        fallbackValue={10}
                                        normalize={(value) => Math.max(0, Math.min(96, value))}
                                        onCommit={(value) => updateSelectedPdfItem({ x: value })}
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                      <ClearableNumberField
                                        fullWidth
                                        size="small"
                                        label={t("Y %")}
                                        value={selectedPdfItem.y}
                                        fallbackValue={10}
                                        normalize={(value) => Math.max(0, Math.min(98, value))}
                                        onCommit={(value) => updateSelectedPdfItem({ y: value })}
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                      <ClearableNumberField
                                        fullWidth
                                        size="small"
                                        label={t("Width %")}
                                        value={selectedPdfItem.width}
                                        fallbackValue={24}
                                        normalize={(value) => Math.max(8, Math.min(100, value))}
                                        onCommit={(value) => updateSelectedPdfItem({ width: value })}
                                      />
                                    </Grid>
                                  </Grid>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    select
                                    label={t("Font Family")}
                                    value={selectedPdfItem.fontFamily}
                                    onChange={(event) => updateSelectedPdfItem({ fontFamily: event.target.value })}
                                  >
                                    {availableFonts.map((font) => (
                                      <MenuItem key={font.value} value={font.value} sx={{ fontFamily: font.value }}>
                                        {font.label}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                  <ClearableNumberField
                                    fullWidth
                                    size="small"
                                    label={t("Font Size")}
                                    value={selectedPdfItem.fontSize}
                                    fallbackValue={20}
                                    normalize={(value) => Math.max(8, value)}
                                    onCommit={(value) => updateSelectedPdfItem({ fontSize: value })}
                                  />
                                  <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                      <ClearableNumberField
                                        fullWidth
                                        size="small"
                                        label={t("Line Height")}
                                        value={selectedPdfItem.lineHeight}
                                        fallbackValue={1.3}
                                        normalize={(value) => Math.max(0.8, Math.min(3, Number(value.toFixed(2))))}
                                        onCommit={(value) => updateSelectedPdfItem({ lineHeight: value })}
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                      <ClearableNumberField
                                        fullWidth
                                        size="small"
                                        label={t("Letter Spacing")}
                                        value={selectedPdfItem.letterSpacing}
                                        fallbackValue={0}
                                        normalize={(value) => Math.max(-4, Math.min(20, value))}
                                        onCommit={(value) => updateSelectedPdfItem({ letterSpacing: value })}
                                      />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }}>
                                      <TextField
                                        fullWidth
                                        size="small"
                                        select
                                        label={t("Align")}
                                        value={selectedPdfItem.textAlign}
                                        onChange={(event) => updateSelectedPdfItem({ textAlign: event.target.value as AiTemplateItem["textAlign"] })}
                                      >
                                        <MenuItem value="left">{t("Left")}</MenuItem>
                                        <MenuItem value="center">{t("Center")}</MenuItem>
                                        <MenuItem value="right">{t("Right")}</MenuItem>
                                      </TextField>
                                    </Grid>
                                  </Grid>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label={t("Text Color Hex")}
                                    value={selectedPdfItem.color}
                                    onChange={(event) => updateSelectedPdfItem({ color: event.target.value })}
                                    InputProps={{
                                      startAdornment: <InputAdornment position="start"><Box component="span" sx={{ width: 18, height: 18, borderRadius: "6px", bgcolor: selectedPdfItem.color, border: "1px solid", borderColor: "divider", display: "inline-block" }} /></InputAdornment>,
                                    }}
                                  />
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="color"
                                    label={t("Pick Text Color")}
                                    value={selectedPdfItem.color}
                                    onChange={(event) => updateSelectedPdfItem({ color: event.target.value })}
                                  />
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label={t("Background Hex")}
                                    value={selectedPdfItem.backgroundColor === "transparent" ? "" : selectedPdfItem.backgroundColor}
                                    onChange={(event) => updateSelectedPdfItem({ backgroundColor: event.target.value || "transparent" })}
                                    placeholder="#FFFFFF or empty"
                                  />
                                  <TextField
                                    fullWidth
                                    size="small"
                                    type="color"
                                    label={t("Pick Background Color")}
                                    value={selectedPdfItem.backgroundColor === "transparent" ? "#ffffff" : selectedPdfItem.backgroundColor}
                                    onChange={(event) => updateSelectedPdfItem({ backgroundColor: event.target.value })}
                                  />
                                  <ClearableNumberField
                                    fullWidth
                                    size="small"
                                    label={t("Font Weight")}
                                    value={selectedPdfItem.fontWeight}
                                    fallbackValue={600}
                                    normalize={(value) => Math.max(300, Math.min(800, Math.round(value)))}
                                    onCommit={(value) => updateSelectedPdfItem({ fontWeight: value })}
                                  />
                                  <FormControlLabel
                                    control={<Switch checked={selectedPdfItem.locked} onChange={(event) => updateSelectedPdfItem({ locked: event.target.checked })} />}
                                    label={t("Lock Element")}
                                  />
                                  <Button fullWidth size="small" color="error" variant="text" startIcon={<NiBinEmpty size="small" />} onClick={removeSelectedPdfItem}>
                                    {t("Remove Selected")}
                                  </Button>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        <input
                          ref={sourceUploadInputRef}
                          type="file"
                          accept="application/pdf,.pdf"
                          onChange={handleSourceFileSelect}
                          style={{ display: "none" }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ) : isXlsxFormat ? (
                <Box className="space-y-4">
                  <Alert severity="info">
                    {t("Use an XLSX template that already contains variables like {{student_name}} in cells. Upload it here, preview first sheet, then student download keeps the file as XLSX with replaced values.")}
                  </Alert>
                  {sourceLoadError && <Alert severity="warning">{t(sourceLoadError === "Source file not found." ? "Saved source file is missing on server. Please upload the XLSX again and save." : sourceLoadError)}</Alert>}
                  <Card variant="outlined">
                    <CardContent className="space-y-4">
                      <Box className="flex flex-wrap items-center gap-2">
                        <Button size="small" variant="surface" color="grey" onClick={() => sourceUploadInputRef.current?.click()}>
                          {t("Choose XLSX")}
                        </Button>
                        <Button size="small" variant="surface" color="grey" startIcon={<NiKnobs size="medium" />} onClick={() => setPaperDialogOpen(true)}>
                          {t("Paper Setup")}
                        </Button>
                        <Button size="small" variant="surface" color="grey" startIcon={<NiClipboard size="medium" />} onClick={() => setVariableDialogOpen(true)}>
                          {t("Open Variable Modal")}
                        </Button>
                        {isEdit && id && formik.values.originalFileName && (
                          <Button size="small" variant="surface" color="primary" onClick={() => void DocumentService.downloadTemplateSource(id, formik.values.originalFileName)}>
                            {t("Download Source")}
                          </Button>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {pendingSourceFile?.name || formik.values.originalFileName || t("No XLSX source file selected yet")}
                      </Typography>
                      <input
                        ref={sourceUploadInputRef}
                        type="file"
                        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                        onChange={handleSourceFileSelect}
                        style={{ display: "none" }}
                      />
                      <Card variant="outlined" sx={{ borderRadius: 4 }}>
                        <CardContent className="space-y-3">
                          <Typography variant="h6">{t("First Sheet Preview")}</Typography>
                          {sourcePreviewLoading ? (
                            <Typography variant="body2" color="text.secondary">{t("Loading XLSX preview...")}</Typography>
                          ) : !xlsxPreview ? (
                            <Typography variant="body2" color="text.secondary">{t("Upload XLSX to preview first sheet here.")}</Typography>
                          ) : (
                            <>
                              <Chip label={xlsxPreview.name} size="small" variant="outlined" />
                              <XlsxPreviewTable sheet={xlsxPreview} />
                            </>
                          )}
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </Box>
              ) : isFillablePdfFormat ? (
                <Box className="space-y-4">
                  <Alert severity="info">
                    {t("Use a fillable PDF that already contains named form fields like {{name_en}}. Upload it here. We will read field names as variables and generate a filled PDF for student documents.")}
                  </Alert>
                  {sourceLoadError && <Alert severity="warning">{t(sourceLoadError === "Source file not found." ? "Saved source file is missing on server. Please upload the fillable PDF again and save." : sourceLoadError)}</Alert>}
                  <Card variant="outlined">
                    <CardContent className="space-y-4">
                      <Box className="flex flex-wrap items-center gap-2">
                        <Button size="small" variant="surface" color="grey" onClick={() => sourceUploadInputRef.current?.click()}>
                          {t("Choose Fillable PDF")}
                        </Button>
                        <Button size="small" variant="surface" color="grey" startIcon={<NiClipboard size="medium" />} onClick={() => setVariableDialogOpen(true)}>
                          {t("Open Variable Modal")}
                        </Button>
                        {isEdit && id && formik.values.originalFileName && (
                          <Button size="small" variant="surface" color="primary" onClick={() => void DocumentService.downloadTemplateSource(id, formik.values.originalFileName)}>
                            {t("Download Source")}
                          </Button>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {pendingSourceFile?.name || formik.values.originalFileName || t("No fillable PDF source file selected yet")}
                      </Typography>
                      <input
                        ref={sourceUploadInputRef}
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handleSourceFileSelect}
                        style={{ display: "none" }}
                      />
                      <Card variant="outlined" sx={{ borderRadius: 4 }}>
                        <CardContent className="space-y-3">
                          <Typography variant="h6">{t("PDF Preview")}</Typography>
                          {sourcePreviewLoading ? (
                            <Typography variant="body2" color="text.secondary">{t("Loading PDF preview...")}</Typography>
                          ) : !pdfSourceBlob ? (
                            <Typography variant="body2" color="text.secondary">{t("Upload fillable PDF to preview first page here.")}</Typography>
                          ) : (
                            <AiTemplateCanvas
                              items={[]}
                              sourceBlob={pdfSourceBlob}
                              pageWidthMm={pageSettings.widthMm}
                              pageHeightMm={pageSettings.heightMm}
                              pageUnit={paperSizeUnit}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </Box>
              ) : isDocxFormat ? (
                <Box className="space-y-4">
                  <Alert severity="info">
                    {t("Use a DOCX Word template that already contains variables like {{name_en}}. Upload it here. We will replace those variables and generate a DOCX download for student documents.")}
                  </Alert>
                  {sourceLoadError && <Alert severity="warning">{t(sourceLoadError === "Source file not found." ? "Saved source file is missing on server. Please upload the DOCX again and save." : sourceLoadError)}</Alert>}
                  <Card variant="outlined">
                    <CardContent className="space-y-4">
                      <Box className="flex flex-wrap items-center gap-2">
                        <Button size="small" variant="surface" color="grey" onClick={() => sourceUploadInputRef.current?.click()}>
                          {t("Choose DOCX")}
                        </Button>
                        <Button size="small" variant="surface" color="grey" startIcon={<NiClipboard size="medium" />} onClick={() => setVariableDialogOpen(true)}>
                          {t("Open Variable Modal")}
                        </Button>
                        {isEdit && id && formik.values.originalFileName && (
                          <Button size="small" variant="surface" color="primary" onClick={() => void DocumentService.downloadTemplateSource(id, formik.values.originalFileName)}>
                            {t("Download Source")}
                          </Button>
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {pendingSourceFile?.name || formik.values.originalFileName || t("No DOCX source file selected yet")}
                      </Typography>
                      <input
                        ref={sourceUploadInputRef}
                        type="file"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleSourceFileSelect}
                        style={{ display: "none" }}
                      />
                      <Card variant="outlined" sx={{ borderRadius: 4 }}>
                        <CardContent className="space-y-3">
                          <Typography variant="h6">{t("Word Template")}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t("Preview not shown here. Save document after upload, then used variables will come from the uploaded DOCX template fields/placeholders.")}
                          </Typography>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </Box>
              ) : (
              <>
              <Box
                className="mb-4 space-y-3 rounded-xl p-3"
                sx={{
                  position: "sticky",
                  top: 12,
                  zIndex: 20,
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)",
                }}
              >
                <Box className="flex flex-wrap items-center gap-2">
                  <TextField
                    size="small"
                    select
                    label={t("Font")}
                    value={fontFamily}
                    onChange={(event) => applyFontFamily(event.target.value)}
                    sx={{ width: 180 }}
                  >
                    {availableFonts.map((font) => (
                      <MenuItem key={font.value} value={font.value} sx={{ fontFamily: font.value }}>
                        {font.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button size="small" variant="surface" color="grey" onClick={() => fontUploadInputRef.current?.click()}>
                    {t("Upload Font")}
                  </Button>
                  <input
                    ref={fontUploadInputRef}
                    type="file"
                    accept={FONT_UPLOAD_ACCEPT}
                    onChange={handleFontUpload}
                    style={{ display: "none" }}
                  />
                  <input
                    ref={backgroundImageInputRef}
                    type="file"
                    accept={IMAGE_UPLOAD_ACCEPT}
                    onChange={handleBackgroundImageUpload}
                    style={{ display: "none" }}
                  />
                  <TextField
                    size="small"
                    select
                    label={t("Text Size")}
                    value={getFontSizeSelectValue(fontSizePx)}
                    onChange={(event) => {
                      if (event.target.value === "custom") return;
                      applyFontSize(event.target.value.replace("px", ""));
                    }}
                    sx={{ width: 128 }}
                  >
                    {FONT_SIZE_OPTIONS.map((size) => (
                      <MenuItem key={size} value={size}>{size}</MenuItem>
                    ))}
                    <MenuItem value="custom">{t("Custom")}</MenuItem>
                  </TextField>
                  <TextField
                    size="small"
                    type="number"
                    label={t("PX")}
                    value={fontSizePx}
                    onChange={(event) => setFontSizePx(event.target.value)}
                    onBlur={() => applyFontSize(fontSizePx)}
                    sx={{ width: 104 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">px</InputAdornment>,
                    }}
                  />
                  <Button size="small" variant="surface" color="grey" startIcon={<NiKnobs size="medium" />} onClick={() => setPaperDialogOpen(true)}>
                    {t("Paper")}
                  </Button>
                  <Button size="small" variant="surface" color="grey" startIcon={<NiClipboard size="medium" />} onClick={() => setVariableDialogOpen(true)}>
                    {t("Variables")}
                  </Button>
                  <Button size="small" variant="surface" color="grey" onClick={() => backgroundImageInputRef.current?.click()}>
                    {t("Background Image")}
                  </Button>
                  {formik.values.backgroundImageUrl && (
                    <Button size="small" variant="text" color="error" onClick={() => formik.setFieldValue("backgroundImageUrl", "")}>
                      {t("Clear Background")}
                    </Button>
                  )}
                  <Button size="small" variant="surface" color="grey" startIcon={<NiSquare size="medium" />} onClick={() => insertShape("square")}>
                    {t("Shape")}
                  </Button>
                  <Button size="small" variant="surface" color="grey" startIcon={<NiMinusSquare size="medium" />} onClick={() => insertShape("line")}>
                    {t("Line")}
                  </Button>
                  <Button size="small" variant="outlined" color="grey" onClick={() => setCanvasZoom((current) => Math.max(0.5, Number((current - 0.1).toFixed(2))))}>
                    -
                  </Button>
                  <Chip label={`${Math.round(currentCanvasZoom * 100)}%`} size="small" />
                  <Button size="small" variant="outlined" color="grey" onClick={() => setCanvasZoom((current) => Math.min(1.5, Number((current + 0.1).toFixed(2))))}>
                    +
                  </Button>
                  <Button size="small" variant="text" color="grey" onClick={() => setCanvasZoom(fitZoom)}>
                    {t("Fit")}
                  </Button>
                </Box>

                <Box
                  ref={toolbarHostRef}
                  className="rounded-xl p-2"
                  sx={{
                    minHeight: 72,
                    backgroundColor: theme.palette.action.hover,
                    "& .ql-toolbar.ql-snow": {
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 1,
                      p: 0,
                      border: "none",
                      backgroundColor: "transparent",
                      boxShadow: "none",
                    },
                    "& .ql-toolbar.ql-snow .ql-formats": {
                      mr: "0 !important",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      px: 1,
                      py: 0.75,
                      borderRadius: 2,
                      backgroundColor: theme.palette.background.paper,
                    },
                    "& .ql-toolbar.ql-snow button, & .ql-toolbar.ql-snow .ql-picker-label": {
                      color: theme.palette.text.primary,
                    },
                    "& .ql-toolbar.ql-snow .ql-stroke": {
                      stroke: theme.palette.text.primary,
                    },
                    "& .ql-toolbar.ql-snow .ql-fill": {
                      fill: theme.palette.text.primary,
                    },
                    "& .ql-toolbar.ql-snow button:hover, & .ql-toolbar.ql-snow button.ql-active": {
                      color: theme.palette.primary.main,
                      backgroundColor: theme.palette.action.hover,
                    },
                    "& .ql-toolbar.ql-snow button:hover .ql-stroke, & .ql-toolbar.ql-snow button.ql-active .ql-stroke": {
                      stroke: theme.palette.primary.main,
                    },
                    "& .ql-toolbar.ql-snow button:hover .ql-fill, & .ql-toolbar.ql-snow button.ql-active .ql-fill": {
                      fill: theme.palette.primary.main,
                    },
                    "& .ql-toolbar.ql-snow .ql-picker.ql-header": {
                      width: "auto",
                      minWidth: 104,
                    },
                    "& .ql-toolbar.ql-snow .ql-picker-label": {
                      px: 1.25,
                      py: 0.75,
                      fontSize: 14,
                    },
                    "& .ql-picker-options": {
                      zIndex: 30,
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      borderColor: theme.palette.divider,
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  height: { xs: "82vh", lg: "calc(100vh - 170px)" },
                  position: "relative",
                }}
              >
                {(selectedImage || selectedShape) && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      zIndex: 12,
                      width: 156,
                      pointerEvents: "none",
                      display: { xs: "none", lg: "block" },
                    }}
                  >
                    <Card className="rounded-xl shadow-sm" sx={{ pointerEvents: "auto" }}>
                      <CardContent className="space-y-2 p-2!">
                        {selectedImage && (
                          <>
                            <Chip label={t("Image")} color="secondary" size="small" />
                            <Box className="flex gap-1">
                              <Button size="small" fullWidth variant={selectedImage.positionMode === "flow" ? "contained" : "outlined"} onClick={() => applyImageState({ ...selectedImage, positionMode: "flow" })}>
                                {t("Flow")}
                              </Button>
                              <Button size="small" fullWidth variant={selectedImage.positionMode === "absolute" ? "contained" : "outlined"} onClick={() => applyImageState({ ...selectedImage, positionMode: "absolute" })}>
                                {t("Abs")}
                              </Button>
                            </Box>
                            <ClearableNumberField fullWidth size="small" label={t("Width")} value={selectedImage.width} fallbackValue={40} normalize={(value) => Math.max(40, value)} onCommit={(value) => applyImageState({ ...selectedImage, width: value })} />
                            <ClearableNumberField fullWidth size="small" label={t("Opacity")} value={Math.round(selectedImage.opacity * 100)} fallbackValue={100} normalize={(value) => Math.max(5, Math.min(100, Math.round(value)))} onCommit={(value) => applyImageState({ ...selectedImage, opacity: value / 100 })} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                            <Button fullWidth size="small" variant="surface" color="grey" onClick={() => setImageDialogOpen(true)}>{t("Image Controls")}</Button>
                            <Button fullWidth size="small" color="error" variant="text" startIcon={<NiBinEmpty size="small" />} onClick={removeSelectedImage}>{t("Remove")}</Button>
                          </>
                        )}
                        {selectedShape && (
                          <>
                            <Chip label={t(selectedShape.shape)} color="info" size="small" />
                            <ClearableNumberField fullWidth size="small" label={t("Width")} value={selectedShape.width} fallbackValue={20} normalize={(value) => Math.max(20, value)} onCommit={(value) => applyShapeState({ ...selectedShape, width: value })} />
                            <ClearableNumberField fullWidth size="small" label={t(selectedShape.shape === "line" ? "Thickness" : "Height")} value={selectedShape.height} fallbackValue={20} normalize={(value) => Math.max(20, value)} onCommit={(value) => applyShapeState({ ...selectedShape, height: value })} />
                            <ClearableNumberField fullWidth size="small" label={t("Opacity")} value={Math.round(selectedShape.opacity * 100)} fallbackValue={100} normalize={(value) => Math.max(5, Math.min(100, Math.round(value)))} onCommit={(value) => applyShapeState({ ...selectedShape, opacity: value / 100 })} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                            <Button fullWidth size="small" variant="surface" color="grey" onClick={() => setShapeDialogOpen(true)}>{t("Shape Controls")}</Button>
                            <Button fullWidth size="small" color="error" variant="text" startIcon={<NiBinEmpty size="small" />} onClick={removeSelectedShape}>{t("Remove")}</Button>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                )}

                <Box
                  ref={previewViewportRef}
                  className="overflow-auto rounded-xl bg-grey-50 p-3"
                  sx={{
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      width: `calc(${pageCssValue(pageSettings.widthMm, paperSizeUnit)} * ${currentCanvasZoom})`,
                      height: `calc(${pageCssValue(pageSettings.heightMm, paperSizeUnit)} * ${currentCanvasZoom})`,
                      mx: "auto",
                      position: "relative",
                    }}
                  >
                    <Box
                      ref={pageCanvasRef}
                      onMouseDownCapture={handleEditorMouseDownCapture}
                      sx={{
                        width: pageCssValue(pageSettings.widthMm, paperSizeUnit),
                        minHeight: pageCssValue(pageSettings.heightMm, paperSizeUnit),
                        position: "absolute",
                        inset: 0,
                        transform: `scale(${currentCanvasZoom})`,
                        transformOrigin: "top left",
                        backgroundColor: "#fff",
                        backgroundImage: formik.values.backgroundImageUrl ? `url(${formik.values.backgroundImageUrl})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "12px",
                        boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
                        p: `${pageCssValue(pageSettings.marginTopMm, paperSizeUnit)} ${pageCssValue(pageSettings.marginRightMm, paperSizeUnit)} ${pageCssValue(pageSettings.marginBottomMm, paperSizeUnit)} ${pageCssValue(pageSettings.marginLeftMm, paperSizeUnit)}`,
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const variable = event.dataTransfer.getData("text/plain");
                        if (variable) {
                          void copyVariable(variable);
                        }
                      }}
                      onDragOver={(event) => event.preventDefault()}
                    >
                    <Box
                      sx={{
                        "& .ql-container.ql-snow": {
                          border: "none",
                        },
                        "& .ql-editor": {
                          minHeight: 820,
                          padding: 0,
                          color: "#000000",
                          position: "relative",
                        },
                        "& .ql-editor .document-shape-embed": {
                          cursor: "grab",
                        },
                        "& .ql-editor img": {
                          borderRadius: 4,
                          maxWidth: "100%",
                        },
                        "& .ql-editor img:hover": {
                          outline: `2px solid ${theme.palette.primary.main}`,
                          outlineOffset: 2,
                        },
                        "& .ql-editor p, & .ql-editor li, & .ql-editor h1, & .ql-editor h2, & .ql-editor h3, & .ql-editor h4, & .ql-editor h5, & .ql-editor h6, & .ql-editor blockquote": {
                          color: "#000000",
                        },
                        "& .ql-editor.ql-blank::before": {
                          color: theme.palette.text.disabled,
                        },
                      }}
                    >
                      <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={formik.values.templateContent || ""}
                        onChange={(value) => formik.setFieldValue("templateContent", value)}
                        modules={{
                          toolbar: [
                            [{ header: [1, 2, 3, false] }],
                            [{ align: "" }, { align: "center" }, { align: "right" }, { align: "justify" }],
                            ["bold", "italic", "strike", "underline"],
                            ["blockquote", "code-block", "code"],
                            [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
                            [{ script: "sub" }, { script: "super" }],
                            [{ indent: "-1" }, { indent: "+1" }],
                            [{ direction: "" }],
                            [{ color: [] }, { background: [] }],
                            ["table", "image", "video", "formula", "link"],
                            ["clean"],
                          ],
                        }}
                        formats={[
                          "header",
                          "font",
                          "size",
                          "align",
                          "bold",
                          "italic",
                          "strike",
                          "underline",
                          "blockquote",
                          "code-block",
                          "code",
                          "list",
                          "script",
                          "indent",
                          "direction",
                          "color",
                          "background",
                          "table",
                          "image",
                          "video",
                          "formula",
                          "link",
                          "document-shape",
                          "width",
                          "height",
                          "style",
                          "data-position-mode",
                          "data-x",
                          "data-y",
                          "data-opacity",
                        ]}
                        className="outlined document-editor"
                      />
                      {selectedImage && selectedImageFrame && (
                        <Box
                          onMouseDown={handleOverlayDragStart}
                          title={selectedImage.positionMode === "absolute" ? t("Drag to move image") : t("Set absolute mode to move image")}
                          sx={{
                            position: "absolute",
                            left: selectedImageFrame.left,
                            top: selectedImageFrame.top,
                            width: selectedImageFrame.width,
                            height: selectedImageFrame.height,
                            border: `2px solid ${theme.palette.primary.main}`,
                            borderRadius: 1,
                            pointerEvents: "auto",
                            zIndex: 8,
                            boxShadow: `0 0 0 1px ${theme.palette.common.white}`,
                            cursor: selectedImage.positionMode === "absolute" ? "move" : "default",
                            backgroundColor: "transparent",
                          }}
                        >
                          <Box
                            onMouseDown={handleResizeStart}
                            title={t("Drag to resize image")}
                            sx={{
                              position: "absolute",
                              right: -8,
                              bottom: -8,
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              backgroundColor: theme.palette.primary.main,
                              border: `2px solid ${theme.palette.common.white}`,
                              cursor: "nwse-resize",
                              pointerEvents: "auto",
                              boxShadow: theme.shadows[2],
                            }}
                          />
                        </Box>
                      )}
                      {selectedShape && selectedShapeFrame && (
                        <Box
                          onMouseDown={handleShapeOverlayDragStart}
                          title={t("Drag to move shape")}
                          sx={{
                            position: "absolute",
                            left: selectedShapeFrame.left,
                            top: selectedShapeFrame.top,
                            width: selectedShapeFrame.width,
                            height: selectedShapeFrame.height,
                            border: `2px solid ${theme.palette.info.main}`,
                            borderRadius: selectedShape.shape === "circle" ? "999px" : 1,
                            pointerEvents: "auto",
                            zIndex: 8,
                            boxShadow: `0 0 0 1px ${theme.palette.common.white}`,
                            cursor: "move",
                            backgroundColor: "transparent",
                          }}
                        >
                          <Box
                            onMouseDown={handleShapeResizeStart}
                            title={t("Drag to resize shape")}
                            sx={{
                              position: "absolute",
                              right: -8,
                              bottom: -8,
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              backgroundColor: theme.palette.info.main,
                              border: `2px solid ${theme.palette.common.white}`,
                              cursor: "nwse-resize",
                              pointerEvents: "auto",
                              boxShadow: theme.shadows[2],
                            }}
                          />
                          <Box
                            onMouseDown={handleShapeRotateStart}
                            title={t("Drag to rotate shape")}
                            sx={{
                              position: "absolute",
                              left: "50%",
                              bottom: -34,
                              transform: "translateX(-50%)",
                              width: 28,
                              height: 28,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "50%",
                              backgroundColor: theme.palette.background.paper,
                              border: `2px solid ${theme.palette.info.main}`,
                              color: theme.palette.info.main,
                              cursor: "grab",
                              pointerEvents: "auto",
                              boxShadow: theme.shadows[2],
                            }}
                          >
                            <NiRefresh size="small" />
                          </Box>
                        </Box>
                      )}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              </>
              )}

              <Box className="mt-4">
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  id="description"
                  name="description"
                  label={t("Internal Description")}
                  value={formik.values.description || ""}
                  onChange={formik.handleChange}
                />
              </Box>
            </CardContent>
          </Card>
        )}
      </form>

      <Dialog open={paperDialogOpen} onClose={() => setPaperDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box className="flex items-center justify-between">
            <Typography variant="h6">{t("Paper Setup")}</Typography>
            <IconButton size="small" onClick={() => setPaperDialogOpen(false)}>
              <NiCross size="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth select label={t("Paper Size")} value={pageSettings.preset} onChange={(event) => handlePagePresetChange(event.target.value as DocumentPageSettings["preset"])}>
                {PAGE_PRESETS.map((preset) => (
                  <MenuItem key={preset} value={preset}>{preset}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth select label={t("Orientation")} value={pageSettings.orientation} onChange={(event) => handleOrientationChange(event.target.value as DocumentPageSettings["orientation"])}>
                {PAGE_ORIENTATIONS.map((orientation) => (
                  <MenuItem key={orientation} value={orientation}>{t(orientation)}</MenuItem>
                ))}
              </TextField>
            </Grid>
            {pageSettings.preset !== "Custom" && (
              <Grid size={12}>
                <Alert severity="info">
                  {t("Choose Custom to set your own width and height, or just edit width/height below and it will switch to Custom automatically.")}
                </Alert>
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth select label={t("Size Unit")} value={paperSizeUnit} onChange={(event) => handlePageSizeUnitChange(event.target.value as DocumentPageUnit)}>
                {PAGE_SIZE_UNITS.map((unit) => (
                  <MenuItem key={unit} value={unit}>{unit}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ClearableNumberField fullWidth label={t(`Width (${paperSizeUnit})`)} value={pageSettings.widthMm} fallbackValue={pageSettings.widthMm} normalize={(value) => Math.max(0.0001, value)} onCommit={(value) => updatePageDimensionField("widthMm", value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ClearableNumberField fullWidth label={t(`Height (${paperSizeUnit})`)} value={pageSettings.heightMm} fallbackValue={pageSettings.heightMm} normalize={(value) => Math.max(0.0001, value)} onCommit={(value) => updatePageDimensionField("heightMm", value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ClearableNumberField fullWidth label={t(`Top Margin (${paperSizeUnit})`)} value={pageSettings.marginTopMm} fallbackValue={pageSettings.marginTopMm} normalize={(value) => Math.max(0, value)} onCommit={(value) => updatePageField("marginTopMm", String(value))} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ClearableNumberField fullWidth label={t(`Right Margin (${paperSizeUnit})`)} value={pageSettings.marginRightMm} fallbackValue={pageSettings.marginRightMm} normalize={(value) => Math.max(0, value)} onCommit={(value) => updatePageField("marginRightMm", String(value))} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ClearableNumberField fullWidth label={t(`Bottom Margin (${paperSizeUnit})`)} value={pageSettings.marginBottomMm} fallbackValue={pageSettings.marginBottomMm} normalize={(value) => Math.max(0, value)} onCommit={(value) => updatePageField("marginBottomMm", String(value))} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <ClearableNumberField fullWidth label={t(`Left Margin (${paperSizeUnit})`)} value={pageSettings.marginLeftMm} fallbackValue={pageSettings.marginLeftMm} normalize={(value) => Math.max(0, value)} onCommit={(value) => updatePageField("marginLeftMm", String(value))} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button color="grey" onClick={() => setPaperDialogOpen(false)}>{t("Close")}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={variableDialogOpen} onClose={() => setVariableDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          <Box className="flex items-center justify-between">
            <Typography variant="h6">{t("Variables")}</Typography>
            <IconButton size="small" onClick={() => setVariableDialogOpen(false)}>
              <NiCross size="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box className="mb-4">
            <TextField
              fullWidth
              size="small"
              placeholder={t("Search variable")}
              value={variableSearch}
              onChange={(event) => setVariableSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <Box className="me-2 flex items-center">
                    <NiSearch size="small" />
                  </Box>
                ),
              }}
            />
          </Box>
          <Box className="space-y-5">
            {availableVariableGroups.map((group) => (
              <Box key={group.title}>
                <Typography variant="subtitle1" fontWeight={600} className="mb-2">
                  {t(group.title)}
                </Typography>
                <Box className="flex flex-wrap gap-2">
                  {group.items.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">{t("No variable found")}</Typography>
                  ) : (
                    group.items.map((item) => (
                      <Chip
                        key={item.templateVariable}
                        label={item.templateVariable}
                        draggable
                        onClick={() => void (isPdfFormat ? handlePdfVariableClick(item.templateVariable) : copyVariable(item.templateVariable))}
                        onDelete={() => void copyVariable(item.templateVariable)}
                        onDragStart={(event) => event.dataTransfer.setData("text/plain", item.templateVariable)}
                        deleteIcon={<NiClipboard size="small" />}
                        variant="outlined"
                      />
                    ))
                  )}
                </Box>
              </Box>
            ))}
          </Box>
          {!isSpecialFormat && (
            <>
              <Divider className="my-4" />
              <Box className="flex flex-wrap gap-2">
                {usedVariables.map((variable) => (
                  <Chip key={variable} label={variable} color="success" variant="outlined" size="small" />
                ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="grey" onClick={() => setVariableDialogOpen(false)}>{t("Close")}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box className="flex items-center justify-between">
            <Typography variant="h6">{t("Image Controls")}</Typography>
            <IconButton size="small" onClick={() => setImageDialogOpen(false)}>
              <NiCross size="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {!selectedImage ? (
            <Typography color="text.secondary">{t("Select image inside document first.")}</Typography>
          ) : (
            <Grid container spacing={3}>
              <Grid size={12}>
                <Alert severity="info">
                  {t("Set absolute mode, then drag image with mouse on page.")}
                </Alert>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label={t("Position Mode")}
                  value={selectedImage.positionMode}
                  onChange={(event) =>
                    applyImageState({
                      ...selectedImage,
                      positionMode: event.target.value as "flow" | "absolute",
                    })
                  }
                >
                  <MenuItem value="flow">{t("Flow")}</MenuItem>
                  <MenuItem value="absolute">{t("Absolute")}</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ClearableNumberField
                  fullWidth
                  label={t("Width (px)")}
                  value={selectedImage.width}
                  fallbackValue={40}
                  normalize={(value) => Math.max(40, value)}
                  onCommit={(value) =>
                    applyImageState({
                      ...selectedImage,
                      width: value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ClearableNumberField
                  fullWidth
                  label={t("Opacity %")}
                  value={Math.round(selectedImage.opacity * 100)}
                  fallbackValue={100}
                  normalize={(value) => Math.max(5, Math.min(100, Math.round(value)))}
                  onCommit={(value) =>
                    applyImageState({
                      ...selectedImage,
                      opacity: value / 100,
                    })
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ClearableNumberField
                  fullWidth
                  label={t("X Position")}
                  value={selectedImage.x}
                  fallbackValue={0}
                  onCommit={(value) =>
                    applyImageState({
                      ...selectedImage,
                      x: value,
                      positionMode: "absolute",
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ClearableNumberField
                  fullWidth
                  label={t("Y Position")}
                  value={selectedImage.y}
                  fallbackValue={0}
                  onCommit={(value) =>
                    applyImageState({
                      ...selectedImage,
                      y: value,
                      positionMode: "absolute",
                    })
                  }
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="grey" onClick={() => setImageDialogOpen(false)}>{t("Close")}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={shapeDialogOpen} onClose={() => setShapeDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box className="flex items-center justify-between">
            <Typography variant="h6">{t("Shape Controls")}</Typography>
            <IconButton size="small" onClick={() => setShapeDialogOpen(false)}>
              <NiCross size="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {!selectedShape ? (
            <Typography color="text.secondary">{t("Add or select shape inside document first.")}</Typography>
          ) : (
            <Grid container spacing={3}>
              <Grid size={12}>
                <Alert severity="info">
                  {t("Drag shape on page. Use top rotate handle and move mouse to rotate.")}
                </Alert>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label={t("Shape")}
                  value={selectedShape.shape}
                  onChange={(event) =>
                    applyShapeState({
                      ...selectedShape,
                      shape: event.target.value as ShapeType,
                    })
                  }
                >
                  {SHAPE_TYPES.map((shape) => (
                    <MenuItem key={shape} value={shape}>{t(shape)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label={t("Border Style")}
                  value={selectedShape.borderStyle}
                  onChange={(event) =>
                    applyShapeState({
                      ...selectedShape,
                      borderStyle: event.target.value as ShapeBorderStyle,
                    })
                  }
                >
                  {SHAPE_BORDER_STYLES.map((style) => (
                    <MenuItem key={style} value={style}>{t(style)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ClearableNumberField
                  fullWidth
                  label={t("Width (px)")}
                  value={selectedShape.width}
                  fallbackValue={20}
                  normalize={(value) => Math.max(20, value)}
                  onCommit={(value) =>
                    applyShapeState({
                      ...selectedShape,
                      width: value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ClearableNumberField
                  fullWidth
                  label={t(selectedShape.shape === "line" ? "Thickness (px)" : "Height (px)")}
                  value={selectedShape.height}
                  fallbackValue={20}
                  normalize={(value) => Math.max(20, value)}
                  onCommit={(value) =>
                    applyShapeState({
                      ...selectedShape,
                      height: value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ClearableNumberField
                  fullWidth
                  label={t("X Position")}
                  value={selectedShape.x}
                  fallbackValue={0}
                  onCommit={(value) =>
                    applyShapeState({
                      ...selectedShape,
                      x: value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ClearableNumberField
                  fullWidth
                  label={t("Y Position")}
                  value={selectedShape.y}
                  fallbackValue={0}
                  onCommit={(value) =>
                    applyShapeState({
                      ...selectedShape,
                      y: value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ClearableNumberField
                  fullWidth
                  label={t("Border Width (px)")}
                  value={selectedShape.borderWidth}
                  fallbackValue={1}
                  normalize={(value) => Math.max(1, value)}
                  onCommit={(value) =>
                    applyShapeState({
                      ...selectedShape,
                      borderWidth: value,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ClearableNumberField
                  fullWidth
                  label={t("Opacity %")}
                  value={Math.round(selectedShape.opacity * 100)}
                  fallbackValue={100}
                  normalize={(value) => Math.max(5, Math.min(100, Math.round(value)))}
                  onCommit={(value) =>
                    applyShapeState({
                      ...selectedShape,
                      opacity: value / 100,
                    })
                  }
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={t(selectedShape.shape === "line" ? "Line Color" : "Border Color")}
                  value={selectedShape.borderColor}
                  onChange={(event) =>
                    applyShapeState({
                      ...selectedShape,
                      borderColor: event.target.value || "#111827",
                    })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <input
                          type="color"
                          value={selectedShape.borderColor}
                          onChange={(event) =>
                            applyShapeState({
                              ...selectedShape,
                              borderColor: event.target.value,
                            })
                          }
                          style={{ width: 28, height: 28, border: "none", background: "transparent", padding: 0 }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {selectedShape.shape !== "line" && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label={t("Fill Color")}
                    value={selectedShape.fillColor}
                    onChange={(event) =>
                      applyShapeState({
                        ...selectedShape,
                        fillColor: event.target.value || "transparent",
                      })
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <input
                            type="color"
                            value={selectedShape.fillColor === "transparent" ? "#ffffff" : selectedShape.fillColor}
                            onChange={(event) =>
                              applyShapeState({
                                ...selectedShape,
                                fillColor: event.target.value,
                              })
                            }
                            style={{ width: 28, height: 28, border: "none", background: "transparent", padding: 0 }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="grey" onClick={() => setShapeDialogOpen(false)}>{t("Close")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
