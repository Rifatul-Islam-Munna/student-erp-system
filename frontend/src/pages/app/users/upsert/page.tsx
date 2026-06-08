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
} from "@mui/material";
import { Link } from "react-router-dom";

import { UserService } from "@/services/userService";
import { User } from "@/types/user";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  fullName: yup.string().required("Full Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters"),
  phone: yup.string(),
  role: yup.string().required("Role is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>
      {children}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function UserUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role: userRole, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<User>>({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      role: "agent",
      accountStatus: "active",
      avatar: "",
      address: "",
      commissionType: "",
      commissionAmount: 0,
      permissions: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await UserService.updateUser(id, values);
        } else {
          await UserService.createUser(values);
        }
        navigate(`/${userRole}/users`);
      } catch (error) {
        console.error("Failed to save user", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchUser = async () => {
        try {
          const response = await UserService.getUserById(id);
          if (response.success && response.data) {
            const { password, ...dataWithoutPassword } = response.data;
            formik.setValues({ ...formik.initialValues, ...dataWithoutPassword });
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
        }
      };
      fetchUser();
    }
  }, [isEdit, id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {isEdit ? t("Edit User") : t("Create User")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${userRole}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${userRole}/users`}>{t("Users")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="text"
          color="grey"
          startIcon={<NiArrowLeft size="medium" />}
          onClick={() => navigate(`/${userRole}/users`)}
        >
          {t("Back to List")}
        </Button>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Card className="rounded-xl shadow-sm">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label={t("Basic Information")} />
              <Tab label={t("Role & Permissions")} />
              <Tab label={t("Commission")} />
            </Tabs>
          </Box>

          <CardContent>
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Personal Details")}</SectionLabel>
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
                  <TextField fullWidth id="password" name="password" label={t("Password")}
                    type="password"
                    value={formik.values.password || ""} onChange={formik.handleChange}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && (formik.errors.password as string) || (!isEdit ? t("Required for new users") : "")}
                    disabled={isEdit} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="phone" name="phone" label={t("Phone")}
                    value={formik.values.phone || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="address" name="address" label={t("Address")}
                    value={formik.values.address || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth select id="accountStatus" name="accountStatus" label={t("Account Status")}
                    value={formik.values.accountStatus || "active"} onChange={formik.handleChange}>
                    <MenuItem value="active">{t("Active")}</MenuItem>
                    <MenuItem value="inactive">{t("Inactive")}</MenuItem>
                    <MenuItem value="suspended">{t("Suspended")}</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Role")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth select id="role" name="role" label={t("Role")}
                    value={formik.values.role || "agent"} onChange={formik.handleChange}>
                    <MenuItem value="super_admin">{t("Super Admin")}</MenuItem>
                    <MenuItem value="admin">{t("Admin")}</MenuItem>
                    <MenuItem value="counselor">{t("Counselor")}</MenuItem>
                    <MenuItem value="agent">{t("Agent")}</MenuItem>
                    <MenuItem value="student">{t("Student")}</MenuItem>
                    <MenuItem value="branch">{t("Branch")}</MenuItem>
                    <MenuItem value="teacher">{t("Teacher")}</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            )}

            {tabValue === 2 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Commission Settings")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth select id="commissionType" name="commissionType" label={t("Commission Type")}
                    value={formik.values.commissionType || ""} onChange={formik.handleChange}>
                    <MenuItem value="">{t("None")}</MenuItem>
                    <MenuItem value="fixed">{t("Fixed Amount")}</MenuItem>
                    <MenuItem value="percentage">{t("Percentage")}</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="commissionAmount" name="commissionAmount" label={t("Commission Amount")}
                    type="number"
                    value={formik.values.commissionAmount || 0} onChange={formik.handleChange} />
                </Grid>
              </Grid>
            )}
          </CardContent>

          <Divider />
          <Box className="p-4 flex justify-end gap-2">
            <Button color="grey" onClick={() => navigate(`/${userRole}/users`)}>{t("Cancel")}</Button>
            <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
              {loading ? t("Saving...") : t("Save User")}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}