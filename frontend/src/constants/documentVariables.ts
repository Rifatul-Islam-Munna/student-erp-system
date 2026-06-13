import { STUDENT_DOC_VARIABLES } from "@/constants/studentDocVariables";
import { DocumentPageSettings, DocumentVariableDefinition } from "@/types/document";

export const SYSTEM_DOCUMENT_VARIABLES: DocumentVariableDefinition[] = [
  { templateVariable: "{{sys_agency_name}}", dbField: "site.name", source: "setting" },
  { templateVariable: "{{sys_agency_address}}", dbField: "site.address", source: "setting" },
  { templateVariable: "{{sys_agency_phone}}", dbField: "site.phone", source: "setting" },
  { templateVariable: "{{sys_agency_email}}", dbField: "site.email", source: "setting" },
  { templateVariable: "{{sys_today}}", dbField: "runtime.today", source: "runtime" },
  { templateVariable: "{{sys_today:year}}", dbField: "runtime.today", source: "runtime" },
  { templateVariable: "{{sys_today:month}}", dbField: "runtime.today", source: "runtime" },
  { templateVariable: "{{sys_today:day}}", dbField: "runtime.today", source: "runtime" },
];

export const STUDENT_DOCUMENT_VARIABLES: DocumentVariableDefinition[] = STUDENT_DOC_VARIABLES.map((templateVariable) => ({
  templateVariable,
  source: "student",
}));

export const DEFAULT_DOCUMENT_PAGE_SETTINGS: DocumentPageSettings = {
  preset: "A4",
  orientation: "portrait",
  unit: "mm",
  widthMm: 210,
  heightMm: 297,
  marginTopMm: 16,
  marginRightMm: 16,
  marginBottomMm: 16,
  marginLeftMm: 16,
};

export const DOCUMENT_PAGE_PRESETS: Record<string, Pick<DocumentPageSettings, "widthMm" | "heightMm">> = {
  A4: { widthMm: 210, heightMm: 297 },
  A3: { widthMm: 297, heightMm: 420 },
  Letter: { widthMm: 216, heightMm: 279 },
  Legal: { widthMm: 216, heightMm: 356 },
};

export const getPageSettingsFromPreset = (
  preset: DocumentPageSettings["preset"],
  orientation: DocumentPageSettings["orientation"]
) => {
  const fallback = DOCUMENT_PAGE_PRESETS.A4;
  const base = preset === "Custom" ? fallback : DOCUMENT_PAGE_PRESETS[preset] || fallback;
  const widthMm = orientation === "landscape" ? Math.max(base.widthMm, base.heightMm) : Math.min(base.widthMm, base.heightMm);
  const heightMm = orientation === "landscape" ? Math.min(base.widthMm, base.heightMm) : Math.max(base.widthMm, base.heightMm);

  return { widthMm, heightMm };
};
