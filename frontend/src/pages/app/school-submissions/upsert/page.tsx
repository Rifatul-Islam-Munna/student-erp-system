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
  Divider,
  Breadcrumbs,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

import { SchoolSubmissionService } from "@/services/schoolSubmissionService";
import { SchoolSubmission } from "@/types/schoolSubmission";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  student: yup.string().required("Student is required"),
  school: yup.string().required("School is required"),
});

const applicationStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "deferred", label: "Deferred" },
];

const visaStatusOptions = [
  { value: "not_applied", label: "Not Applied" },
  { value: "applied", label: "Applied" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>
      {children}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function SchoolSubmissionUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<SchoolSubmission>>({
    initialValues: {
      student: "",
      school: "",
      applicationStatus: "",
      submittedDate: undefined,
      visaStatus: "",
      intake: "",
      scholarship: "",
      notes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await SchoolSubmissionService.updateSchoolSubmission(id, values);
        } else {
          await SchoolSubmissionService.createSchoolSubmission(values);
        }
        navigate(`/${role}/school-submissions`);
      } catch (error) {
        console.error("Failed to save school submission", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchSubmission = async () => {
        try {
          const response = await SchoolSubmissionService.getSchoolSubmissionById(id);
          if (response.success && response.data) {
            formik.setValues({
              ...formik.initialValues,
              ...response.data,
              submittedDate: response.data.submittedDate ? dayjs(response.data.submittedDate as string) : undefined,
            });
          }
        } catch (error) {
          console.error("Failed to fetch school submission", error);
        }
      };
      fetchSubmission();
    }
  }, [isEdit, id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="p-4">
        <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Box>
            <Typography variant="h1" component="h1" className="mb-0">
              {isEdit ? t("Edit School Submission") : t("Create School Submission")}
            </Typography>
            <Breadcrumbs>
              <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
              <Link to={`/${role}/school-submissions`}>{t("School Submissions")}</Link>
              <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
            </Breadcrumbs>
          </Box>
          <Box className="flex gap-2">
            <Button
              variant="surface"
              color="grey"
              startIcon={<NiArrowLeft size="medium" />}
              onClick={() => navigate(`/${role}/school-submissions`)}
            >
              {t("Cancel")}
            </Button>
            <Button
              variant="surface"
              color="primary"
              startIcon={<NiFloppyDisk size="medium" />}
              onClick={() => formik.handleSubmit()}
              disabled={loading}
            >
              {t("Save")}
            </Button>
          </Box>
        </Box>

        <Card className="rounded-xl shadow-sm">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
          >
            <Tab label={t("Basic Information")} />
            <Tab label={t("Additional Details")} />
          </Tabs>
          <CardContent>
            {tabValue === 0 && (
              <Grid container spacing={2}>
                <SectionLabel>{t("Basic Information")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label={t("Student")}
                    name="student"
                    value={formik.values.student}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.student && Boolean(formik.errors.student)}
                    helperText={formik.touched.student && formik.errors.student}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label={t("School")}
                    name="school"
                    value={formik.values.school}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.school && Boolean(formik.errors.school)}
                    helperText={formik.touched.school && formik.errors.school}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label={t("Application Status")}
                    name="applicationStatus"
                    value={formik.values.applicationStatus}
                    onChange={formik.handleChange}
                  >
                    {applicationStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{t(option.label)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label={t("Submitted Date")}
                    value={formik.values.submittedDate}
                    onChange={(newValue) => formik.setFieldValue("submittedDate", newValue)}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    label={t("Visa Status")}
                    name="visaStatus"
                    value={formik.values.visaStatus}
                    onChange={formik.handleChange}
                  >
                    {visaStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{t(option.label)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label={t("Intake")}
                    name="intake"
                    value={formik.values.intake}
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={2}>
                <SectionLabel>{t("Additional Details")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label={t("Scholarship")}
                    name="scholarship"
                    value={formik.values.scholarship}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label={t("Notes")}
                    name="notes"
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
}