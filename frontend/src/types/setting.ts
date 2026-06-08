export interface SettingSite {
  name?: string;
  logo?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  maintenance_mode?: boolean;
  maintenance_message?: string | null;
  academic_year?: string;
}

export interface SettingOptionItem {
  name?: string;
  subname?: string;
  slug?: string;
  description?: string;
}

export interface SettingCountry {
  name: string;
  logoUrl?: string;
  logoFile?: string;
}

export interface SettingDocument {
  _id?: string;
  site?: SettingSite;
  intake_months?: string[];
  visatypes?: SettingOptionItem[];
  visiting_sources?: string[];
  edu_degrees?: string[];
  exam_types?: SettingOptionItem[];
  countries?: SettingCountry[];
  event_categories?: string[];
  faq_categories?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SettingResponse {
  success: boolean;
  data: SettingDocument;
  message?: string;
}
