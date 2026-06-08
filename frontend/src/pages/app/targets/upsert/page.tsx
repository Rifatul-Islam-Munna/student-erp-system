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
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

import { TargetService } from "@/services/targetService";
import { Target } from "@/types/target";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  user: yup.string().required("User is required"),
  type: yup.string().required("Target type is required"),
  targetAmount: yup.number().positive("Target amount must be positive").required("Target amount is required"),
  achievedAmount: yup.number().min(0, "Achieved amount cannot be negative").default(0),
  period: yup.string().oneOf(["monthly", "yearly"]).required("Period is required"),
  startDate: yup.date().required("Start date is required"),
  endDate: yup.date().required("End date is required"),
  status: yup.string().oneOf(["active", "completed", "cancelled", "expired"]).required("Status is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>{children}</Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function TargetUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<Target>>({
    initialValues: {
      user: "",
      type: "",
      targetAmount: 0,
      achievedAmount: 0,
      period: "monthly",
      startDate: undefined,
      endDate: undefined,
      status: "active",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await TargetService.updateTarget(id, values);
        } else {
          await TargetService.createTarget(values);
        }
        navigate(`/${role}/targets`);
      } catch (error) {
        console.error("Failed to save target", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchTarget = async () => {
        try {
          const response = await TargetService.getTargetById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch target", error);
        }
      };
      fetchTarget();
    }
  }, [isEdit, id]);

  const achievementPercentage = formik.values.targetAmount > 0
    ? ((formik.values.achievedAmount || 0) / formik.values.targetAmount) * 100
    : 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="p-4">
        <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Box>
            <Typography variant="h1" component="h1" className="mb-0">
              {isEdit ? t("Edit Target") : t("Create Target")}
            </Typography>
            <Breadcrumbs>
              <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
              <Link to={`/${role}/targets`}>{t("Targets")}</Link>
              <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
            </Breadcrumbs>
          </Box>
          <Button variant="text" color="grey" startIcon={<NiArrowLeft size="medium" />} onClick={() => navigate(`/${role}/targets`)}>
            {t("Back to List")}
          </Button>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Card className="rounded-xl shadow-sm">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={(_event, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
                <Tab label={t("Basic Information")} />
                <Tab label={t("Period & Dates")} />
                <Tab label={t("Progress")} />
              </Tabs>
            </Box>

            <CardContent>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Target Details")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="user" name="user" label={t("User")}
                      value={formik.values.user} onChange={formik.handleChange}
                      error={formik.touched.user && Boolean(formik.errors.user)}
                      helperText={formik.touched.user && formik.errors.user} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="type" name="type" label={t("Target Type")}
                      value={formik.values.type} onChange={formik.handleChange}
                      error={formik.touched.type && Boolean(formik.errors.type)}
                      helperText={formik.touched.type && formik.errors.type} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="targetAmount" name="targetAmount" label={t("Target Amount")} type="number"
                      value={formik.values.targetAmount} onChange={formik.handleChange}
                      error={formik.touched.targetAmount && Boolean(formik.errors.targetAmount)}
                      helperText={formik.touched.targetAmount && formik.errors.targetAmount} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth select id="status" name="status" label={t("Status")}
                      value={formik.values.status || "active"} onChange={formik.handleChange}
                      error={formik.touched.status && Boolean(formik.errors.status)}
                      helperText={formik.touched.status && formik.errors.status}>
                      <MenuItem value="active">{t("Active")}</MenuItem>
                      <MenuItem value="completed">{t("Completed")}</MenuItem>
                      <MenuItem value="cancelled">{t("Cancelled")}</MenuItem>
                      <MenuItem value="expired">{t("Expired")}</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Period Configuration")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>{t("Period")}</InputLabel>
                      <Select
                        value={formik.values.period || "monthly"}
                        label={t("Period")}
                        onChange={(e) => formik.setFieldValue("period", e.target.value)}
                      >
                        <MenuItem value="monthly">{t("Monthly")}</MenuItem>
                        <MenuItem value="yearly">{t("Yearly")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker label={t("Start Date")}
                      value={formik.values.startDate ? dayjs(formik.values.startDate) : null}
                      onChange={(value) => formik.setFieldValue("startDate", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true, error: formik.touched.startDate && Boolean(formik.errors.startDate), helperText: formik.touched.startDate && (formik.errors.startDate as string) } }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker label={t("End Date")}
                      value={formik.values.endDate ? dayjs(formik.values.endDate) : null}
                      onChange={(value) => formik.setFieldValue("endDate", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true, error: formik.touched.endDate && Boolean(formik.errors.endDate), helperText: formik.touched.endDate && (formik.errors.endDate as string) } }} />
                  </Grid>
                </Grid>
              )}

              {tabValue === 2 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Progress Tracking")}</SectionLabel>
                  <Grid size={12}>
                    <Box className="mb-4">
                      <Box className="flex justify-between mb-1">
                        <Typography variant="body2">{t("Achievement Progress")}</Typography>
                        <Typography variant="body2">{achievementPercentage.toFixed(1)}%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={Math.min(achievementPercentage, 100)} sx={{ height: 10, borderRadius: 5 }} />
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="achievedAmount" name="achievedAmount" label={t("Achieved Amount")} type="number"
                      value={formik.values.achievedAmount} onChange={formik.handleChange}
                      error={formik.touched.achievedAmount && Boolean(formik.errors.achievedAmount)}
                      helperText={formik.touched.achievedAmount && formik.errors.achievedAmount} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth disabled label={t("Remaining Amount")}
                      value={(formik.values.targetAmount || 0) - (formik.values.achievedAmount || 0)} />
                  </Grid>
                </Grid>
              )}
            </CardContent>

            <Divider />
            <Box className="p-4 flex justify-end gap-2">
              <Button color="grey" onClick={() => navigate(`/${role}/targets`)}>{t("Cancel")}</Button>
              <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
                {loading ? t("Saving...") : t("Save Target")}
              </Button>
            </Box>
          </Card>
        </form>
      </Box>
    </LocalizationProvider>
  );
}