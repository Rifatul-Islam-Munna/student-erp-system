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
  Chip,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import { PermissionService } from "@/services/permissionService";
import { Permission } from "@/types/permission";
import {
  buildPermissionGroups,
  getPermissionDescription,
  getPermissionLabel,
  getPermissionModuleLabel,
  normalizePermissionRecord,
} from "@/lib/permissions";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiSearch from "@/icons/nexture/ni-search";

const validationSchema = yup.object({
  name: yup.string().required("Permission key is required"),
  module: yup.string().required("Module is required"),
  description: yup.string(),
});

export default function PermissionUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [permissionKeys, setPermissionKeys] = useState<string[]>([]);
  const [existingPermissionNames, setExistingPermissionNames] = useState<string[]>([]);

  const formik = useFormik<Partial<Permission>>({
    initialValues: {
      name: "",
      module: "",
      description: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const payload = {
          name: values.name || "",
          module: values.module || "",
          description: values.description || "",
        };

        if (isEdit && id) {
          await PermissionService.updatePermission(id, payload);
        } else {
          await PermissionService.createPermission(payload);
        }
        navigate(`/${role}/permissions`);
      } catch (error) {
        console.error("Failed to save permission", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchPermissionMeta = async () => {
      setLoadingKeys(true);
      try {
        const [keysResponse, permissionsResponse] = await Promise.all([
          PermissionService.getPermissionKeys(),
          PermissionService.getPermissions({ limit: 500 }),
        ]);

        if (keysResponse.success) {
          setPermissionKeys(Array.isArray(keysResponse.data) ? keysResponse.data : []);
        }

        if (permissionsResponse.success) {
          const names = Array.isArray(permissionsResponse.data)
            ? permissionsResponse.data.map((permission: Permission) => permission.name).filter((item): item is string => Boolean(item))
            : [];
          setExistingPermissionNames(names);
        }
      } catch (error) {
        console.error("Failed to fetch permission metadata", error);
      } finally {
        setLoadingKeys(false);
      }
    };

    fetchPermissionMeta();
  }, []);

  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchPermission = async () => {
      try {
        const response = await PermissionService.getPermissionById(id);
        if (response.success && response.data) {
          const normalized = normalizePermissionRecord(response.data);
          formik.setValues({
            name: normalized.name,
            module: normalized.module,
            description: normalized.description,
          });
        }
      } catch (error) {
        console.error("Failed to fetch permission", error);
      }
    };

    fetchPermission();
  }, [id, isEdit]);

  const groupedPermissionKeys = useMemo(() => {
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

  const selectedPermission = formik.values.name || "";

  const handlePickPermission = (permissionKey: string) => {
    formik.setValues({
      name: permissionKey,
      module: getPermissionModuleLabel(permissionKey),
      description: formik.values.description?.trim() ? formik.values.description : getPermissionDescription(permissionKey),
    });
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {isEdit ? t("Edit Permission") : t("Create Permission")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/permissions`}>{t("Permissions")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="text" color="grey" startIcon={<NiArrowLeft size="medium" />} onClick={() => navigate(`/${role}/permissions`)}>
          {t("Back to List")}
        </Button>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Card className="rounded-xl shadow-sm">
          <CardContent className="space-y-6!">
            {!isEdit && (
              <Box className="rounded-2xl p-4" sx={{ backgroundColor: "action.hover" }}>
                <Box className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <Box>
                    <Typography variant="h5">{t("Pick System Permission")}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("Choose one permission key below. Module and label will be prepared automatically.")}
                    </Typography>
                  </Box>
                  <TextField
                    size="small"
                    placeholder={t("Search permission key")}
                    value={permissionSearch}
                    onChange={(event) => setPermissionSearch(event.target.value)}
                    sx={{ minWidth: { xs: "100%", md: 280 } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NiSearch size="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {loadingKeys ? (
                  <Typography color="text.secondary">{t("Loading permission keys...")}</Typography>
                ) : (
                  <Box className="space-y-4">
                    {groupedPermissionKeys.map((group) => (
                      <Box key={group.title} className="rounded-2xl bg-background-paper p-4">
                        <Box className="mb-3 flex items-center justify-between gap-2">
                          <Typography variant="h6">{group.title}</Typography>
                          <Chip size="small" label={`${group.items.length} ${t("items")}`} />
                        </Box>
                        <Box className="flex flex-wrap gap-2">
                          {group.items.map((item) => {
                            const isUsed = existingPermissionNames.includes(item.key);
                            const isSelected = selectedPermission === item.key;

                            return (
                              <Chip
                                key={item.key}
                                clickable
                                color={isSelected ? "primary" : isUsed ? "warning" : "default"}
                                variant={isSelected ? "filled" : "outlined"}
                                label={item.key}
                                onClick={() => handlePickPermission(item.key)}
                                title={item.description}
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label={t("Permission Key")}
                  value={formik.values.name || ""}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name ? formik.errors.name : t("Example: manage_users")}
                  disabled={isEdit}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="module"
                  name="module"
                  label={t("Module")}
                  value={formik.values.module || ""}
                  onChange={formik.handleChange}
                  error={formik.touched.module && Boolean(formik.errors.module)}
                  helperText={formik.touched.module && formik.errors.module}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label={t("Preview Label")}
                  value={formik.values.name ? getPermissionLabel(formik.values.name) : ""}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label={t("Quick Module Fill")}
                  value=""
                  onChange={(event) => formik.setFieldValue("module", event.target.value)}
                >
                  {Array.from(new Set(permissionKeys.map((item) => getPermissionModuleLabel(item)))).sort().map((module) => (
                    <MenuItem key={module} value={module}>{module}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label={t("Description")}
                  value={formik.values.description || ""}
                  onChange={formik.handleChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>

            {!!selectedPermission && !isEdit && existingPermissionNames.includes(selectedPermission) && (
              <Alert severity="warning">
                {t("This permission key already exists in database. Saving may fail unless you choose another key.")}
              </Alert>
            )}
          </CardContent>

          <Divider />
          <Box className="flex justify-end gap-2 p-4">
            <Button color="grey" onClick={() => navigate(`/${role}/permissions`)}>{t("Cancel")}</Button>
            <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
              {loading ? t("Saving...") : t("Save Permission")}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}
