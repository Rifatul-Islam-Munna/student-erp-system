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
  Divider,
  Breadcrumbs,
} from "@mui/material";
import { Link } from "react-router-dom";

import { PermissionService } from "@/services/permissionService";
import { Permission } from "@/types/permission";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
  key: yup.string().required("Key is required"),
  description: yup.string(),
  category: yup.string(),
});

export default function PermissionUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<Permission>>({
    initialValues: {
      name: "",
      key: "",
      description: "",
      category: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await PermissionService.updatePermission(id, values);
        } else {
          await PermissionService.createPermission(values);
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
    if (isEdit && id) {
      const fetchPermission = async () => {
        try {
          const response = await PermissionService.getPermissionById(id);
          if (response.success && response.data) {
            formik.setValues({
              name: response.data.name || "",
              key: response.data.key || "",
              description: response.data.description || "",
              category: response.data.category || "",
            });
          }
        } catch (error) {
          console.error("Failed to fetch permission", error);
        }
      };
      fetchPermission();
    }
  }, [isEdit, id]);

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label={t("Name")}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="key"
                  name="key"
                  label={t("Key")}
                  value={formik.values.key}
                  onChange={formik.handleChange}
                  error={formik.touched.key && Boolean(formik.errors.key)}
                  helperText={formik.touched.key && formik.errors.key}
                  disabled={isEdit}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  id="category"
                  name="category"
                  label={t("Category")}
                  value={formik.values.category || ""}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
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
          </CardContent>

          <Divider />
          <Box className="p-4 flex justify-end gap-2">
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