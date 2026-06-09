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
  Divider,
  Breadcrumbs,
  Avatar,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

import { BatchService } from "@/services/batchService";
import { Batch } from "@/types/batch";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  name: yup.string().required("Batch Name is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>
      {children}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function BatchUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<Batch>>({
    initialValues: {
      name: "",
      courseName: "",
      startDate: null,
      endDate: null,
      timing: "",
      status: "upcoming",
      maxStudents: undefined,
      enrolledStudents: undefined,
      fees: undefined,
      description: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const data: Record<string, any> = {
          batchName: values.name,
          startDate: values.startDate ? new Date(values.startDate as any) : undefined,
          endDate: values.endDate ? new Date(values.endDate as any) : undefined,
        };
        if (values.timing) data.classTime = values.timing;
        if (values.maxStudents) data.maxStudents = values.maxStudents;
        if (values.description) data.description = values.description;
        
        if (isEdit && id) {
          await BatchService.updateBatch(id, data);
        } else {
          await BatchService.createBatch(data);
        }
        navigate(`/${role}/batches`);
      } catch (error) {
        console.error("Failed to save batch", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchBatch = async () => {
        try {
          const response = await BatchService.getBatchById(id);
          if (response.success && response.data) {
            const batch = response.data;
            formik.setValues({
              ...formik.initialValues,
              name: batch.batchName || "",
              courseName: batch.courseName || "",
              timing: batch.classTime || "",
              status: batch.status || "upcoming",
              maxStudents: batch.maxStudents,
              enrolledStudents: batch.enrolledStudents,
              fees: batch.fees,
              description: batch.description || "",
              startDate: batch.startDate ? dayjs(batch.startDate) : null,
              endDate: batch.endDate ? dayjs(batch.endDate) : null,
            });
          }
        } catch (error) {
          console.error("Failed to fetch batch", error);
        }
      };
      fetchBatch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {isEdit ? t("Edit Batch") : t("Create Batch")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/batches`}>{t("Batches")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="text"
          color="grey"
          startIcon={<NiArrowLeft size="medium" />}
          onClick={() => navigate(`/${role}/batches`)}
        >
          {t("Back to List")}
        </Button>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Card className="rounded-xl shadow-sm">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label={t("Basic Information")} />
              <Tab label={t("Schedule")} />
              <Tab label={t("Additional Info")} />
            </Tabs>
          </Box>

          <CardContent>
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Batch Information")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="name"
                    name="name"
                    label={t("Batch Name")}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="courseName"
                    name="courseName"
                    label={t("Course Name")}
                    value={formik.values.courseName || ""}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <SectionLabel>{t("Status")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    id="status"
                    name="status"
                    label={t("Status")}
                    value={formik.values.status || "upcoming"}
                    onChange={formik.handleChange}
                    SelectProps={{ native: true }}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </TextField>
                </Grid>

                <SectionLabel>{t("Capacity")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="maxStudents"
                    name="maxStudents"
                    label={t("Max Students")}
                    type="number"
                    value={formik.values.maxStudents || ""}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="enrolledStudents"
                    name="enrolledStudents"
                    label={t("Enrolled Students")}
                    type="number"
                    value={formik.values.enrolledStudents || ""}
                    onChange={formik.handleChange}
                  />
                </Grid>

                <SectionLabel>{t("Fees")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="fees"
                    name="fees"
                    label={t("Fees")}
                    type="number"
                    value={formik.values.fees || ""}
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Batch Schedule")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={t("Start Date")}
                      value={formik.values.startDate}
                      onChange={(newValue) => formik.setFieldValue("startDate", newValue)}
                      slotProps={{ textField: { fullWidth: true, size: "small" } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={t("End Date")}
                      value={formik.values.endDate}
                      onChange={(newValue) => formik.setFieldValue("endDate", newValue)}
                      slotProps={{ textField: { fullWidth: true, size: "small" } }}
                    />
                  </LocalizationProvider>
                </Grid>

                <SectionLabel>{t("Timing")}</SectionLabel>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    id="timing"
                    name="timing"
                    label={t("Timing")}
                    value={formik.values.timing || ""}
                    onChange={formik.handleChange}
                    placeholder={t("e.g., Mon-Fri 9:00 AM - 12:00 PM")}
                  />
                </Grid>
              </Grid>
            )}

            {tabValue === 2 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Additional Information")}</SectionLabel>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    id="description"
                    name="description"
                    label={t("Description")}
                    value={formik.values.description || ""}
                    onChange={formik.handleChange}
                    placeholder={t("Enter batch description...")}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>

          <Divider />
          <Box className="p-4 flex justify-end gap-2">
            <Button color="grey" onClick={() => navigate(`/${role}/batches`)}>{t("Cancel")}</Button>
            <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
              {loading ? t("Saving...") : t("Save Batch")}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}