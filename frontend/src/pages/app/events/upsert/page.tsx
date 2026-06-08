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
  Switch,
  FormControlLabel,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

import { EventService } from "@/services/eventService";
import { Event } from "@/types/event";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  title: yup.string().required("Title is required"),
  startDate: yup.string().required("Start date is required"),
});

export default function EventUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<Event>>({
    initialValues: {
      title: "",
      description: "",
      startDate: undefined,
      endDate: undefined,
      location: "",
      attendees: [],
      reminder: {
        enabled: false,
        time: 30,
        unit: "minutes",
      },
      status: "scheduled",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const submitData = {
          ...values,
          attendees: values.attendees?.filter(Boolean),
        };
        if (isEdit && id) {
          await EventService.updateEvent(id, submitData);
        } else {
          await EventService.createEvent(submitData);
        }
        navigate(`/${role}/events`);
      } catch (error) {
        console.error("Failed to save event", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchEvent = async () => {
        try {
          const response = await EventService.getEventById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch event", error);
        }
      };
      fetchEvent();
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
              {isEdit ? t("Edit Event") : t("Create Event")}
            </Typography>
            <Breadcrumbs>
              <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
              <Link to={`/${role}/events`}>{t("Events")}</Link>
              <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
            </Breadcrumbs>
          </Box>
          <Button variant="text" color="grey" startIcon={<NiArrowLeft size="medium" />} onClick={() => navigate(`/${role}/events`)}>
            {t("Back to List")}
          </Button>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Card className="rounded-xl shadow-sm">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={(_event, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
                <Tab label={t("Event Details")} />
                <Tab label={t("Attendees & Reminder")} />
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
                    <TextField fullWidth select id="status" name="status" label={t("Status")}
                      value={formik.values.status || "scheduled"} onChange={formik.handleChange}>
                      <MenuItem value="scheduled">{t("Scheduled")}</MenuItem>
                      <MenuItem value="ongoing">{t("Ongoing")}</MenuItem>
                      <MenuItem value="completed">{t("Completed")}</MenuItem>
                      <MenuItem value="cancelled">{t("Cancelled")}</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField fullWidth id="location" name="location" label={t("Location")}
                      value={formik.values.location || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DateTimePicker label={t("Start Date")}
                      value={formik.values.startDate ? dayjs(formik.values.startDate) : null}
                      onChange={(value) => formik.setFieldValue("startDate", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DateTimePicker label={t("End Date")}
                      value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
                      onChange={(value) => formik.setFieldValue("endDate", value?.toISOString() || undefined)}
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
                  <SectionLabel>{t("Attendees")}</SectionLabel>
                  <Grid size={12}>
                    <TextField fullWidth id="attendees" name="attendees" label={t("Attendees")}
                      value={formik.values.attendees?.join(", ") || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        formik.setFieldValue("attendees", value ? value.split(",").map(s => s.trim()).filter(Boolean) : []);
                      }}
                      helperText={t("Enter comma-separated attendee names or emails")}
                    />
                  </Grid>

                  <SectionLabel>{t("Reminder")}</SectionLabel>
                  <Grid size={12}>
                    <FormControlLabel control={
                      <Switch checked={formik.values.reminder?.enabled || false}
                        onChange={(e) => formik.setFieldValue("reminder.enabled", e.target.checked)} />
                    } label={t("Enable Reminder")} />
                  </Grid>
                  {formik.values.reminder?.enabled && (
                    <>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth type="number" id="reminder.time" name="reminder.time" label={t("Reminder Time")}
                          value={formik.values.reminder?.time || 30}
                          onChange={(e) => formik.setFieldValue("reminder.time", Number(e.target.value))}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth select id="reminder.unit" name="reminder.unit" label={t("Reminder Unit")}
                          value={formik.values.reminder?.unit || "minutes"} onChange={(e) => formik.setFieldValue("reminder.unit", e.target.value)}>
                          <MenuItem value="minutes">{t("Minutes")}</MenuItem>
                          <MenuItem value="hours">{t("Hours")}</MenuItem>
                          <MenuItem value="days">{t("Days")}</MenuItem>
                        </TextField>
                      </Grid>
                    </>
                  )}
                </Grid>
              )}
            </CardContent>

            <Divider />
            <Box className="p-4 flex justify-end gap-2">
              <Button color="grey" onClick={() => navigate(`/${role}/events`)}>{t("Cancel")}</Button>
              <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
                {loading ? t("Saving...") : t("Save Event")}
              </Button>
            </Box>
          </Card>
        </form>
      </Box>
    </LocalizationProvider>
  );
}