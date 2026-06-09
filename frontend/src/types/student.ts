export interface Education {
  _id?: string;
  educationKey?: string;
  degreeExam?: string;
  level?: string;
  institutionName?: string;
  institution?: string;
  passingYear?: number;
  year?: number;
  board?: string;
  gpa?: number;
  groupSubject?: string;
  group?: string;
  durationMonths?: number;
  expectedScheduleYear?: number;
  expectedScheduleMonths?: number;
  examConductedYear?: number;
  examConductedMonths?: number;
  courseName?: string;
  subjectName?: string;
  courseUnderInstitution?: string;
  institutionBoard?: string;
  institutionCollege?: string;
  institutionUniversity?: string;
  institutionNationalUniversity?: string;
  institutionPrivateUniversity?: string;
  institutionDhakaUniversity?: string;
  completionYear?: number;
  completionMonth?: number;
  address?: string;
  entranceDate?: string | Date;
  graduationDate?: string | Date;
}

export interface Employment {
  _id?: string;
  companyName?: string;
  address?: string;
  jobTitle?: string;
  position?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

export interface JapaneseEducation {
  _id?: string;
  languageKey?: string;
  instituteName?: string;
  preferredInstituteName?: string;
  address?: string;
  fromDate?: string | Date;
  toDate?: string | Date;
  totalHours?: number;
  durationMonths?: number;
  attendancePercentage?: number;
  grade?: string;
}

export interface JapaneseTest {
  _id?: string;
  examType?: string;
  level?: string;
  examDate?: string | Date;
  score?: string;
  result?: "Pass" | "Fail" | "Pending" | "";
}

export interface Student {
  _id?: string;
  fullNameEn: string;
  nameKatakana?: string;
  name_bd?: string;
  phone: string;
  whatsapp?: string;
  lineapp?: string;
  facebookprofile?: string;
  guardianPhone?: string;
  email: string;
  dob: string | Date;
  gender: "male" | "female" | "other";
  maritalStatus?: "single" | "married" | "divorced" | "widowed" | "";
  nationality?: string;
  birth_place?: string;
  bloodGroup?: string;
  nationalId?: string;
  passportNo?: string;
  passportIssueDate?: string | Date;
  passportExpiryDate?: string | Date;
  bc_date_of_registration?: string | Date;
  bc_date_of_issuance?: string | Date;
  occupation?: string;
  spouseName?: string;
  father_name_en?: string;
  mother_name_en?: string;
  mother_dob?: string | Date;
  mother_phone?: string;
  sponsor_name_en?: string;
  sponsor_relationship?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  permanentAddress?: string;
  currentAddressSameAsPermanent?: boolean;
  currentAddress?: string;

  education?: Education[];
  employment?: Employment[];
  languageEducation?: JapaneseEducation[];
  languageTest?: JapaneseTest[];

  visaType?: string;
  country?: string;
  schoolName?: string;
  intake?: string;
  expectedIntake?: string;
  source?: string;
  status?: string;
  applicationType?: string;
  studentType?: "own" | "partner";
  batch?: any; // ObjectId
  branch?: any; // ObjectId
  agent?: any; // ObjectId
  partnerAgency?: any; // ObjectId
  counselor?: any; // ObjectId

  edu_ssc_school?: string;
  edu_ssc_board?: string;
  edu_ssc_subject?: string;
  edu_ssc_year?: number;
  edu_ssc_months?: number;
  edu_hsc_school?: string;
  edu_hsc_board?: string;
  edu_hsc_subject?: string;
  edu_hsc_year?: number;
  edu_hsc_months?: number;
  edu_hsc_expected_schedule_year?: number;
  edu_hsc_expected_schedule_months?: number;
  edu_hsc_exam_conducted_year?: number;
  edu_hsc_exam_conducted_months?: number;
  edu_bachelor_degree_subject?: string;
  jp_study_institution?: string;
  jp_study_institution_preferred?: string;
  jp_study_hours?: number;
  jp_study_months?: number;
  name_course?: string;
  name_subject?: string;
  course_completion_year?: number;
  course_completion_month?: number;
  course_under_institution?: string;
  institution_board?: string;
  institution_college?: string;
  institution_university?: string;
  institution_national_university?: string;
  institution_private_university?: string;
  institution_dhaka_university?: string;
  docVariables?: Record<string, string>;
  explanationChecks?: Record<string, boolean>;

  googleDriveLink?: string;
  internalNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  gender?: string;
  studentType?: string;
  [key: string]: any;
}
