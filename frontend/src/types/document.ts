export type DocumentType = "system" | "student" | "other";
export type DocumentStatus = "draft" | "active" | "inactive";
export type DocumentFormat = "html" | "pdf" | "xlsx" | "fillable_pdf" | "docx";
export type DocumentPagePreset = "A4" | "A3" | "Letter" | "Legal" | "Custom";
export type DocumentOrientation = "portrait" | "landscape";
export type DocumentPageUnit = "mm" | "in" | "px";

export interface DocumentPageSettings {
  preset: DocumentPagePreset;
  orientation: DocumentOrientation;
  unit: DocumentPageUnit;
  widthMm: number;
  heightMm: number;
  marginTopMm: number;
  marginRightMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
}

export interface DocumentVariableDefinition {
  templateVariable: string;
  variableName?: string;
  dbField?: string;
  source?: string;
}

export interface DocumentCustomFont {
  family: string;
  label: string;
  source: string;
}

export interface DocumentTemplate {
  _id?: string;
  name: string;
  docType: DocumentType;
  documentFormat: DocumentFormat;
  templateContent: string;
  backgroundImageUrl?: string;
  shortcodes: string[];
  description?: string;
  fileType?: string;
  customFonts?: DocumentCustomFont[];
  originalFileName?: string;
  originalFilePath?: string;
  status: DocumentStatus;
  isActive: boolean;
  pageSettings: DocumentPageSettings;
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateDocumentResponse {
  success: boolean;
  message?: string;
  downloadToken?: string;
  expiresAt?: string;
  missingVariables?: string[];
  missingCount?: number;
}

export interface DocumentQuery {
  page?: number;
  limit?: number;
  search?: string;
  docType?: DocumentType | "";
  documentFormat?: DocumentFormat | "";
  status?: DocumentStatus | "";
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: any;
}
