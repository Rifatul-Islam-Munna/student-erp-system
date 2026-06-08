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
  InputAdornment,
} from "@mui/material";
import { Link } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { EmployeeService } from "@/services/employeeService";
import { EmployeeProfile } from "@/types/employee";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  "user.fullName": yup.string().required("Employee Name is required"),
  "user.email": yup.string().email("Invalid email").required("Email is required"),
  employeeId: yup.string().required("Employee ID is required"),
  department: yup.string().required("Department is required"),
  designation: yup.string().required("Designation is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>
      {children}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function EmployeeUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role: userRole, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);

  const formik = useFormik<Partial<EmployeeProfile>>({
    initialValues: {
      user: {
        fullName: "",
        email: "",
        phone: "",
        role: "agent",
      },
      employeeId: "",
      department: "",
      designation: "",
      joinDate: "",
      salary: 0,
      status: "active",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await EmployeeService.updateEmployee(id, values);
        } else {
          await EmployeeService.createEmployee(values);
        }
        navigate(`/${userRole}/employees`);
      } catch (error) {
        console.error("Failed to save employee", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await EmployeeService.getDepartments();
        if (response.success && Array.isArray(response.data)) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch departments", error);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      const fetchEmployee = async () => {
        try {
          const response = await EmployeeService.getEmployeeById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch employee", error);
        }
      };
      fetchEmployee();
    }
  }, [isEdit, id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUserChange = (field: string, value: string) => {
    formik.setFieldValue(`user.${field}`, value);
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {isEdit ? t("Edit Employee") : t("Create Employee")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${userRole}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${userRole}/employees`}>{t("Employees")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="text"
          color="grey"
          startIcon={<NiArrowLeft size="medium" />}
          onClick={() => navigate(`/${userRole}/employees`)}
        >
          {t("Back to List")}
        </Button>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Card className="rounded-xl shadow-sm">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label={t("Basic Information")} />
              <Tab label={t("Employment Details")} />
              <Tab label={t("Compensation")} />
            </Tabs>
          </Box>

          <CardContent>
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Personal Details")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="user.fullName"
                    name="user.fullName"
                    label={t("Full Name")}
                    value={formik.values.user?.fullName || ""}
                    onChange={(e) => handleUserChange("fullName", e.target.value)}
                    error={formik.touched.user?.fullName && Boolean(formik.errors.user?.fullName)}
                    helperText={formik.touched.user?.fullName && formik.errors.user?.fullName as string}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="user.email"
                    name="user.email"
                    label={t("Email")}
                    value={formik.values.user?.email || ""}
                    onChange={(e) => handleUserChange("email", e.target.value)}
                    error={formik.touched.user?.email && Boolean(formik.errors.user?.email)}
                    helperText={formik.touched.user?.email && formik.errors.user?.email as string}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="user.phone"
                    name="user.phone"
                    label={t("Phone")}
                    value={formik.values.user?.phone || ""}
                    onChange={(e) => handleUserChange("phone", e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="user.address"
                    name="user.address"
                    label={t("Address")}
                    value={formik.values.user?.address || ""}
                    onChange={(e) => handleUserChange("address", e.target.value)}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    id="user.accountStatus"
                    name="user.accountStatus"
                    label={t("Account Status")}
                    value={formik.values.user?.accountStatus || "active"}
                    onChange={(e) => handleUserChange("accountStatus", e.target.value)}
                  >
                    <MenuItem value="active">{t("Active")}</MenuItem>
                    <MenuItem value="inactive">{t("Inactive")}</MenuItem>
                    <MenuItem value="suspended">{t("Suspended")}</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Employment Details")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="employeeId"
                    name="employeeId"
                    label={t("Employee ID")}
                    value={formik.values.employeeId || ""}
                    onChange={formik.handleChange}
                    error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
                    helperText={formik.touched.employeeId && formik.errors.employeeId as string}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    id="department"
                    name="department"
                    label={t("Department")}
                    value={formik.values.department || ""}
                    onChange={formik.handleChange}
                    error={formik.touched.department && Boolean(formik.errors.department)}
                    helperText={formik.touched.department && formik.errors.department as string}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="designation"
                    name="designation"
                    label={t("Designation")}
                    value={formik.values.designation || ""}
                    onChange={formik.handleChange}
                    error={formik.touched.designation && Boolean(formik.errors.designation)}
                    helperText={formik.touched.designation && formik.errors.designation as string}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label={t("Join Date")}
                      value={formik.values.joinDate ? dayjs(formik.values.joinDate) : null}
                      onChange={(newValue) => formik.setFieldValue("joinDate", newValue ? newValue.toISOString() : "")}
                      slotProps={{ textField: { fullWidth: true, size: "small" } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    id="status"
                    name="status"
                    label={t("Employment Status")}
                    value={formik.values.status || "active"}
                    onChange={formik.handleChange}
                  >
                    <MenuItem value="active">{t("Active")}</MenuItem>
                    <MenuItem value="inactive">{t("Inactive")}</MenuItem>
                    <MenuItem value="terminated">{t("Terminated")}</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            )}

            {tabValue === 2 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Compensation")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="salary"
                    name="salary"
                    label={t("Base Salary")}
                    type="number"
                    value={formik.values.salary || 0}
                    onChange={formik.handleChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>

          <Divider />
          <Box className="p-4 flex justify-end gap-2">
            <Button color="grey" onClick={() => navigate(`/${userRole}/employees`)}>{t("Cancel")}</Button>
            <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
              {loading ? t("Saving...") : t("Save Employee")}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}