import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { StudentService } from "@/services/studentService";
import {
  EXPLANATION_CONFIGS,
  formatDocVariableLabel,
  getDocVariableSection,
  STUDENT_DOC_EXAM_VARIABLES,
  STUDENT_DOC_VARIABLES,
} from "@/constants/studentDocVariables";
import { Education, JapaneseEducation, Student } from "@/types/student";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiPlus from "@/icons/nexture/ni-plus";

const validationSchema = yup.object({
  fullNameEn: yup.string().required("Full Name is required"),
  phone: yup.string().required("Phone is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  dob: yup.date().nullable().required("Date of Birth is required"),
  gender: yup.string().oneOf(["male", "female", "other"]).required("Gender is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>
      {children}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

const findEducation = (education: Education[] | undefined, key: string, fallbackMatch?: (item: Education) => boolean) =>
  education?.find((item) => item.educationKey === key || fallbackMatch?.(item));

const formatDateValue = (value?: string | Date) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

const getDatePart = (value: string | Date | undefined, part: "year" | "month" | "day") => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  if (part === "year") return String(date.getUTCFullYear());
  if (part === "month") return String(date.getUTCMonth() + 1).padStart(2, "0");
  return String(date.getUTCDate()).padStart(2, "0");
};

const splitName = (value?: string) => {
  const parts = (value || "").trim().split(/\s+/).filter(Boolean);
  return {
    first: parts[0] || "",
    middle: parts.length > 2 ? parts.slice(1, -1).join(" ") : parts.length === 3 ? parts[1] : "",
    last: parts.length > 1 ? parts[parts.length - 1] : "",
  };
};

const calculateAge = (value?: string | Date) => {
  if (!value) return "";
  const dob = new Date(value);
  if (Number.isNaN(dob.getTime())) return "";
  const today = new Date();
  let age = today.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - dob.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < dob.getUTCDate())) age -= 1;
  return String(age);
};

const buildDerivedDocVariables = (values: Partial<Student>) => {
  const nameEn = splitName(values.fullNameEn);
  const nameKatakana = splitName(values.nameKatakana);

  return {
    "{{name_en}}": values.fullNameEn || "",
    "{{name_en:first}}": nameEn.first,
    "{{name_en:middle}}": nameEn.middle,
    "{{name_en:last}}": nameEn.last,
    "{{name_katakana}}": values.nameKatakana || "",
    "{{name_katakana:first}}": nameKatakana.first,
    "{{name_katakana:middle}}": nameKatakana.middle,
    "{{name_katakana:last}}": nameKatakana.last,
    "{{name_bd}}": values.name_bd || "",
    "{{dob}}": formatDateValue(values.dob),
    "{{dob:day}}": getDatePart(values.dob, "day"),
    "{{dob:month}}": getDatePart(values.dob, "month"),
    "{{dob:year}}": getDatePart(values.dob, "year"),
    "{{age}}": calculateAge(values.dob),
    "{{gender}}": values.gender || "",
    "{{marital_status}}": values.maritalStatus || "",
    "{{nationality}}": values.nationality || "",
    "{{nationality_en}}": values.nationality || "",
    "{{nationality_bd}}": values.nationality || "",
    "{{blood_group}}": values.bloodGroup || "",
    "{{phone}}": values.phone || "",
    "{{email}}": values.email || "",
    "{{whatsapp}}": values.whatsapp || "",
    "{{lineapp}}": values.lineapp || "",
    "{{facebookprofile}}": values.facebookprofile || "",
    "{{birth_place}}": values.birth_place || "",
    "{{birth_place_en}}": values.birth_place || "",
    "{{birth_place_bd}}": values.birth_place || "",
    "{{occupation}}": values.occupation || "",
    "{{spouse_name}}": values.spouseName || "",
    "{{emergency_contact}}": values.emergencyContact || "",
    "{{emergency_phone}}": values.emergencyPhone || "",
    "{{nid}}": values.nationalId || "",
    "{{nid_number}}": values.nationalId || "",
    "{{nid_number }}": values.nationalId || "",
    "{{passport_number}}": values.passportNo || "",
    "{{passport_issue}}": formatDateValue(values.passportIssueDate),
    "{{passport_issue:year}}": getDatePart(values.passportIssueDate, "year"),
    "{{passport_issue:month}}": getDatePart(values.passportIssueDate, "month"),
    "{{passport_issue:day}}": getDatePart(values.passportIssueDate, "day"),
    "{{passport_expiry}}": formatDateValue(values.passportExpiryDate),
    "{{passport_expiry:year}}": getDatePart(values.passportExpiryDate, "year"),
    "{{passport_expiry:month}}": getDatePart(values.passportExpiryDate, "month"),
    "{{passport_expiry:day}}": getDatePart(values.passportExpiryDate, "day"),
    "{{father_name:en}}": values.father_name_en || "",
    "{{mother_name:en}}": values.mother_name_en || "",
    "{{sponsor_name:en}}": values.sponsor_name_en || "",
    "{{sponsor_name_en}}": values.sponsor_name_en || "",
    "{{sponsor_relationship}}": values.sponsor_relationship || "",
    "{{permanent_address}}": values.permanentAddress || "",
    "{{permanent_address:en}}": values.permanentAddress || "",
    "{{permanent_address:bd}}": values.permanentAddress || "",
    "{{present_address}}": values.currentAddress || values.permanentAddress || "",
    "{{bc_date of registration}}": formatDateValue(values.bc_date_of_registration),
    "{{bc_registration:year}}": getDatePart(values.bc_date_of_registration, "year"),
    "{{bc_registration:month}}": getDatePart(values.bc_date_of_registration, "month"),
    "{{bc_registration:day}}": getDatePart(values.bc_date_of_registration, "day"),
    "{{bc_date of Issuance}}": formatDateValue(values.bc_date_of_issuance),
    "{{bc_ Issuance:year}}": getDatePart(values.bc_date_of_issuance, "year"),
    "{{bc_ Issuance:month}}": getDatePart(values.bc_date_of_issuance, "month"),
    "{{bc_ Issuance:day}}": getDatePart(values.bc_date_of_issuance, "day"),
    "{{edu_ssc_school}}": values.edu_ssc_school || "",
    "{{edu_ssc_year}}": values.edu_ssc_year ? String(values.edu_ssc_year) : "",
    "{{edu_ssc_ year}}": values.edu_ssc_year ? String(values.edu_ssc_year) : "",
    "{{edu_ssc:year}}": values.edu_ssc_year ? String(values.edu_ssc_year) : "",
    "{{edu_ssc :year}}": values.edu_ssc_year ? String(values.edu_ssc_year) : "",
    "{{edu_ssc_board}}": values.edu_ssc_board || "",
    "{{edu_ssc_subject}}": values.edu_ssc_subject || "",
    "{{edu_hsc_school}}": values.edu_hsc_school || "",
    "{{edu_hsc_year}}": values.edu_hsc_year ? String(values.edu_hsc_year) : "",
    "{{edu_hsc_ year}}": values.edu_hsc_year ? String(values.edu_hsc_year) : "",
    "{{edu_hsc:year}}": values.edu_hsc_year ? String(values.edu_hsc_year) : "",
    "{{edu_hsc_board}}": values.edu_hsc_board || "",
    "{{edu_hsc_subject}}": values.edu_hsc_subject || "",
    "{{edu_hsc:months}}": values.edu_hsc_months ? String(values.edu_hsc_months) : "",
    "{{edu_hsc_ months}}": values.edu_hsc_months ? String(values.edu_hsc_months) : "",
    "{{edu_hsc expected schedule:year}}": values.edu_hsc_expected_schedule_year ? String(values.edu_hsc_expected_schedule_year) : "",
    "{{edu_ hsc expected schedule:months}}": values.edu_hsc_expected_schedule_months ? String(values.edu_hsc_expected_schedule_months) : "",
    "{{edu_hsc exam conducted:year}}": values.edu_hsc_exam_conducted_year ? String(values.edu_hsc_exam_conducted_year) : "",
    "{{edu_ hsc exam conducted:months}}": values.edu_hsc_exam_conducted_months ? String(values.edu_hsc_exam_conducted_months) : "",
    "{{edu_bachelor/degree:subject}}": values.edu_bachelor_degree_subject || "",
    "{{name_course}}": values.name_course || "",
    "{{name_subject}}": values.name_subject || "",
    "{{course_completion:Year}}": values.course_completion_year ? String(values.course_completion_year) : "",
    "{{course_completion:month}}": values.course_completion_month ? String(values.course_completion_month) : "",
    "{{course_under:institution}}": values.course_under_institution || "",
    "{{institution_ board}}": values.institution_board || "",
    "{{institution_ college}}": values.institution_college || "",
    "{{institution_ university}}": values.institution_university || "",
    "{{institution_ national university}}": values.institution_national_university || "",
    "{{institution_ private university}}": values.institution_private_university || "",
    "{{institution_ dhaka university}}": values.institution_dhaka_university || "",
    "{{jp_study_institution}}": values.jp_study_institution || "",
    "{{jp_study_institution_Nexus Japanese Language Academy/Aim Education}}": values.jp_study_institution_preferred || values.jp_study_institution || "",
    "{{jp_study_hours}}": values.jp_study_hours ? String(values.jp_study_hours) : "",
    "{{jp_study_months}}": values.jp_study_months ? String(values.jp_study_months) : "",
    "{{country}}": values.country || "",
    "{{school}}": values.schoolName || "",
    "{{intake}}": values.intake || "",
    "{{visa_type}}": values.visaType || "",
    "{{student_type}}": values.studentType || "",
    "{{source}}": values.source || "",
    "{{status}}": values.status || "",
  } as Record<string, string>;
};

const DUPLICATE_DOC_VARIABLE_PATTERNS = [
  "name_",
  "dob",
  "age",
  "gender",
  "marital_status",
  "nationality",
  "blood_group",
  "phone",
  "email",
  "whatsapp",
  "lineapp",
  "facebookprofile",
  "birth_place",
  "occupation",
  "spouse_name",
  "emergency_contact",
  "emergency_phone",
  "nid",
  "passport",
  "permanent_address",
  "present_address",
  "current_address",
  "father_name",
  "mother_name",
  "sponsor_name:en",
  "sponsor_relationship",
  "edu_ssc_school",
  "edu_ssc_year",
  "edu_ssc_ year",
  "edu_ssc:year",
  "edu_ssc :year",
  "edu_ssc_board",
  "edu_ssc_subject",
  "edu_hsc_school",
  "edu_hsc_year",
  "edu_hsc_ year",
  "edu_hsc:year",
  "edu_hsc_board",
  "edu_hsc_subject",
  "edu_hsc:months",
  "edu_hsc_ months",
  "edu_hsc expected schedule:year",
  "edu_ hsc expected schedule:months",
  "edu_hsc exam conducted:year",
  "edu_ hsc exam conducted:months",
  "edu_bachelor/degree:subject",
  "name_course",
  "name_subject",
  "course_completion:Year",
  "course_completion:month",
  "course_under:institution",
  "institution_ board",
  "institution_ college",
  "institution_ university",
  "institution_ national university",
  "institution_ private university",
  "institution_ dhaka university",
  "jp_study_institution",
  "jp_study_hours",
  "jp_study_months",
  "work_company_name",
  "work_address",
  "work_position",
  "work_start",
  "work_end",
  "work2_company",
  "work2_address",
  "work2_position",
  "work2_start",
  "work2_end",
  "country",
  "school",
  "intake",
  "visa_type",
  "student_type",
  "source",
  "status",
];

const FULL_DATE_VARIABLE_PATTERNS = [
  "{{dob}}",
  "{{father_dob}}",
  "{{mother_dob}}",
  "{{sponsor_dob}}",
  "{{passport_issue}}",
  "{{passport_expiry}}",
  "{{bc_date of registration}}",
  "{{bc_date of Issuance}}",
  "{{jp_exam:date}}",
  "{{jp_exam_date}}",
  "{{jp_ result :date}}",
  "{{jp_ result _date}}",
  "{{jp_study_from}}",
  "{{jp_study_to}}",
  "{{work_start}}",
  "{{work_end}}",
  "{{work2_start}}",
  "{{work2_end}}",
  "{{edu_elementary_entrance}}",
  "{{edu_elementary_graduation}}",
  "{{edu_junior_entrance}}",
  "{{edu_junior_graduation}}",
  "{{edu_highSchool_entrance}}",
  "{{edu_highSchool_graduation}}",
  "{{edu_technical:entrance}}",
  "{{edu_technical:graduation}}",
  "{{edu_university:entrance}}",
  "{{edu_university:graduation}}",
  "{{edu_ssc_entrance}}",
  "{{edu_hsc_entrance}}",
  "{{edu_honours_entrance}}",
];

const isLikelyDateVariable = (variable: string) => FULL_DATE_VARIABLE_PATTERNS.includes(variable);

const isDatePartVariable = (variable: string) => /:(year|month|day)\}\}$/.test(variable);

const isLikelyLongTextVariable = (variable: string) =>
  /address|reason|future_plan|statement|location|subject|designation/i.test(variable);

const mapStudentToFormValues = (student: Student): Partial<Student> => {
  const ssc = findEducation(student.education, "ssc", (item) => item.level?.toUpperCase() === "SSC");
  const hsc = findEducation(student.education, "hsc", (item) => item.level?.toUpperCase() === "HSC");
  const bachelor = findEducation(
    student.education,
    "bachelor",
    (item) => (item.level || "").toLowerCase().includes("bachelor") || (item.level || "").toLowerCase().includes("degree")
  );
  const jpStudy = (student.languageEducation || []).find(
    (item: JapaneseEducation) => item.languageKey === "jp_study"
  ) || student.languageEducation?.[0];

  return {
    ...student,
    edu_ssc_school: student.edu_ssc_school || ssc?.institution || ssc?.institutionName,
    edu_ssc_board: student.edu_ssc_board || ssc?.board,
    edu_ssc_subject: student.edu_ssc_subject || ssc?.group || ssc?.groupSubject,
    edu_ssc_year: student.edu_ssc_year || ssc?.year || ssc?.passingYear,
    edu_ssc_months: student.edu_ssc_months || ssc?.durationMonths,
    edu_hsc_school: student.edu_hsc_school || hsc?.institution || hsc?.institutionName,
    edu_hsc_board: student.edu_hsc_board || hsc?.board,
    edu_hsc_subject: student.edu_hsc_subject || hsc?.group || hsc?.groupSubject,
    edu_hsc_year: student.edu_hsc_year || hsc?.year || hsc?.passingYear,
    edu_hsc_months: student.edu_hsc_months || hsc?.durationMonths,
    edu_hsc_expected_schedule_year: student.edu_hsc_expected_schedule_year || hsc?.expectedScheduleYear,
    edu_hsc_expected_schedule_months: student.edu_hsc_expected_schedule_months || hsc?.expectedScheduleMonths,
    edu_hsc_exam_conducted_year: student.edu_hsc_exam_conducted_year || hsc?.examConductedYear,
    edu_hsc_exam_conducted_months: student.edu_hsc_exam_conducted_months || hsc?.examConductedMonths,
    edu_bachelor_degree_subject: student.edu_bachelor_degree_subject || bachelor?.group || bachelor?.subjectName,
    name_course: student.name_course || bachelor?.courseName || bachelor?.level,
    name_subject: student.name_subject || bachelor?.subjectName,
    course_completion_year: student.course_completion_year || bachelor?.completionYear,
    course_completion_month: student.course_completion_month || bachelor?.completionMonth,
    course_under_institution: student.course_under_institution || bachelor?.courseUnderInstitution,
    institution_board: student.institution_board || bachelor?.institutionBoard,
    institution_college: student.institution_college || bachelor?.institutionCollege,
    institution_university: student.institution_university || bachelor?.institutionUniversity,
    institution_national_university: student.institution_national_university || bachelor?.institutionNationalUniversity,
    institution_private_university: student.institution_private_university || bachelor?.institutionPrivateUniversity,
    institution_dhaka_university: student.institution_dhaka_university || bachelor?.institutionDhakaUniversity,
    jp_study_institution: student.jp_study_institution || jpStudy?.instituteName,
    jp_study_institution_preferred: student.jp_study_institution_preferred || jpStudy?.preferredInstituteName,
    jp_study_hours: student.jp_study_hours || jpStudy?.totalHours,
    jp_study_months: student.jp_study_months || jpStudy?.durationMonths,
    docVariables: student.docVariables || {},
    explanationChecks: student.explanationChecks || {},
  };
};

const getRelationId = (value: any) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return value._id;
  return "";
};

const buildStudentPayload = (values: Partial<Student>) => ({
  ...values,
  branch: getRelationId(values.branch),
  counselor: getRelationId(values.counselor),
  agent: getRelationId(values.agent),
  partnerAgency: getRelationId(values.partnerAgency),
  batch: getRelationId(values.batch),
});

const toIsoString = (value: Date) => value.toISOString();
const DEV_AUTOFILL_STORAGE_KEY = "student-create-dev-autofill";

export default function StudentUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);
  const isDevCreate = import.meta.env.DEV && !isEdit;

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<Student>>({
    initialValues: {
      fullNameEn: "",
      nameKatakana: "",
      name_bd: "",
      phone: "",
      whatsapp: "",
      lineapp: "",
      facebookprofile: "",
      guardianPhone: "",
      email: "",
      dob: undefined,
      gender: "male",
      maritalStatus: "single",
      nationality: "",
      birth_place: "",
      bloodGroup: "",
      nationalId: "",
      passportNo: "",
      passportIssueDate: undefined,
      passportExpiryDate: undefined,
      bc_date_of_registration: undefined,
      bc_date_of_issuance: undefined,
      occupation: "",
      spouseName: "",
      father_name_en: "",
      mother_name_en: "",
      sponsor_name_en: "",
      sponsor_relationship: "",
      emergencyContact: "",
      emergencyPhone: "",
      permanentAddress: "",
      currentAddressSameAsPermanent: false,
      currentAddress: "",
      employment: [],
      languageTest: [],
      visaType: "",
      country: "",
      schoolName: "",
      intake: "",
      expectedIntake: "",
      source: "",
      status: "",
      applicationType: "",
      studentType: "own",
      edu_ssc_school: "",
      edu_ssc_board: "",
      edu_ssc_subject: "",
      edu_ssc_year: undefined,
      edu_ssc_months: undefined,
      edu_hsc_school: "",
      edu_hsc_board: "",
      edu_hsc_subject: "",
      edu_hsc_year: undefined,
      edu_hsc_months: undefined,
      edu_hsc_expected_schedule_year: undefined,
      edu_hsc_expected_schedule_months: undefined,
      edu_hsc_exam_conducted_year: undefined,
      edu_hsc_exam_conducted_months: undefined,
      edu_bachelor_degree_subject: "",
      jp_study_institution: "",
      jp_study_institution_preferred: "",
      jp_study_hours: undefined,
      jp_study_months: undefined,
      name_course: "",
      name_subject: "",
      course_completion_year: undefined,
      course_completion_month: undefined,
      course_under_institution: "",
      institution_board: "",
      institution_college: "",
      institution_university: "",
      institution_national_university: "",
      institution_private_university: "",
      institution_dhaka_university: "",
      docVariables: {},
      explanationChecks: {},
      googleDriveLink: "",
      internalNotes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          ...buildStudentPayload(values),
          docVariables: {
            ...(values.docVariables || {}),
            ...Object.fromEntries(Object.entries(buildDerivedDocVariables(values)).filter(([, value]) => value)),
          },
        };
        if (isEdit && id) {
          await StudentService.updateStudent(id, payload);
        } else {
          await StudentService.createStudent(payload);
          if (import.meta.env.DEV) {
            window.localStorage.removeItem(DEV_AUTOFILL_STORAGE_KEY);
          }
        }
        navigate(`/${role}/students`);
      } catch (error) {
        console.error("Failed to save student", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const derivedDocVariables = buildDerivedDocVariables(formik.values);

  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchStudent = async () => {
      try {
        const response = await StudentService.getStudentById(id);
        if (response.success && response.data) {
          formik.setValues({
            ...formik.initialValues,
            ...buildStudentPayload(mapStudentToFormValues(response.data)),
          });
        }
      } catch (error) {
        console.error("Failed to fetch student", error);
      }
    };

    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  useEffect(() => {
    if (!isDevCreate) return;

    try {
      const savedValues = window.localStorage.getItem(DEV_AUTOFILL_STORAGE_KEY);
      if (!savedValues) return;

      formik.setValues({
        ...formik.initialValues,
        ...JSON.parse(savedValues),
      });
    } catch (error) {
      console.error("Failed to restore dev autofill draft", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDevCreate]);

  const addEmployment = () => {
    const employment = formik.values.employment || [];
    formik.setFieldValue("employment", [
      ...employment,
      { companyName: "", address: "", position: "", startDate: undefined, endDate: undefined },
    ]);
  };

  const removeEmployment = (index: number) => {
    const employment = [...(formik.values.employment || [])];
    employment.splice(index, 1);
    formik.setFieldValue("employment", employment);
  };

  const addLanguageTest = () => {
    const items = formik.values.languageTest || [];
    formik.setFieldValue("languageTest", [...items, { examType: "", level: "", examDate: undefined, score: "", result: "" }]);
  };

  const removeLanguageTest = (index: number) => {
    const items = [...(formik.values.languageTest || [])];
    items.splice(index, 1);
    formik.setFieldValue("languageTest", items);
  };

  const autofillDevStudent = async () => {
    if (!isDevCreate) return;

    const { faker } = await import("@faker-js/faker");
    const gender = faker.helpers.arrayElement<Student["gender"]>(["male", "female", "other"]);
    const maritalStatus = faker.helpers.arrayElement<NonNullable<Student["maritalStatus"]>>([
      "single",
      "married",
      "divorced",
      "widowed",
    ]);
    const studentType = faker.helpers.arrayElement<NonNullable<Student["studentType"]>>(["own", "partner"]);
    const firstName = faker.person.firstName(gender === "other" ? undefined : gender);
    const lastName = faker.person.lastName(gender === "other" ? undefined : gender);
    const fullNameEn = faker.person.fullName({
      firstName,
      lastName,
      sex: gender === "other" ? undefined : gender,
    });
    const dob = faker.date.birthdate({ min: 18, max: 30, mode: "age" });
    const passportIssueDate = faker.date.between({
      from: dayjs(dob).add(18, "year").toDate(),
      to: new Date(),
    });
    const passportExpiryDate = faker.date.future({ years: 5, refDate: passportIssueDate });
    const birthCertificateDate = faker.date.between({ from: dob, to: dayjs(dob).add(2, "year").toDate() });
    const sscYear = faker.number.int({ min: 2014, max: 2019 });
    const hscYear = sscYear + 2;
    const completionYear = hscYear + faker.number.int({ min: 3, max: 5 });
    const completionMonth = faker.number.int({ min: 1, max: 12 });
    const jpStudyMonths = faker.number.int({ min: 6, max: 18 });
    const jpStudyHours = jpStudyMonths * faker.number.int({ min: 16, max: 24 });
    const permanentAddress = `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}`;
    const currentAddressSameAsPermanent = faker.datatype.boolean();
    const currentAddress = currentAddressSameAsPermanent
      ? permanentAddress
      : `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.country()}`;
    const companyStartDate = faker.date.past({ years: 4 });
    const companyEndDate = faker.date.between({ from: companyStartDate, to: new Date() });
    const examDate = faker.date.recent({ days: 240 });
    const intakeYear = new Date().getFullYear() + 1;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();
    const username = faker.internet.username({ firstName, lastName });

    const autofillValues = {
      ...formik.initialValues,
      fullNameEn,
      name_bd: fullNameEn,
      nameKatakana: `${firstName} ${lastName}`.toUpperCase(),
      phone: faker.phone.number("01#########"),
      whatsapp: faker.phone.number("01#########"),
      lineapp: username,
      facebookprofile: `https://facebook.com/${username.toLowerCase()}`,
      guardianPhone: faker.phone.number("01#########"),
      email,
      dob: toIsoString(dob),
      gender,
      maritalStatus,
      nationality: "Bangladeshi",
      birth_place: faker.location.city(),
      bloodGroup: faker.helpers.arrayElement(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]),
      nationalId: faker.string.numeric(10),
      passportNo: `${faker.string.alpha({ length: 2, casing: "upper" })}${faker.string.numeric(7)}`,
      passportIssueDate: toIsoString(passportIssueDate),
      passportExpiryDate: toIsoString(passportExpiryDate),
      bc_date_of_registration: toIsoString(birthCertificateDate),
      bc_date_of_issuance: toIsoString(faker.date.between({ from: birthCertificateDate, to: new Date() })),
      occupation: faker.person.jobTitle(),
      spouseName: maritalStatus === "married" ? faker.person.fullName() : "",
      father_name_en: faker.person.fullName({ sex: "male" }),
      mother_name_en: faker.person.fullName({ sex: "female" }),
      sponsor_name_en: faker.person.fullName(),
      sponsor_relationship: faker.helpers.arrayElement(["Father", "Mother", "Brother", "Uncle"]),
      emergencyContact: faker.person.fullName(),
      emergencyPhone: faker.phone.number("01#########"),
      permanentAddress,
      currentAddressSameAsPermanent,
      currentAddress,
      employment: [
        {
          companyName: faker.company.name(),
          address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
          position: faker.person.jobTitle(),
          startDate: toIsoString(companyStartDate),
          endDate: toIsoString(companyEndDate),
        },
      ],
      languageTest: [
        {
          examType: "JLPT",
          level: faker.helpers.arrayElement(["N5", "N4", "N3"]),
          examDate: toIsoString(examDate),
          score: String(faker.number.int({ min: 80, max: 170 })),
          result: faker.helpers.arrayElement(["Pass", "Pending"]),
        },
      ],
      visaType: faker.helpers.arrayElement(["Student Visa", "Language Student"]),
      country: "Japan",
      schoolName: faker.helpers.arrayElement([
        "Tokyo International Language Academy",
        "Osaka Japanese Institute",
        "Kyoto Language Center",
      ]),
      intake: `${faker.helpers.arrayElement(["April", "July", "October"])} ${intakeYear}`,
      expectedIntake: `${faker.helpers.arrayElement(["April", "July", "October"])} ${intakeYear}`,
      source: faker.helpers.arrayElement(["Facebook", "Referral", "Walk-in", "Website"]),
      status: faker.helpers.arrayElement(["New Lead", "Processing", "Applied"]),
      applicationType: faker.helpers.arrayElement(["University", "Language School"]),
      studentType,
      edu_ssc_school: `${faker.location.city()} High School`,
      edu_ssc_board: faker.helpers.arrayElement(["Dhaka", "Rajshahi", "Cumilla", "Chattogram"]),
      edu_ssc_subject: faker.helpers.arrayElement(["Science", "Business Studies", "Humanities"]),
      edu_ssc_year: sscYear,
      edu_ssc_months: 12,
      edu_hsc_school: `${faker.location.city()} College`,
      edu_hsc_board: faker.helpers.arrayElement(["Dhaka", "Rajshahi", "Cumilla", "Chattogram"]),
      edu_hsc_subject: faker.helpers.arrayElement(["Science", "Business Studies", "Humanities"]),
      edu_hsc_year: hscYear,
      edu_hsc_months: 24,
      edu_hsc_expected_schedule_year: hscYear,
      edu_hsc_expected_schedule_months: 12,
      edu_hsc_exam_conducted_year: hscYear,
      edu_hsc_exam_conducted_months: 1,
      edu_bachelor_degree_subject: faker.helpers.arrayElement(["Computer Science", "Business Administration", "English"]),
      jp_study_institution: faker.helpers.arrayElement(["Mirai Japanese School", "Sakura Language Point"]),
      jp_study_institution_preferred: faker.helpers.arrayElement(["Nexus Japanese Language Academy", "Aim Education"]),
      jp_study_hours,
      jp_study_months,
      name_course: faker.helpers.arrayElement(["Bachelor Program", "Diploma Program"]),
      name_subject: faker.helpers.arrayElement(["Computer Science", "Accounting", "English"]),
      course_completion_year: completionYear,
      course_completion_month: completionMonth,
      course_under_institution: faker.helpers.arrayElement(["National University", "Private University"]),
      institution_board: faker.helpers.arrayElement(["Dhaka", "Rajshahi", "Cumilla", "Chattogram"]),
      institution_college: `${faker.location.city()} Government College`,
      institution_university: `${faker.location.city()} University`,
      institution_national_university: "National University",
      institution_private_university: `${faker.location.city()} Private University`,
      institution_dhaka_university: "University of Dhaka",
      docVariables: {},
      explanationChecks: {},
      googleDriveLink: faker.internet.url(),
      internalNotes: faker.lorem.sentences(2),
    };

    formik.setValues(autofillValues);
    window.localStorage.setItem(DEV_AUTOFILL_STORAGE_KEY, JSON.stringify(autofillValues));
  };

  const managedDocVariableKeys = new Set(Object.keys(derivedDocVariables).filter((key) => derivedDocVariables[key] !== undefined));
  const extraDocVariables = STUDENT_DOC_VARIABLES.filter(
    (variable) =>
      !managedDocVariableKeys.has(variable) &&
      !DUPLICATE_DOC_VARIABLE_PATTERNS.some((pattern) => variable.includes(pattern))
  );
  const activeExplanationConfigs = EXPLANATION_CONFIGS.filter((config) => formik.values.explanationChecks?.[config.id]);
  const renderDocVariableField = (variable: string, mode: "auto" | "plain" = "auto") => {
    const value = formik.values.docVariables?.[variable] || "";

    if (mode === "auto" && isLikelyDateVariable(variable)) {
      return (
        <DatePicker
          label={formatDocVariableLabel(variable)}
          value={value ? dayjs(value) : null}
          onChange={(dateValue) =>
            formik.setFieldValue("docVariables", {
              ...(formik.values.docVariables || {}),
              [variable]: dateValue?.format("YYYY-MM-DD") || "",
            })
          }
          slotProps={{ textField: { fullWidth: true } }}
        />
      );
    }

    if (isDatePartVariable(variable)) {
      return (
        <TextField
          fullWidth
          type="number"
          label={formatDocVariableLabel(variable)}
          value={value}
          onChange={(event) =>
            formik.setFieldValue("docVariables", {
              ...(formik.values.docVariables || {}),
              [variable]: event.target.value,
            })
          }
        />
      );
    }

    return (
      <TextField
        fullWidth
        multiline={isLikelyLongTextVariable(variable)}
        rows={isLikelyLongTextVariable(variable) ? 2 : undefined}
        label={formatDocVariableLabel(variable)}
        value={value}
        onChange={(event) =>
          formik.setFieldValue("docVariables", {
            ...(formik.values.docVariables || {}),
            [variable]: event.target.value,
          })
        }
      />
    );
  };
  const renderExtraSection = (section: string, title?: string) => {
    const variables = extraDocVariables.filter((variable) => getDocVariableSection(variable) === section);
    if (variables.length === 0) return null;

    return (
      <>
        <SectionLabel>{t(title || `${section} Extra`)}</SectionLabel>
        {variables.map((variable) => (
          <Grid key={variable} size={{ xs: 12, md: 6 }}>
            {renderDocVariableField(variable)}
          </Grid>
        ))}
      </>
    );
  };
  const renderVariableGroup = (title: string, variables: string[], mode: "auto" | "plain" = "auto") => {
    if (variables.length === 0) return null;

    return (
      <>
        <SectionLabel>{t(title)}</SectionLabel>
        {variables.map((variable) => (
          <Grid key={variable} size={{ xs: 12, md: 6 }}>
            {renderDocVariableField(variable, mode)}
          </Grid>
        ))}
      </>
    );
  };
  const educationExtraVariables = extraDocVariables.filter((variable) => getDocVariableSection(variable) === "Education");
  const japaneseStudyExtraVariables = extraDocVariables.filter((variable) => getDocVariableSection(variable) === "Japanese Study");
  const sscExtraVariables = educationExtraVariables.filter((variable) => variable.includes("edu_ssc"));
  const hscExtraVariables = educationExtraVariables.filter((variable) => variable.includes("edu_hsc"));
  const bachelorExtraVariables = educationExtraVariables.filter(
    (variable) =>
      variable.includes("edu_bachelor") ||
      variable.includes("course_") ||
      variable.includes("institution_") ||
      variable.includes("reason of") ||
      variable.includes("edu_gap") ||
      variable.includes("adimission")
  );
  const otherEducationExtraVariables = educationExtraVariables.filter(
    (variable) =>
      !sscExtraVariables.includes(variable) &&
      !hscExtraVariables.includes(variable) &&
      !bachelorExtraVariables.includes(variable)
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="p-4">
        <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Box>
            <Typography variant="h1" component="h1" className="mb-0">
              {isEdit ? t("Edit Student") : t("Create Student")}
            </Typography>
            <Breadcrumbs>
              <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
              <Link to={`/${role}/students`}>{t("Students")}</Link>
              <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
            </Breadcrumbs>
          </Box>
          <Box className="flex items-center gap-2">
            {isDevCreate && (
              <Button variant="outlined" onClick={autofillDevStudent}>
                Dev Auto Fill
              </Button>
            )}
            <Button
              variant="text"
              color="grey"
              startIcon={<NiArrowLeft size="medium" />}
              onClick={() => navigate(`/${role}/students`)}
            >
              {t("Back to List")}
            </Button>
          </Box>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Card className="rounded-xl shadow-sm">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={(_event, value) => setTabValue(value)} variant="scrollable" scrollButtons="auto">
                <Tab label={t("Personal Information")} />
                <Tab label={t("Contact & Address")} />
                <Tab label={t("Family & Identity")} />
                <Tab label={t("Education")} />
                <Tab label={t("Employment")} />
                <Tab label={t("Study Info")} />
                <Tab label={t("Other")} />
              </Tabs>
            </Box>

            <CardContent>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Base Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      id="fullNameEn"
                      name="fullNameEn"
                      label={t("Full Name (English)")}
                      value={formik.values.fullNameEn}
                      onChange={formik.handleChange}
                      error={formik.touched.fullNameEn && Boolean(formik.errors.fullNameEn)}
                      helperText={formik.touched.fullNameEn && formik.errors.fullNameEn}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="name_bd" name="name_bd" label={t("Name (Bangla)")} value={formik.values.name_bd || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="nameKatakana" name="nameKatakana" label={t("Name (Katakana)")} value={formik.values.nameKatakana || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker
                      label={t("Date of Birth")}
                      value={formik.values.dob ? dayjs(formik.values.dob) : null}
                      onChange={(value) => formik.setFieldValue("dob", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true, error: formik.touched.dob && Boolean(formik.errors.dob), helperText: formik.touched.dob && (formik.errors.dob as string) } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth select id="gender" name="gender" label={t("Gender")} value={formik.values.gender || "male"} onChange={formik.handleChange}>
                      <MenuItem value="male">{t("Male")}</MenuItem>
                      <MenuItem value="female">{t("Female")}</MenuItem>
                      <MenuItem value="other">{t("Other")}</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth select id="maritalStatus" name="maritalStatus" label={t("Marital Status")} value={formik.values.maritalStatus || "single"} onChange={formik.handleChange}>
                      <MenuItem value="single">{t("Single")}</MenuItem>
                      <MenuItem value="married">{t("Married")}</MenuItem>
                      <MenuItem value="divorced">{t("Divorced")}</MenuItem>
                      <MenuItem value="widowed">{t("Widowed")}</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="birth_place" name="birth_place" label={t("Birth Place")} value={formik.values.birth_place || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="nationality" name="nationality" label={t("Nationality")} value={formik.values.nationality || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="bloodGroup" name="bloodGroup" label={t("Blood Group")} value={formik.values.bloodGroup || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="occupation" name="occupation" label={t("Occupation")} value={formik.values.occupation || ""} onChange={formik.handleChange} />
                  </Grid>
                  {renderExtraSection("Personal")}
                </Grid>
              )}

              {tabValue === 1 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Contact Details")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label={t("Email")}
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      id="phone"
                      name="phone"
                      label={t("Phone")}
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="whatsapp" name="whatsapp" label={t("WhatsApp")} value={formik.values.whatsapp || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="lineapp" name="lineapp" label={t("Line App")} value={formik.values.lineapp || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="facebookprofile" name="facebookprofile" label={t("Facebook Profile")} value={formik.values.facebookprofile || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="guardianPhone" name="guardianPhone" label={t("Guardian Phone")} value={formik.values.guardianPhone || ""} onChange={formik.handleChange} />
                  </Grid>

                  <SectionLabel>{t("Address")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth multiline rows={2} id="permanentAddress" name="permanentAddress" label={t("Permanent Address")} value={formik.values.permanentAddress || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    {!formik.values.currentAddressSameAsPermanent && (
                      <TextField fullWidth multiline rows={2} id="currentAddress" name="currentAddress" label={t("Current Address")} value={formik.values.currentAddress || ""} onChange={formik.handleChange} />
                    )}
                  </Grid>
                  <Grid size={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formik.values.currentAddressSameAsPermanent || false}
                          onChange={(event) => {
                            formik.setFieldValue("currentAddressSameAsPermanent", event.target.checked);
                            if (event.target.checked) {
                              formik.setFieldValue("currentAddress", formik.values.permanentAddress || "");
                            }
                          }}
                        />
                      }
                      label={t("Current address same as permanent")}
                    />
                  </Grid>
                </Grid>
              )}

              {tabValue === 2 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Family Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="father_name_en" name="father_name_en" label={t("Father Name (English)")} value={formik.values.father_name_en || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="mother_name_en" name="mother_name_en" label={t("Mother Name (English)")} value={formik.values.mother_name_en || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="spouseName" name="spouseName" label={t("Spouse Name")} value={formik.values.spouseName || ""} onChange={formik.handleChange} />
                  </Grid>

                  <SectionLabel>{t("Sponsor Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="sponsor_name_en" name="sponsor_name_en" label={t("Sponsor Name (English)")} value={formik.values.sponsor_name_en || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="sponsor_relationship" name="sponsor_relationship" label={t("Sponsor Relationship")} value={formik.values.sponsor_relationship || ""} onChange={formik.handleChange} />
                  </Grid>

                  <SectionLabel>{t("Emergency & Identity")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="emergencyContact" name="emergencyContact" label={t("Emergency Contact Name")} value={formik.values.emergencyContact || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="emergencyPhone" name="emergencyPhone" label={t("Emergency Phone")} value={formik.values.emergencyPhone || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="nationalId" name="nationalId" label={t("National ID")} value={formik.values.nationalId || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="passportNo" name="passportNo" label={t("Passport No")} value={formik.values.passportNo || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DatePicker label={t("Passport Issue Date")} value={formik.values.passportIssueDate ? dayjs(formik.values.passportIssueDate) : null} onChange={(value) => formik.setFieldValue("passportIssueDate", value?.toISOString() || undefined)} slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DatePicker label={t("Passport Expiry Date")} value={formik.values.passportExpiryDate ? dayjs(formik.values.passportExpiryDate) : null} onChange={(value) => formik.setFieldValue("passportExpiryDate", value?.toISOString() || undefined)} slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DatePicker label={t("Birth Certificate Registration Date")} value={formik.values.bc_date_of_registration ? dayjs(formik.values.bc_date_of_registration) : null} onChange={(value) => formik.setFieldValue("bc_date_of_registration", value?.toISOString() || undefined)} slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <DatePicker label={t("Birth Certificate Issue Date")} value={formik.values.bc_date_of_issuance ? dayjs(formik.values.bc_date_of_issuance) : null} onChange={(value) => formik.setFieldValue("bc_date_of_issuance", value?.toISOString() || undefined)} slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  {renderExtraSection("Family")}
                  {renderExtraSection("Sponsor")}
                  {renderExtraSection("Identity")}
                </Grid>
              )}

              {tabValue === 3 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("SSC Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="edu_ssc_school" name="edu_ssc_school" label={t("SSC School")} value={formik.values.edu_ssc_school || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="edu_ssc_board" name="edu_ssc_board" label={t("SSC Board")} value={formik.values.edu_ssc_board || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="edu_ssc_subject" name="edu_ssc_subject" label={t("SSC Subject")} value={formik.values.edu_ssc_subject || ""} onChange={formik.handleChange} />
                  </Grid>
                  {isEdit && (
                    <>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth type="number" id="edu_ssc_year" name="edu_ssc_year" label={t("SSC Year")} value={formik.values.edu_ssc_year || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth type="number" id="edu_ssc_months" name="edu_ssc_months" label={t("SSC Duration (Months)")} value={formik.values.edu_ssc_months || ""} onChange={formik.handleChange} />
                      </Grid>
                    </>
                  )}
                  {renderVariableGroup("SSC Variables", sscExtraVariables, "plain")}

                  <SectionLabel>{t("HSC Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="edu_hsc_school" name="edu_hsc_school" label={t("HSC School")} value={formik.values.edu_hsc_school || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="edu_hsc_board" name="edu_hsc_board" label={t("HSC Board")} value={formik.values.edu_hsc_board || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="edu_hsc_subject" name="edu_hsc_subject" label={t("HSC Subject")} value={formik.values.edu_hsc_subject || ""} onChange={formik.handleChange} />
                  </Grid>
                  {isEdit && (
                    <>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth type="number" id="edu_hsc_year" name="edu_hsc_year" label={t("HSC Year")} value={formik.values.edu_hsc_year || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth type="number" id="edu_hsc_months" name="edu_hsc_months" label={t("HSC Duration (Months)")} value={formik.values.edu_hsc_months || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth type="number" id="edu_hsc_expected_schedule_year" name="edu_hsc_expected_schedule_year" label={t("HSC Expected Year")} value={formik.values.edu_hsc_expected_schedule_year || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth type="number" id="edu_hsc_expected_schedule_months" name="edu_hsc_expected_schedule_months" label={t("HSC Expected Month Count")} value={formik.values.edu_hsc_expected_schedule_months || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth type="number" id="edu_hsc_exam_conducted_year" name="edu_hsc_exam_conducted_year" label={t("HSC Exam Conducted Year")} value={formik.values.edu_hsc_exam_conducted_year || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth type="number" id="edu_hsc_exam_conducted_months" name="edu_hsc_exam_conducted_months" label={t("HSC Exam Conducted Month Count")} value={formik.values.edu_hsc_exam_conducted_months || ""} onChange={formik.handleChange} />
                      </Grid>
                    </>
                  )}
                  {renderVariableGroup("HSC Variables", hscExtraVariables, "plain")}

                  <SectionLabel>{t("Bachelor / Degree")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="edu_bachelor_degree_subject" name="edu_bachelor_degree_subject" label={t("Degree Subject")} value={formik.values.edu_bachelor_degree_subject || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="name_course" name="name_course" label={t("Course Name")} value={formik.values.name_course || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="name_subject" name="name_subject" label={t("Subject Name")} value={formik.values.name_subject || ""} onChange={formik.handleChange} />
                  </Grid>
                  {isEdit && (
                    <>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth type="number" id="course_completion_year" name="course_completion_year" label={t("Course Completion Year")} value={formik.values.course_completion_year || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth type="number" id="course_completion_month" name="course_completion_month" label={t("Course Completion Month")} value={formik.values.course_completion_month || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField fullWidth id="course_under_institution" name="course_under_institution" label={t("Course Under Institution")} value={formik.values.course_under_institution || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth id="institution_board" name="institution_board" label={t("Institution Board")} value={formik.values.institution_board || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth id="institution_college" name="institution_college" label={t("Institution College")} value={formik.values.institution_college || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth id="institution_university" name="institution_university" label={t("Institution University")} value={formik.values.institution_university || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth id="institution_national_university" name="institution_national_university" label={t("National University")} value={formik.values.institution_national_university || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth id="institution_private_university" name="institution_private_university" label={t("Private University")} value={formik.values.institution_private_university || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth id="institution_dhaka_university" name="institution_dhaka_university" label={t("Dhaka University")} value={formik.values.institution_dhaka_university || ""} onChange={formik.handleChange} />
                      </Grid>
                    </>
                  )}
                  {renderVariableGroup("Bachelor / Degree Variables", bachelorExtraVariables, "plain")}
                  {renderVariableGroup("Other Education Variables", otherEducationExtraVariables, "plain")}

                  <SectionLabel>{t("Japanese Study")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="jp_study_institution" name="jp_study_institution" label={t("Japanese Study Institution")} value={formik.values.jp_study_institution || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="jp_study_institution_preferred" name="jp_study_institution_preferred" label={t("Preferred Japanese Study Institution")} value={formik.values.jp_study_institution_preferred || ""} onChange={formik.handleChange} />
                  </Grid>
                  {isEdit && (
                    <>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth type="number" id="jp_study_hours" name="jp_study_hours" label={t("Japanese Study Hours")} value={formik.values.jp_study_hours || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth type="number" id="jp_study_months" name="jp_study_months" label={t("Japanese Study Months")} value={formik.values.jp_study_months || ""} onChange={formik.handleChange} />
                      </Grid>
                    </>
                  )}
                  {renderVariableGroup("Japanese Study Variables", japaneseStudyExtraVariables, "plain")}

                  {isEdit && (
                    <>
                      <SectionLabel>{t("Language Tests")}</SectionLabel>
                      <Grid size={12}>
                        <Box className="flex justify-between items-center mb-4">
                          <Typography variant="h6">{t("Language Tests")}</Typography>
                          <Button startIcon={<NiPlus size="medium" />} onClick={addLanguageTest}>
                            {t("Add")}
                          </Button>
                        </Box>
                        {(formik.values.languageTest || []).map((item, index) => (
                          <Box key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-background-neutral/5">
                            <Box className="flex justify-between items-center mb-3">
                              <Typography variant="subtitle2">{t("Language Test")} #{index + 1}</Typography>
                              <IconButton color="error" size="small" onClick={() => removeLanguageTest(index)}>
                                <NiBinEmpty size="medium" />
                              </IconButton>
                            </Box>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, md: 4 }}>
                                <TextField fullWidth label={t("Exam Type")} name={`languageTest.${index}.examType`} value={item.examType || ""} onChange={formik.handleChange} />
                              </Grid>
                              <Grid size={{ xs: 12, md: 4 }}>
                                <TextField fullWidth label={t("Level")} name={`languageTest.${index}.level`} value={item.level || ""} onChange={formik.handleChange} />
                              </Grid>
                              <Grid size={{ xs: 12, md: 4 }}>
                                <DatePicker label={t("Exam Date")} value={item.examDate ? dayjs(item.examDate) : null} onChange={(value) => formik.setFieldValue(`languageTest.${index}.examDate`, value?.toISOString() || undefined)} slotProps={{ textField: { fullWidth: true } }} />
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth label={t("Score")} name={`languageTest.${index}.score`} value={item.score || ""} onChange={formik.handleChange} />
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <TextField fullWidth select label={t("Result")} name={`languageTest.${index}.result`} value={item.result || ""} onChange={formik.handleChange}>
                                  <MenuItem value="">{t("Select")}</MenuItem>
                                  <MenuItem value="Pass">{t("Pass")}</MenuItem>
                                  <MenuItem value="Fail">{t("Fail")}</MenuItem>
                                  <MenuItem value="Pending">{t("Pending")}</MenuItem>
                                </TextField>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </Grid>
                    </>
                  )}
                </Grid>
              )}

              {tabValue === 4 && (
                <Box>
                  <Box className="flex justify-between items-center mb-4">
                    <Typography variant="h6">{t("Employment History")}</Typography>
                    <Button startIcon={<NiPlus size="medium" />} onClick={addEmployment}>
                      {t("Add Employment")}
                    </Button>
                  </Box>
                  {(formik.values.employment || []).length === 0 && (
                    <Typography variant="body2" color="textSecondary" className="text-center py-8">
                      {t("No employment records added yet")}
                    </Typography>
                  )}
                  {formik.values.employment?.map((emp, index) => (
                    <Box key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-background-neutral/5">
                      <Box className="flex justify-between items-center mb-3">
                        <Typography variant="subtitle2">{t("Employment")} #{index + 1}</Typography>
                        <IconButton color="error" size="small" onClick={() => removeEmployment(index)}>
                          <NiBinEmpty size="medium" />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField fullWidth label={t("Company Name")} name={`employment.${index}.companyName`} value={emp.companyName || ""} onChange={formik.handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField fullWidth label={t("Position")} name={`employment.${index}.position`} value={emp.position || ""} onChange={formik.handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField fullWidth label={t("Address")} name={`employment.${index}.address`} value={emp.address || ""} onChange={formik.handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <DatePicker label={t("Start Date")} value={emp.startDate ? dayjs(emp.startDate) : null} onChange={(value) => formik.setFieldValue(`employment.${index}.startDate`, value?.toISOString() || undefined)} slotProps={{ textField: { fullWidth: true } }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <DatePicker label={t("End Date")} value={emp.endDate ? dayjs(emp.endDate) : null} onChange={(value) => formik.setFieldValue(`employment.${index}.endDate`, value?.toISOString() || undefined)} slotProps={{ textField: { fullWidth: true } }} />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                  <Grid container spacing={3}>
                    {renderExtraSection("Work")}
                  </Grid>
                </Box>
              )}

              {tabValue === 5 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Study Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth select id="studentType" name="studentType" label={t("Student Type")} value={formik.values.studentType || "own"} onChange={formik.handleChange}>
                      <MenuItem value="own">{t("Own")}</MenuItem>
                      <MenuItem value="partner">{t("Partner")}</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="visaType" name="visaType" label={t("Visa Type")} value={formik.values.visaType || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="status" name="status" label={t("Status")} value={formik.values.status || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="country" name="country" label={t("Country")} value={formik.values.country || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="schoolName" name="schoolName" label={t("School Name")} value={formik.values.schoolName || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="intake" name="intake" label={t("Intake")} value={formik.values.intake || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="expectedIntake" name="expectedIntake" label={t("Expected Intake")} value={formik.values.expectedIntake || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="source" name="source" label={t("Source")} value={formik.values.source || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="applicationType" name="applicationType" label={t("Application Type")} value={formik.values.applicationType || ""} onChange={formik.handleChange} />
                  </Grid>
                  {renderExtraSection("Destination")}

                  {activeExplanationConfigs.length > 0 && (
                    <Grid size={12}>
                      <Typography variant="body2" color="textSecondary">
                        {t("Selected explanations add doc-only inputs below.")}
                      </Typography>
                    </Grid>
                  )}

                  <SectionLabel>{t("Explanations")}</SectionLabel>
                  {EXPLANATION_CONFIGS.map((config) => {
                    const isChecked = Boolean(formik.values.explanationChecks?.[config.id]);
                    const explanationVariables = config.variables.filter(
                      (variable) => !managedDocVariableKeys.has(variable) || Boolean(formik.values.docVariables?.[variable])
                    );

                    return (
                      <Grid key={config.id} size={12}>
                        <Box className="border border-gray-200 rounded-lg p-4 bg-background-paper">
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isChecked}
                                onChange={(event) =>
                                  formik.setFieldValue("explanationChecks", {
                                    ...(formik.values.explanationChecks || {}),
                                    [config.id]: event.target.checked,
                                  })
                                }
                              />
                            }
                            label={config.label}
                          />

                          {isChecked && (
                            <Box className="mt-3">
                              {explanationVariables.length === 0 ? (
                                <Typography variant="body2" color="textSecondary" className="ms-9">
                                  {t("This explanation uses common student fields only. No extra input needed here.")}
                                </Typography>
                              ) : (
                                <Grid container spacing={2}>
                                  {explanationVariables.map((variable) => (
                                    <Grid key={`${config.id}-${variable}`} size={{ xs: 12, md: 6 }}>
                                      {renderDocVariableField(variable)}
                                    </Grid>
                                  ))}
                                </Grid>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}

                  {isEdit && (
                    <>
                      <SectionLabel>{t("Japanese Exam Variables")}</SectionLabel>
                      {STUDENT_DOC_EXAM_VARIABLES.map((variable) => (
                        <Grid key={variable} size={{ xs: 12, md: 6 }}>
                          {renderDocVariableField(variable)}
                        </Grid>
                      ))}
                    </>
                  )}
                </Grid>
              )}

              {tabValue === 6 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Links & Notes")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="googleDriveLink" name="googleDriveLink" label={t("Google Drive Link")} value={formik.values.googleDriveLink || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth multiline rows={4} id="internalNotes" name="internalNotes" label={t("Internal Notes")} value={formik.values.internalNotes || ""} onChange={formik.handleChange} />
                  </Grid>
                  {renderExtraSection("Other")}
                </Grid>
              )}
            </CardContent>

            <Divider />
            <Box className="p-4 flex justify-end gap-2">
              <Button color="grey" onClick={() => navigate(`/${role}/students`)}>
                {t("Cancel")}
              </Button>
              <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
                {loading ? t("Saving...") : t("Save Student")}
              </Button>
            </Box>
          </Card>
        </form>
      </Box>
    </LocalizationProvider>
  );
}
