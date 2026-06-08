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
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Link } from "react-router-dom";

import { BranchService } from "@/services/branchService";
import { Branch } from "@/types/branch";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  name: yup.string().required("Branch Name is required"),
  code: yup.string().required("Branch Code is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>
      {children}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function BranchUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<Branch>>({
    initialValues: {
      name: "",
      code: "",
      address: "",
      phone: "",
      email: "",
      manager: "",
      status: "active",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await BranchService.updateBranch(id, values);
        } else {
          await BranchService.createBranch(values);
        }
        navigate(`/${role}/branches`);
      } catch (error) {
        console.error("Failed to save branch", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchBranch = async () => {
        try {
          const response = await BranchService.getBranchById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch branch", error);
        }
      };
      fetchBranch();
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
            {isEdit ? t("Edit Branch") : t("Create Branch")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/branches`}>{t("Branches")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="text"
          color="grey"
          startIcon={<NiArrowLeft size="medium" />}
          onClick={() => navigate(`/${role}/branches`)}
        >
          {t("Back to List")}
        </Button>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Card className="rounded-xl shadow-sm">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label={t("Basic Information")} />
              <Tab label={t("Contact Details")} />
            </Tabs>
          </Box>

          <CardContent>
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Branch Information")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="name" name="name" label={t("Branch Name")}
                    value={formik.values.name} onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="code" name="code" label={t("Branch Code")}
                    value={formik.values.code || ""} onChange={formik.handleChange}
                    error={formik.touched.code && Boolean(formik.errors.code)}
                    helperText={formik.touched.code && formik.errors.code} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="manager" name="manager" label={t("Manager")}
                    value={formik.values.manager || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="address" name="address" label={t("Address")}
                    value={formik.values.address || ""} onChange={formik.handleChange} />
                </Grid>

                <SectionLabel>{t("Status")}</SectionLabel>
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.status === "active"}
                        onChange={(e) => formik.setFieldValue("status", e.target.checked ? "active" : "inactive")}
                      />
                    }
                    label={formik.values.status === "active" ? t("Active") : t("Inactive")}
                  />
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Contact Information")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="email" name="email" label={t("Email")}
                    type="email" value={formik.values.email || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="phone" name="phone" label={t("Phone")}
                    value={formik.values.phone || ""} onChange={formik.handleChange} />
                </Grid>
              </Grid>
            )}
          </CardContent>

          <Divider />
          <Box className="p-4 flex justify-end gap-2">
            <Button color="grey" onClick={() => navigate(`/${role}/branches`)}>{t("Cancel")}</Button>
            <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
              {loading ? t("Saving...") : t("Save Branch")}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}