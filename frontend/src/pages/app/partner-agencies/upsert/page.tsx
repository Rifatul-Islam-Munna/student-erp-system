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
  FormControlLabel,
  Checkbox,
  Breadcrumbs,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Link } from "react-router-dom";

import { PartnerAgencyService } from "@/services/partnerAgencyService";
import { PartnerAgency } from "@/types/partnerAgency";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "South Korea",
  "China",
  "India",
  "Vietnam",
  "Thailand",
  "Malaysia",
  "Singapore",
  "Indonesia",
  "Philippines",
  "Other",
];

const validationSchema = yup.object({
  name: yup.string().required("Partner Agency Name is required"),
  code: yup.string().required("Code is required"),
  status: yup.string(),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>
      {children}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function PartnerAgencyUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<PartnerAgency>>({
    initialValues: {
      name: "",
      code: "",
      country: "",
      city: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      contactPerson: "",
      commissionRate: undefined,
      status: "active",
      notes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await PartnerAgencyService.updatePartnerAgency(id, values);
        } else {
          await PartnerAgencyService.createPartnerAgency(values);
        }
        navigate(`/${role}/partner-agencies`);
      } catch (error) {
        console.error("Failed to save partner agency", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchPartnerAgency = async () => {
        try {
          const response = await PartnerAgencyService.getPartnerAgencyById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch partner agency", error);
        }
      };
      fetchPartnerAgency();
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
            {isEdit ? t("Edit Partner Agency") : t("Create Partner Agency")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/partner-agencies`}>{t("Partner Agencies")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="text"
          color="grey"
          startIcon={<NiArrowLeft size="medium" />}
          onClick={() => navigate(`/${role}/partner-agencies`)}
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
              <Tab label={t("Commission & Status")} />
              <Tab label={t("Additional Info")} />
            </Tabs>
          </Box>

          <CardContent>
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Partner Agency Information")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="name" name="name" label={t("Partner Agency Name")}
                    value={formik.values.name} onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="code" name="code" label={t("Code")}
                    value={formik.values.code} onChange={formik.handleChange}
                    error={formik.touched.code && Boolean(formik.errors.code)}
                    helperText={formik.touched.code && formik.errors.code} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t("Country")}</InputLabel>
                    <Select
                      name="country"
                      value={formik.values.country || ""}
                      label={t("Country")}
                      onChange={formik.handleChange}
                    >
                      {COUNTRIES.map((country) => (
                        <MenuItem key={country} value={country}>{country}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="city" name="city" label={t("City")}
                    value={formik.values.city || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="contactPerson" name="contactPerson" label={t("Contact Person")}
                    value={formik.values.contactPerson || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="status" name="status" label={t("Status")}
                    select SelectProps={{ native: true }}
                    value={formik.values.status || "active"} onChange={formik.handleChange}>
                    <option value="active">{t("Active")}</option>
                    <option value="inactive">{t("Inactive")}</option>
                  </TextField>
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
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="website" name="website" label={t("Website")}
                    value={formik.values.website || ""} onChange={formik.handleChange}
                    placeholder={t("https://")} />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    id="address"
                    name="address"
                    label={t("Address")}
                    value={formik.values.address || ""}
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
            )}

            {tabValue === 2 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Commission")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="commissionRate" name="commissionRate" label={t("Commission Rate (%)")}
                    type="number"
                    value={formik.values.commissionRate ?? ""}
                    onChange={formik.handleChange}
                    placeholder={t("e.g., 10")}
                    InputProps={{
                      endAdornment: <Typography color="textSecondary">%</Typography>,
                    }}
                  />
                </Grid>
              </Grid>
            )}

            {tabValue === 3 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Notes")}</SectionLabel>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    id="notes"
                    name="notes"
                    label={t("Notes")}
                    value={formik.values.notes || ""}
                    onChange={formik.handleChange}
                    placeholder={t("Enter any additional notes about this partner agency...")}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>

          <Divider />
          <Box className="p-4 flex justify-end gap-2">
            <Button color="grey" onClick={() => navigate(`/${role}/partner-agencies`)}>{t("Cancel")}</Button>
            <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
              {loading ? t("Saving...") : t("Save Partner Agency")}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}