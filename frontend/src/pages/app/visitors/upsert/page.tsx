import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Tabs,
  Tab,
  MenuItem,
  IconButton,
  Divider,
  Breadcrumbs,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

import { VisitorService } from "@/services/visitorService";
import { Visitor } from "@/types/visitor";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiPlus from "@/icons/nexture/ni-plus";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

const validationSchema = yup.object({
  fullName: yup.string().required("Full Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone is required"),
  dateOfBirth: yup.date().required("Date of Birth is required"),
  gender: yup.string().oneOf(["male", "female", "other"]).required("Gender is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>{children}</Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

const buildVisitorPayload = (values: Partial<Visitor>): Partial<Visitor> => ({
  ...(() => {
    const { _id, __v, createdAt, updatedAt, ...payload } = values as Partial<Visitor> & { __v?: number };
    return payload;
  })(),
  fullName: values.fullName || "",
  dateOfBirth: values.dateOfBirth,
  phone: values.phone || "",
  guardianPhone: values.guardianPhone || "",
  email: values.email || "",
  address: values.address || "",
  gender: values.gender || "male",
  education: (values.education || []).map(({ _id, ...edu }) => edu),
  JapaneseTest: values.JapaneseTest
    ? {
        hasCertificate: values.JapaneseTest.hasCertificate || false,
        examType: values.JapaneseTest.examType || "",
        level: values.JapaneseTest.level || "",
        score: values.JapaneseTest.score || "",
      }
    : { hasCertificate: false },
  visaType: values.visaType || "",
  preferredCountry: values.preferredCountry || [],
  intake: values.intake || "",
  BudgetConcerned: values.BudgetConcerned || false,
  branch: typeof values.branch === "object" ? values.branch?._id || "" : values.branch || "",
  school: typeof values.school === "object" ? values.school?._id || "" : values.school || "",
  partnerAgency: typeof values.partnerAgency === "object" ? values.partnerAgency?._id || "" : values.partnerAgency || "",
  source: values.source || "",
  counselor: values.counselor || "",
  courseType: values.courseType || "",
  courseName: values.courseName || "",
  preferredDate: values.preferredDate,
  counselingNote: values.counselingNote || "",
  status: values.status || "new",
  leadScore: values.leadScore,
  leadCategory: values.leadCategory,
  followUpDates: values.followUpDates,
  lastFollowUp: values.lastFollowUp,
  nextFollowUp: values.nextFollowUp,
});

export default function VisitorUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<Visitor>>({
    initialValues: {
      fullName: "",
      dateOfBirth: undefined,
      phone: "",
      guardianPhone: "",
      email: "",
      address: "",
      gender: "male",
      education: [],
      JapaneseTest: { hasCertificate: false },
      visaType: "",
      preferredCountry: [],
      intake: "",
      BudgetConcerned: false,
      source: "",
      counselor: "",
      courseType: "",
      courseName: "",
      preferredDate: undefined,
      counselingNote: "",
      status: "new",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = buildVisitorPayload(values);
        if (isEdit && id) {
          await VisitorService.updateVisitor(id, payload);
        } else {
          await VisitorService.createVisitor(payload);
        }
        navigate(`/${role}/visitors`);
      } catch (error) {
        console.error("Failed to save visitor", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchVisitor = async () => {
        try {
          const response = await VisitorService.getVisitorById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch visitor", error);
        }
      };
      fetchVisitor();
    }
  }, [isEdit, id]);

  const addEducation = () => {
    const education = formik.values.education || [];
    formik.setFieldValue("education", [...education, { examName: "", year: "", board: "", gpa: 0, groupSubject: "" }]);
  };
  const removeEducation = (index: number) => {
    const education = [...(formik.values.education || [])];
    education.splice(index, 1);
    formik.setFieldValue("education", education);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="p-4">
        <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Box>
            <Typography variant="h1" component="h1" className="mb-0">
              {isEdit ? t("Edit Visitor") : t("Create Visitor")}
            </Typography>
            <Breadcrumbs>
              <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
              <Link to={`/${role}/visitors`}>{t("Visitors")}</Link>
              <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
            </Breadcrumbs>
          </Box>
          <Button variant="text" color="grey" startIcon={<NiArrowLeft size="medium" />} onClick={() => navigate(`/${role}/visitors`)}>
            {t("Back to List")}
          </Button>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Card className="rounded-xl shadow-sm">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={(_event, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
                <Tab label={t("Personal Information")} />
                <Tab label={t("Contact & Address")} />
                <Tab label={t("Education")} />
                <Tab label={t("Visa & Course")} />
                <Tab label={t("Lead Info")} />
              </Tabs>
            </Box>

            <CardContent>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Basic Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="fullName" name="fullName" label={t("Full Name")}
                      value={formik.values.fullName} onChange={formik.handleChange}
                      error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                      helperText={formik.touched.fullName && formik.errors.fullName} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker label={t("Date of Birth")}
                      value={formik.values.dateOfBirth ? dayjs(formik.values.dateOfBirth) : null}
                      onChange={(value) => formik.setFieldValue("dateOfBirth", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true, error: formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth), helperText: formik.touched.dateOfBirth && (formik.errors.dateOfBirth as string) } }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth select id="gender" name="gender" label={t("Gender")}
                      value={formik.values.gender || "male"} onChange={formik.handleChange}>
                      <MenuItem value="male">{t("Male")}</MenuItem>
                      <MenuItem value="female">{t("Female")}</MenuItem>
                      <MenuItem value="other">{t("Other")}</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Contact Details")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="email" name="email" label={t("Email")}
                      value={formik.values.email} onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="phone" name="phone" label={t("Phone")}
                      value={formik.values.phone} onChange={formik.handleChange}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="guardianPhone" name="guardianPhone" label={t("Guardian Phone")}
                      value={formik.values.guardianPhone || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth multiline rows={2} id="address" name="address" label={t("Address")}
                      value={formik.values.address || ""} onChange={formik.handleChange} />
                  </Grid>
                </Grid>
              )}

              {tabValue === 2 && (
                <Box>
                  <Box className="flex justify-between items-center mb-4">
                    <Typography variant="h6">{t("Education History")}</Typography>
                    <Button startIcon={<NiPlus size="medium" />} onClick={addEducation}>{t("Add Education")}</Button>
                  </Box>
                  {(formik.values.education || []).length === 0 && (
                    <Typography variant="body2" color="textSecondary" className="text-center py-8">{t("No education records added yet")}</Typography>
                  )}
                  {formik.values.education?.map((edu, index) => (
                    <Box key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-background-neutral/5">
                      <Box className="flex justify-between items-center mb-3">
                        <Typography variant="subtitle2">{t("Education")} #{index + 1}</Typography>
                        <IconButton color="error" size="small" onClick={() => removeEducation(index)}><NiBinEmpty size="medium" /></IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label={t("Exam Name")} name={`education.${index}.examName`} value={edu.examName || ""} onChange={formik.handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label={t("Year")} name={`education.${index}.year`} value={edu.year || ""} onChange={formik.handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label={t("Board")} name={`education.${index}.board`} value={edu.board || ""} onChange={formik.handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label={t("GPA")} name={`education.${index}.gpa`} type="number" value={edu.gpa || ""} onChange={formik.handleChange} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label={t("Group/Subject")} name={`education.${index}.groupSubject`} value={edu.groupSubject || ""} onChange={formik.handleChange} />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}

              {tabValue === 3 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Visa Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="visaType" name="visaType" label={t("Visa Type")}
                      value={formik.values.visaType || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="intake" name="intake" label={t("Intake")}
                      value={formik.values.intake || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="source" name="source" label={t("Source")}
                      value={formik.values.source || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="counselor" name="counselor" label={t("Counselor")}
                      value={formik.values.counselor || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="courseType" name="courseType" label={t("Course Type")}
                      value={formik.values.courseType || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="courseName" name="courseName" label={t("Course Name")}
                      value={formik.values.courseName || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={12}>
                    <FormControlLabel control={
                      <Checkbox checked={formik.values.BudgetConcerned || false}
                        onChange={(e) => formik.setFieldValue("BudgetConcerned", e.target.checked)} />
                    } label={t("Budget Concerned")} />
                  </Grid>
                  <SectionLabel>{t("Japanese Test")}</SectionLabel>
                  <Grid size={12}>
                    <FormControlLabel control={
                      <Checkbox checked={formik.values.JapaneseTest?.hasCertificate || false}
                        onChange={(e) => formik.setFieldValue("JapaneseTest.hasCertificate", e.target.checked)} />
                    } label={t("Has Certificate")} />
                  </Grid>
                  {formik.values.JapaneseTest?.hasCertificate && (
                    <>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth id="JapaneseTest.examType" name="JapaneseTest.examType" label={t("Exam Type")}
                          value={formik.values.JapaneseTest?.examType || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth id="JapaneseTest.level" name="JapaneseTest.level" label={t("Level")}
                          value={formik.values.JapaneseTest?.level || ""} onChange={formik.handleChange} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth id="JapaneseTest.score" name="JapaneseTest.score" label={t("Score")}
                          value={formik.values.JapaneseTest?.score || ""} onChange={formik.handleChange} />
                      </Grid>
                    </>
                  )}
                </Grid>
              )}

              {tabValue === 4 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Lead Status")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth select id="status" name="status" label={t("Status")}
                      value={formik.values.status || "new"} onChange={formik.handleChange}>
                      <MenuItem value="new">{t("New")}</MenuItem>
                      <MenuItem value="contacted">{t("Contacted")}</MenuItem>
                      <MenuItem value="interested">{t("Interested")}</MenuItem>
                      <MenuItem value="follow_up">{t("Follow Up")}</MenuItem>
                      <MenuItem value="converted">{t("Converted")}</MenuItem>
                      <MenuItem value="lost">{t("Lost")}</MenuItem>
                      <MenuItem value="inactive">{t("Inactive")}</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="leadScore" name="leadScore" label={t("Lead Score")} type="number"
                      value={formik.values.leadScore || 0} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker label={t("Preferred Date")}
                      value={formik.values.preferredDate ? dayjs(formik.values.preferredDate) : null}
                      onChange={(value) => formik.setFieldValue("preferredDate", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth multiline rows={3} id="counselingNote" name="counselingNote" label={t("Counseling Note")}
                      value={formik.values.counselingNote || ""} onChange={formik.handleChange} />
                  </Grid>
                </Grid>
              )}
            </CardContent>

            <Divider />
            <Box className="p-4 flex justify-end gap-2">
              <Button color="grey" onClick={() => navigate(`/${role}/visitors`)}>{t("Cancel")}</Button>
              <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
                {loading ? t("Saving...") : t("Save Visitor")}
              </Button>
            </Box>
          </Card>
        </form>
      </Box>
    </LocalizationProvider>
  );
}
