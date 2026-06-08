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

import { TeacherService } from "@/services/teacherService";
import { Teacher } from "@/types/teacher";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  fullName: yup.string().required("Full Name is required"),
  phone: yup.string().required("Phone is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>
      {children}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function TeacherUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<Teacher>>({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      specialization: "",
      qualification: "",
      experience: undefined,
      salary: undefined,
      joinDate: undefined,
      status: "active",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await TeacherService.updateTeacher(id, values);
        } else {
          await TeacherService.createTeacher(values);
        }
        navigate(`/${role}/teachers`);
      } catch (error) {
        console.error("Failed to save teacher", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchTeacher = async () => {
        try {
          const response = await TeacherService.getTeacherById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch teacher", error);
        }
      };
      fetchTeacher();
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
              {isEdit ? t("Edit Teacher") : t("Create Teacher")}
            </Typography>
            <Breadcrumbs>
              <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
              <Link to={`/${role}/teachers`}>{t("Teachers")}</Link>
              <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
            </Breadcrumbs>
          </Box>
          <Button
            variant="text"
            color="grey"
            startIcon={<NiArrowLeft size="medium" />}
            onClick={() => navigate(`/${role}/teachers`)}
          >
            {t("Back to List")}
          </Button>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Card className="rounded-xl shadow-sm">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                <Tab label={t("Basic Information")} />
                <Tab label={t("Professional Details")} />
                <Tab label={t("Employment Details")} />
              </Tabs>
            </Box>

            <CardContent>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Personal Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="fullName" name="fullName" label={t("Full Name")}
                      value={formik.values.fullName} onChange={formik.handleChange}
                      error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                      helperText={formik.touched.fullName && formik.errors.fullName} />
                  </Grid>
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
                    <TextField fullWidth select id="status" name="status" label={t("Status")}
                      value={formik.values.status || "active"} onChange={formik.handleChange}>
                      <MenuItem value="active">{t("Active")}</MenuItem>
                      <MenuItem value="inactive">{t("Inactive")}</MenuItem>
                      <MenuItem value="on_leave">{t("On Leave")}</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Professional Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="specialization" name="specialization" label={t("Specialization")}
                      value={formik.values.specialization || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="qualification" name="qualification" label={t("Qualification")}
                      value={formik.values.qualification || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="experience" name="experience" label={t("Experience (Years)")}
                      type="number"
                      value={formik.values.experience || ""} onChange={formik.handleChange} />
                  </Grid>
                </Grid>
              )}

              {tabValue === 2 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Employment Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="salary" name="salary" label={t("Salary")}
                      type="number"
                      value={formik.values.salary || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker label={t("Join Date")}
                      value={formik.values.joinDate ? dayjs(formik.values.joinDate) : null}
                      onChange={(value) => formik.setFieldValue("joinDate", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                </Grid>
              )}
            </CardContent>

            <Divider />
            <Box className="p-4 flex justify-end gap-2">
              <Button color="grey" onClick={() => navigate(`/${role}/teachers`)}>{t("Cancel")}</Button>
              <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
                {loading ? t("Saving...") : t("Save Teacher")}
              </Button>
            </Box>
          </Card>
        </form>
      </Box>
    </LocalizationProvider>
  );
}