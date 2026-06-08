import "react-quill-new/dist/quill.snow.css";

import Icons from "quill/ui/icons";
import { MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from "react";
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
import { useTheme } from "@mui/material/styles";

import {
  DEFAULT_DOCUMENT_PAGE_SETTINGS,
  getPageSettingsFromPreset,
  STUDENT_DOCUMENT_VARIABLES,
  SYSTEM_DOCUMENT_VARIABLES,
} from "@/constants/documentVariables";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
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
import NiScriptSub from "@/icons/nexture/ni-script-sub";
import NiScriptSuper from "@/icons/nexture/ni-script-super";
import NiSearch from "@/icons/nexture/ni-search";
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
import { DocumentPageSettings, DocumentTemplate, DocumentVariableDefinition } from "@/types/document";

const validationSchema = yup.object({
  name: yup.string().required("Title is required"),
  docType: yup.string().oneOf(["system", "student", "other"]).required("Document type is required"),
  status: yup.string().oneOf(["draft", "active", "inactive"]).required("Status is required"),
  templateContent: yup.string().required("Document content is required"),
});

const DOCUMENT_TYPES = [
  { value: "system", label: "System" },
  { value: "student", label: "Student" },
  { value: "other", label: "Other" },
] as const;

const DOCUMENT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
] as const;

const PAGE_PRESETS = ["A4", "A3", "Letter", "Legal", "Custom"] as const;
const PAGE_ORIENTATIONS = ["portrait", "landscape"] as const;
const IMAGE_FORMAT_ATTRIBUTES = ["width", "height", "style", "data-position-mode", "data-x", "data-y", "data-opacity"] as const;

const BaseImageFormat = Quill.import("formats/image");
let imageBlotRegistered = false;

const extractVariables = (content: string) =>
  Array.from(new Set((content.match(/\{\{[^}]+\}\}/g) || []).map((item) => item.trim())));

const normalizePageSettings = (pageSettings?: Partial<DocumentPageSettings>): DocumentPageSettings => {
  const preset = pageSettings?.preset || DEFAULT_DOCUMENT_PAGE_SETTINGS.preset;
  const orientation = pageSettings?.orientation || DEFAULT_DOCUMENT_PAGE_SETTINGS.orientation;
  const presetSize = getPageSettingsFromPreset(preset, orientation);

  return {
    preset,
    orientation,
    widthMm: Number(pageSettings?.widthMm) || presetSize.widthMm,
    heightMm: Number(pageSettings?.heightMm) || presetSize.heightMm,
    marginTopMm: Number(pageSettings?.marginTopMm) || DEFAULT_DOCUMENT_PAGE_SETTINGS.marginTopMm,
    marginRightMm: Number(pageSettings?.marginRightMm) || DEFAULT_DOCUMENT_PAGE_SETTINGS.marginRightMm,
    marginBottomMm: Number(pageSettings?.marginBottomMm) || DEFAULT_DOCUMENT_PAGE_SETTINGS.marginBottomMm,
    marginLeftMm: Number(pageSettings?.marginLeftMm) || DEFAULT_DOCUMENT_PAGE_SETTINGS.marginLeftMm,
  };
};

const preparePayload = (values: Partial<DocumentTemplate>) => ({
  name: values.name || "",
  docType: values.docType || "other",
  fileType: values.fileType || "",
  templateContent: values.templateContent || "",
  shortcodes: extractVariables(values.templateContent || ""),
  description: values.description || "",
  status: values.status || "draft",
  isActive: Boolean(values.isActive),
  pageSettings: normalizePageSettings(values.pageSettings),
});

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

registerDocumentImageFormat();

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
  "ql-size": "Text Size",
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

export default function DocumentUpsert() {
  const { t } = useTranslation();
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
  const [selectedImage, setSelectedImage] = useState<SelectedImageState | null>(null);
  const [selectedImageFrame, setSelectedImageFrame] = useState<SelectedImageFrame | null>(null);
  const quillRef = useRef<ReactQuill | null>(null);
  const pageCanvasRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    registerDocumentImageFormat();
    setupEditorIcons();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const toolbar = document.querySelector(".document-editor .ql-toolbar");
      if (!toolbar) return;

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

  const getImageElement = (imageState?: SelectedImageState | null) => {
    const editor = quillRef.current?.getEditor();
    if (!editor || !imageState) return null;
    const images = Array.from(editor.root.querySelectorAll("img"));
    return (images[imageState.index] as HTMLImageElement | undefined) || null;
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
    editor.root.style.minHeight = `${Math.max(editor.root.scrollHeight, nextState.y + (image.height || 120) + 80, 720)}px`;

    setSelectedImage({ ...nextState });
    window.requestAnimationFrame(() => updateSelectedImageFrame(nextState));
    syncEditorHtmlToForm();
  };

  const formik = useFormik<Partial<DocumentTemplate>>({
    initialValues: {
      name: "",
      docType: "other",
      templateContent: "<p></p>",
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
        const payload = preparePayload(values);
        if (isEdit && id) {
          await DocumentService.updateDocument(id, payload);
        } else {
          await DocumentService.createDocument(payload);
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

  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchDocument = async () => {
      setLoading(true);
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

    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.tagName === "IMG") {
        const nextState = readImageState(target as HTMLImageElement);
        setSelectedImage(nextState);
        window.requestAnimationFrame(() => updateSelectedImageFrame(nextState));
        return;
      }
      if (!target.closest("img")) {
        setSelectedImage(null);
        setSelectedImageFrame(null);
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.tagName !== "IMG") return;
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

    const handleMouseUp = () => {
      Array.from(root.querySelectorAll("img")).forEach((imageNode) => {
        const image = imageNode as HTMLImageElement;
        if (image.dataset.positionMode === "absolute") image.style.cursor = "grab";
      });
      dragImageRef.current = null;
    };

    root.addEventListener("click", handleClick);
    root.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      root.removeEventListener("click", handleClick);
      root.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isBuilderStep]);

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

  const pageSettings = normalizePageSettings(formik.values.pageSettings);
  const usedVariables = extractVariables(formik.values.templateContent || "");

  const handlePagePresetChange = (preset: DocumentPageSettings["preset"]) => {
    const orientation = formik.values.pageSettings?.orientation || DEFAULT_DOCUMENT_PAGE_SETTINGS.orientation;
    const nextBase = preset === "Custom"
      ? formik.values.pageSettings || DEFAULT_DOCUMENT_PAGE_SETTINGS
      : getPageSettingsFromPreset(preset, orientation);

    formik.setFieldValue("pageSettings", {
      ...normalizePageSettings(formik.values.pageSettings),
      preset,
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
  };

  const handleEditorMouseDownCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement | null;
    if (!target || target.tagName !== "IMG") return;

    const nextState = readImageState(target as HTMLImageElement);
    setSelectedImage(nextState);
    window.requestAnimationFrame(() => updateSelectedImageFrame(nextState));
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

  const goToBuilder = async () => {
    const errors = await formik.validateForm();
    formik.setTouched({ name: true, docType: true, status: true });
    if (errors.name || errors.docType || errors.status) return;
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
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 3 }}>
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
                  <TextField fullWidth size="small" select label={t("Status")} name="status" value={formik.values.status || "draft"} onChange={formik.handleChange}>
                    {DOCUMENT_STATUSES.map((item) => (
                      <MenuItem key={item.value} value={item.value}>{t(item.label)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box className="flex flex-wrap justify-end gap-2">
                    <Button variant="surface" color="grey" startIcon={<NiKnobs size="medium" />} onClick={() => setPaperDialogOpen(true)}>
                      {t("Paper Setup")}
                    </Button>
                    <Button variant="surface" color="grey" startIcon={<NiClipboard size="medium" />} onClick={() => setVariableDialogOpen(true)}>
                      {t("Variables")}
                    </Button>
                    <Button variant="surface" color="grey" startIcon={<NiDocumentImage size="medium" />} onClick={() => setImageDialogOpen(true)} disabled={!selectedImage}>
                      {t("Image Controls")}
                    </Button>
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
                <Chip label={`${usedVariables.length} ${t("variables used")}`} size="small" variant="outlined" color="warning" />
                {formik.values.docType === "student" && <Chip label={t("Student variable mode")} size="small" color="primary" variant="outlined" />}
                {selectedImage && <Chip label={t("Image Selected")} size="small" color="secondary" variant="outlined" onClick={() => setImageDialogOpen(true)} />}
              </Box>

              <Box className="overflow-auto rounded-xl bg-grey-50 p-4">
                <Box
                  ref={pageCanvasRef}
                  onMouseDownCapture={handleEditorMouseDownCapture}
                  sx={{
                    width: `${pageSettings.widthMm}mm`,
                    minHeight: `${pageSettings.heightMm}mm`,
                    mx: "auto",
                    position: "relative",
                    backgroundColor: "#fff",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "12px",
                    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
                    p: `${pageSettings.marginTopMm}mm ${pageSettings.marginRightMm}mm ${pageSettings.marginBottomMm}mm ${pageSettings.marginLeftMm}mm`,
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const variable = event.dataTransfer.getData("text/plain");
                    if (variable) {
                      void insertVariable(variable);
                    }
                  }}
                  onDragOver={(event) => event.preventDefault()}
                >
                  <Box
                    sx={{
                      "& .ql-toolbar.ql-snow": {
                        mb: 2.5,
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 1,
                        p: 1.5,
                        borderRadius: 3,
                        borderColor: "divider",
                        backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[900] : theme.palette.grey[50],
                      },
                      "& .ql-toolbar.ql-snow .ql-formats": {
                        mr: "0 !important",
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1,
                        py: 0.75,
                        border: "1px solid",
                        borderColor: "divider",
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
                      "& .ql-toolbar.ql-snow .ql-picker.ql-header, & .ql-toolbar.ql-snow .ql-picker.ql-size": {
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
                      "& .ql-container.ql-snow": {
                        border: "none",
                      },
                      "& .ql-editor": {
                        minHeight: 820,
                        padding: 0,
                        color: "#000000",
                        position: "relative",
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
                          [{ size: ["small", false, "large", "huge"] }],
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
                      <>
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
                        <Box
                          sx={{
                            position: "absolute",
                            left: selectedImageFrame.left,
                            top: Math.max(selectedImageFrame.top - 116, 8),
                            width: 280,
                            p: 1.5,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: theme.shadows[4],
                            zIndex: 9,
                          }}
                        >
                          <Box className="mb-2 flex items-center justify-between gap-2">
                            <Button
                              size="small"
                              variant={selectedImage.positionMode === "flow" ? "contained" : "outlined"}
                              onClick={() => applyImageState({ ...selectedImage, positionMode: "flow" })}
                            >
                              {t("Flow")}
                            </Button>
                            <Button
                              size="small"
                              variant={selectedImage.positionMode === "absolute" ? "contained" : "outlined"}
                              onClick={() => applyImageState({ ...selectedImage, positionMode: "absolute" })}
                            >
                              {t("Absolute")}
                            </Button>
                            <Button size="small" variant="text" onClick={() => setImageDialogOpen(true)}>
                              {t("More")}
                            </Button>
                          </Box>
                          <Typography variant="caption" color="text.secondary">{t("Width")}</Typography>
                          <Slider
                            size="small"
                            min={40}
                            max={1200}
                            value={selectedImage.width}
                            onChange={(_, value) => applyImageState({ ...selectedImage, width: Number(value) })}
                          />
                          <Typography variant="caption" color="text.secondary">{t("Opacity")}</Typography>
                          <Slider
                            size="small"
                            min={5}
                            max={100}
                            value={Math.round(selectedImage.opacity * 100)}
                            onChange={(_, value) => applyImageState({ ...selectedImage, opacity: Number(value) / 100 })}
                          />
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>

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
            {pageSettings.preset === "Custom" && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth type="number" label={t("Width (mm)")} value={pageSettings.widthMm} onChange={(event) => updatePageField("widthMm", event.target.value)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth type="number" label={t("Height (mm)")} value={pageSettings.heightMm} onChange={(event) => updatePageField("heightMm", event.target.value)} />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth type="number" label={t("Top Margin")} value={pageSettings.marginTopMm} onChange={(event) => updatePageField("marginTopMm", event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth type="number" label={t("Right Margin")} value={pageSettings.marginRightMm} onChange={(event) => updatePageField("marginRightMm", event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth type="number" label={t("Bottom Margin")} value={pageSettings.marginBottomMm} onChange={(event) => updatePageField("marginBottomMm", event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth type="number" label={t("Left Margin")} value={pageSettings.marginLeftMm} onChange={(event) => updatePageField("marginLeftMm", event.target.value)} />
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
                        onClick={() => void insertVariable(item.templateVariable)}
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
          <Divider className="my-4" />
          <Box className="flex flex-wrap gap-2">
            {usedVariables.map((variable) => (
              <Chip key={variable} label={variable} color="success" variant="outlined" size="small" />
            ))}
          </Box>
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
                <TextField
                  fullWidth
                  type="number"
                  label={t("Width (px)")}
                  value={selectedImage.width}
                  onChange={(event) =>
                    applyImageState({
                      ...selectedImage,
                      width: Number(event.target.value) || 40,
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label={t("Opacity %")}
                  value={Math.round(selectedImage.opacity * 100)}
                  onChange={(event) =>
                    applyImageState({
                      ...selectedImage,
                      opacity: Math.max(0.05, Math.min(1, (Number(event.target.value) || 100) / 100)),
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
                  type="number"
                  label={t("X Position")}
                  value={selectedImage.x}
                  onChange={(event) =>
                    applyImageState({
                      ...selectedImage,
                      x: Number(event.target.value) || 0,
                      positionMode: "absolute",
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label={t("Y Position")}
                  value={selectedImage.y}
                  onChange={(event) =>
                    applyImageState({
                      ...selectedImage,
                      y: Number(event.target.value) || 0,
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
    </Box>
  );
}
