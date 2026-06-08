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

import { TaskService } from "@/services/taskService";
import { Task } from "@/types/task";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  title: yup.string().required("Title is required"),
});

export default function TaskUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<Task>>({
    initialValues: {
      title: "",
      description: "",
      assignedTo: "",
      dueDate: undefined,
      priority: "medium",
      status: "pending",
      relatedStudent: "",
      relatedVisitor: "",
      relatedBatch: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await TaskService.updateTask(id, values);
        } else {
          await TaskService.createTask(values);
        }
        navigate(`/${role}/tasks`);
      } catch (error) {
        console.error("Failed to save task", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchTask = async () => {
        try {
          const response = await TaskService.getTaskById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch task", error);
        }
      };
      fetchTask();
    }
  }, [isEdit, id]);

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <Grid size={12}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>{children}</Typography>
      <Divider sx={{ mt: 1 }} />
    </Grid>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="p-4">
        <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Box>
            <Typography variant="h1" component="h1" className="mb-0">
              {isEdit ? t("Edit Task") : t("Create Task")}
            </Typography>
            <Breadcrumbs>
              <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
              <Link to={`/${role}/tasks`}>{t("Tasks")}</Link>
              <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
            </Breadcrumbs>
          </Box>
          <Button variant="text" color="grey" startIcon={<NiArrowLeft size="medium" />} onClick={() => navigate(`/${role}/tasks`)}>
            {t("Back to List")}
          </Button>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Card className="rounded-xl shadow-sm">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={(_event, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
                <Tab label={t("Task Details")} />
                <Tab label={t("Related To")} />
              </Tabs>
            </Box>

            <CardContent>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Basic Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="title" name="title" label={t("Title")}
                      value={formik.values.title} onChange={formik.handleChange}
                      error={formik.touched.title && Boolean(formik.errors.title)}
                      helperText={formik.touched.title && formik.errors.title} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField fullWidth select id="priority" name="priority" label={t("Priority")}
                      value={formik.values.priority || "medium"} onChange={formik.handleChange}>
                      <MenuItem value="low">{t("Low")}</MenuItem>
                      <MenuItem value="medium">{t("Medium")}</MenuItem>
                      <MenuItem value="high">{t("High")}</MenuItem>
                      <MenuItem value="urgent">{t("Urgent")}</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField fullWidth select id="status" name="status" label={t("Status")}
                      value={formik.values.status || "pending"} onChange={formik.handleChange}>
                      <MenuItem value="pending">{t("Pending")}</MenuItem>
                      <MenuItem value="in_progress">{t("In Progress")}</MenuItem>
                      <MenuItem value="completed">{t("Completed")}</MenuItem>
                      <MenuItem value="cancelled">{t("Cancelled")}</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="assignedTo" name="assignedTo" label={t("Assigned To")}
                      value={formik.values.assignedTo || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker label={t("Due Date")}
                      value={formik.values.dueDate ? dayjs(formik.values.dueDate) : null}
                      onChange={(value) => formik.setFieldValue("dueDate", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  <Grid size={12}>
                    <TextField fullWidth multiline rows={4} id="description" name="description" label={t("Description")}
                      value={formik.values.description || ""} onChange={formik.handleChange} />
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Related To")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="relatedStudent" name="relatedStudent" label={t("Related Student")}
                      value={formik.values.relatedStudent || ""} onChange={formik.handleChange}
                      placeholder={t("Enter Student ID")} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="relatedVisitor" name="relatedVisitor" label={t("Related Visitor")}
                      value={formik.values.relatedVisitor || ""} onChange={formik.handleChange}
                      placeholder={t("Enter Visitor ID")} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth id="relatedBatch" name="relatedBatch" label={t("Related Batch")}
                      value={formik.values.relatedBatch || ""} onChange={formik.handleChange}
                      placeholder={t("Enter Batch ID")} />
                  </Grid>
                </Grid>
              )}
            </CardContent>

            <Divider />
            <Box className="p-4 flex justify-end gap-2">
              <Button color="grey" onClick={() => navigate(`/${role}/tasks`)}>{t("Cancel")}</Button>
              <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
                {loading ? t("Saving...") : t("Save Task")}
              </Button>
            </Box>
          </Card>
        </form>
      </Box>
    </LocalizationProvider>
  );
}