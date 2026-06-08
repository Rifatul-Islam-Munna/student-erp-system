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
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

import { VisaApplicationService } from "@/services/visaApplicationService";
import { VisaApplication } from "@/types/visaApplication";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiPlus from "@/icons/nexture/ni-plus";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const STATUS_OPTIONS = [
  { value: "pending", label: "pending" },
  { value: "interview_scheduled", label: "interview_scheduled" },
  { value: "approved", label: "approved" },
  { value: "rejected", label: "rejected" },
  { value: "documents_requested", label: "documents_requested" },
  { value: "withdrawn", label: "withdrawn" },
];

const validationSchema = yup.object({
  passportNumber: yup.string().required("Passport Number is required"),
  visaType: yup.string().required("Visa Type is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>
      {children}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function VisaApplicationUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<VisaApplication>>({
    initialValues: {
      student: undefined,
      passportNumber: "",
      visaType: "",
      applicationDate: undefined,
      interviewDate: undefined,
      status: "pending",
      visaGrantDate: undefined,
      visaExpiryDate: undefined,
      notes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await VisaApplicationService.updateVisaApplication(id, values);
        } else {
          await VisaApplicationService.createVisaApplication(values);
        }
        navigate(`/${role}/visa-applications`);
      } catch (error) {
        console.error("Failed to save visa application", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchVisaApplication = async () => {
        try {
          const response = await VisaApplicationService.getVisaApplicationById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch visa application", error);
        }
      };
      fetchVisaApplication();
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
              {isEdit ? t("Edit Visa Application") : t("Create Visa Application")}
            </Typography>
            <Breadcrumbs>
              <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
              <Link to={`/${role}/visa-applications`}>{t("Visa Applications")}</Link>
              <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
            </Breadcrumbs>
          </Box>
          <Button
            variant="text"
            color="grey"
            startIcon={<NiArrowLeft size="medium" />}
            onClick={() => navigate(`/${role}/visa-applications`)}
          >
            {t("Back to List")}
          </Button>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Card className="rounded-xl shadow-sm">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                <Tab label={t("Application Details")} />
                <Tab label={t("Visa Information")} />
                <Tab label={t("Notes")} />
              </Tabs>
            </Box>

            <CardContent>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Basic Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="passportNumber" name="passportNumber" label={t("Passport Number")}
                      value={formik.values.passportNumber} onChange={formik.handleChange}
                      error={formik.touched.passportNumber && Boolean(formik.errors.passportNumber)}
                      helperText={formik.touched.passportNumber && formik.errors.passportNumber} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="visaType" name="visaType" label={t("Visa Type")}
                      value={formik.values.visaType || ""} onChange={formik.handleChange}
                      error={formik.touched.visaType && Boolean(formik.errors.visaType)}
                      helperText={formik.touched.visaType && formik.errors.visaType} />
                  </Grid>

                  <SectionLabel>{t("Dates")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker label={t("Application Date")}
                      value={formik.values.applicationDate ? dayjs(formik.values.applicationDate) : null}
                      onChange={(value) => formik.setFieldValue("applicationDate", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker label={t("Interview Date")}
                      value={formik.values.interviewDate ? dayjs(formik.values.interviewDate) : null}
                      onChange={(value) => formik.setFieldValue("interviewDate", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>

                  <SectionLabel>{t("Status")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth select id="status" name="status" label={t("Status")}
                      value={formik.values.status || "pending"} onChange={formik.handleChange}>
                      {STATUS_OPTIONS.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{t(option.label)}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Visa Dates")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker label={t("Visa Grant Date")}
                      value={formik.values.visaGrantDate ? dayjs(formik.values.visaGrantDate) : null}
                      onChange={(value) => formik.setFieldValue("visaGrantDate", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker label={t("Visa Expiry Date")}
                      value={formik.values.visaExpiryDate ? dayjs(formik.values.visaExpiryDate) : null}
                      onChange={(value) => formik.setFieldValue("visaExpiryDate", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                </Grid>
              )}

              {tabValue === 2 && (
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <TextField fullWidth multiline rows={6} id="notes" name="notes" label={t("Notes")}
                      value={formik.values.notes || ""} onChange={formik.handleChange} />
                  </Grid>
                </Grid>
              )}
            </CardContent>

            <Divider />
            <Box className="p-4 flex justify-end gap-2">
              <Button color="grey" onClick={() => navigate(`/${role}/visa-applications`)}>{t("Cancel")}</Button>
              <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
                {loading ? t("Saving...") : t("Save Application")}
              </Button>
            </Box>
          </Card>
        </form>
      </Box>
    </LocalizationProvider>
  );
}