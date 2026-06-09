import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import { PermissionService } from "@/services/permissionService";
import { UserService } from "@/services/userService";
import { buildPermissionGroups } from "@/lib/permissions";
import { User } from "@/types/user";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiClipboard from "@/icons/nexture/ni-clipboard";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiSearch from "@/icons/nexture/ni-search";

const validationSchema = yup.object({
  fullName: yup.string().required("Full Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters"),
  phone: yup.string(),
  role: yup.string().required("Role is required"),
});

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "counselor", label: "Counselor" },
  { value: "agent", label: "Agent" },
  { value: "student", label: "Student" },
  { value: "branch", label: "Branch" },
] as const;

const buildUserPayload = (values: Partial<User>, isEdit: boolean) => {
  const payload: Partial<User> = {
    fullName: values.fullName || "",
    email: values.email || "",
    phone: values.phone || "",
    role: values.role || "agent",
    accountStatus: values.accountStatus || "active",
    permissions: Array.isArray(values.permissions) ? values.permissions : [],
    address: values.address || "",
    commissionType: values.commissionType || "",
    commissionAmount: Number(values.commissionAmount) || 0,
  };

  if (!isEdit) {
    payload.password = values.password || "";
  }

  return payload;
};

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
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [permissionKeys, setPermissionKeys] = useState<string[]>([]);
  const [permissionSearch, setPermissionSearch] = useState("");

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
        const payload = buildUserPayload(values, isEdit);
        if (isEdit && id) {
          await UserService.updateUser(id, payload);
        } else {
          await UserService.createUser(payload);
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
    const fetchPermissionKeys = async () => {
      setLoadingPermissions(true);
      try {
        const response = await PermissionService.getPermissionKeys();
        if (response.success) {
          setPermissionKeys(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch permission keys", error);
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchPermissionKeys();
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchUser = async () => {
      try {
        const response = await UserService.getUserById(id);
        if (response.success && response.data) {
          formik.setValues({
            ...formik.initialValues,
            ...buildUserPayload(response.data, true),
            password: "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };

    fetchUser();
  }, [id, isEdit]);

  const groupedPermissions = useMemo(() => {
    const normalizedSearch = permissionSearch.trim().toLowerCase();
    return buildPermissionGroups(permissionKeys)
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          !normalizedSearch
            || item.key.toLowerCase().includes(normalizedSearch)
            || item.label.toLowerCase().includes(normalizedSearch)
            || group.title.toLowerCase().includes(normalizedSearch),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [permissionKeys, permissionSearch]);

  const selectedPermissions = formik.values.permissions || [];

  const togglePermission = (permissionKey: string) => {
    const currentPermissions = formik.values.permissions || [];
    const nextPermissions = currentPermissions.includes(permissionKey)
      ? currentPermissions.filter((item) => item !== permissionKey)
      : [...currentPermissions, permissionKey];

    formik.setFieldValue("permissions", nextPermissions);
  };

  const togglePermissionGroup = (groupKeys: string[]) => {
    const currentPermissions = formik.values.permissions || [];
    const hasAll = groupKeys.every((item) => currentPermissions.includes(item));
    const nextPermissions = hasAll
      ? currentPermissions.filter((item) => !groupKeys.includes(item))
      : Array.from(new Set([...currentPermissions, ...groupKeys]));

    formik.setFieldValue("permissions", nextPermissions);
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
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
                  <TextField fullWidth id="fullName" name="fullName" label={t("Full Name")} value={formik.values.fullName} onChange={formik.handleChange} error={formik.touched.fullName && Boolean(formik.errors.fullName)} helperText={formik.touched.fullName && formik.errors.fullName} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="email" name="email" label={t("Email")} value={formik.values.email} onChange={formik.handleChange} error={formik.touched.email && Boolean(formik.errors.email)} helperText={formik.touched.email && formik.errors.email} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="password" name="password" label={t("Password")} type="password" value={formik.values.password || ""} onChange={formik.handleChange} error={formik.touched.password && Boolean(formik.errors.password)} helperText={(formik.touched.password && (formik.errors.password as string)) || (!isEdit ? t("Required for new users") : "")} disabled={isEdit} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="phone" name="phone" label={t("Phone")} value={formik.values.phone || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="address" name="address" label={t("Address")} value={formik.values.address || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth select id="accountStatus" name="accountStatus" label={t("Account Status")} value={formik.values.accountStatus || "active"} onChange={formik.handleChange}>
                    <MenuItem value="active">{t("Active")}</MenuItem>
                    <MenuItem value="inactive">{t("Inactive")}</MenuItem>
                    <MenuItem value="suspended">{t("Suspended")}</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Role & Permissions")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth select id="role" name="role" label={t("Role")} value={formik.values.role || "agent"} onChange={formik.handleChange}>
                    {ROLE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{t(option.label)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box className="flex flex-wrap items-center gap-2 rounded-2xl p-3" sx={{ backgroundColor: "action.hover" }}>
                    <Chip label={`${selectedPermissions.length} ${t("permissions selected")}`} color="primary" variant="outlined" />
                    <Button size="small" color="grey" onClick={() => formik.setFieldValue("permissions", [])}>
                      {t("Clear All")}
                    </Button>
                    <Button size="small" color="grey" onClick={() => formik.setFieldValue("permissions", permissionKeys)}>
                      {t("Select All")}
                    </Button>
                  </Box>
                </Grid>
                <Grid size={12}>
                  <Alert severity="info">
                    {t("Choose custom permissions below. If you leave none on new user, backend can still apply role defaults automatically.")}
                  </Alert>
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={t("Search permissions")}
                    value={permissionSearch}
                    onChange={(event) => setPermissionSearch(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NiSearch size="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={12}>
                  {loadingPermissions ? (
                    <Typography color="text.secondary">{t("Loading permissions...")}</Typography>
                  ) : (
                    <Box className="space-y-4">
                      {groupedPermissions.map((group) => {
                        const groupKeys = group.items.map((item) => item.key);
                        const selectedCount = groupKeys.filter((item) => selectedPermissions.includes(item)).length;

                        return (
                          <Box key={group.title} className="rounded-2xl p-4" sx={{ backgroundColor: "action.hover" }}>
                            <Box className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <Box>
                                <Typography variant="h6">{group.title}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {selectedCount}/{groupKeys.length} {t("selected")}
                                </Typography>
                              </Box>
                              <Button size="small" color="grey" startIcon={<NiClipboard size="small" />} onClick={() => togglePermissionGroup(groupKeys)}>
                                {selectedCount === groupKeys.length ? t("Clear Group") : t("Select Group")}
                              </Button>
                            </Box>

                            <Grid container spacing={1.5}>
                              {group.items.map((item) => (
                                <Grid key={item.key} size={{ xs: 12, md: 6, xl: 4 }}>
                                  <Box
                                    className="h-full rounded-2xl border p-3"
                                    sx={{
                                      borderColor: selectedPermissions.includes(item.key) ? "primary.main" : "divider",
                                      backgroundColor: selectedPermissions.includes(item.key) ? "primary.50" : "background.paper",
                                    }}
                                  >
                                    <FormControlLabel
                                      className="m-0 items-start"
                                      control={<Checkbox checked={selectedPermissions.includes(item.key)} onChange={() => togglePermission(item.key)} />}
                                      label={
                                        <Box>
                                          <Typography variant="body1" fontWeight={600}>{item.label}</Typography>
                                          <Typography variant="caption" color="text.secondary">{item.key}</Typography>
                                        </Box>
                                      }
                                    />
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Grid>
              </Grid>
            )}

            {tabValue === 2 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Commission Settings")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth select id="commissionType" name="commissionType" label={t("Commission Type")} value={formik.values.commissionType || ""} onChange={formik.handleChange}>
                    <MenuItem value="">{t("None")}</MenuItem>
                    <MenuItem value="fixed">{t("Fixed Amount")}</MenuItem>
                    <MenuItem value="percentage">{t("Percentage")}</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="commissionAmount" name="commissionAmount" label={t("Commission Amount")} type="number" value={formik.values.commissionAmount ?? 0} onChange={formik.handleChange} />
                </Grid>
              </Grid>
            )}
          </CardContent>

          <Divider />
          <Box className="flex justify-end gap-2 p-4">
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
