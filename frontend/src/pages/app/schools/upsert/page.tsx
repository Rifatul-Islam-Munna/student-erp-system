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
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";

import { SchoolService } from "@/services/schoolService";
import { School } from "@/types/school";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiPlus from "@/icons/nexture/ni-plus";

const validationSchema = yup.object({
  name: yup.string().required("School Name is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>
      {children}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function SchoolUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [programInput, setProgramInput] = useState("");

  const formik = useFormik<Partial<School>>({
    initialValues: {
      name: "",
      country: "",
      city: "",
      address: "",
      website: "",
      email: "",
      phone: "",
      ranking: undefined,
      tuitionFee: undefined,
      applicationFee: undefined,
      scholarshipAvailable: false,
      programs: [],
      intake: "",
      requirements: "",
      description: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await SchoolService.updateSchool(id, values);
        } else {
          await SchoolService.createSchool(values);
        }
        navigate(`/${role}/schools`);
      } catch (error) {
        console.error("Failed to save school", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchSchool = async () => {
        try {
          const response = await SchoolService.getSchoolById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch school", error);
        }
      };
      fetchSchool();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const addProgram = () => {
    if (programInput.trim()) {
      const programs = formik.values.programs || [];
      formik.setFieldValue("programs", [...programs, programInput.trim()]);
      setProgramInput("");
    }
  };

  const removeProgram = (index: number) => {
    const programs = [...(formik.values.programs || [])];
    programs.splice(index, 1);
    formik.setFieldValue("programs", programs);
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {isEdit ? t("Edit School") : t("Create School")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/schools`}>{t("Schools")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="text"
          color="grey"
          startIcon={<NiArrowLeft size="medium" />}
          onClick={() => navigate(`/${role}/schools`)}
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
              <Tab label={t("Programs & Fees")} />
              <Tab label={t("Additional Info")} />
            </Tabs>
          </Box>

          <CardContent>
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("School Information")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="name" name="name" label={t("School Name")}
                    value={formik.values.name} onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="country" name="country" label={t("Country")}
                    value={formik.values.country || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="city" name="city" label={t("City")}
                    value={formik.values.city || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="address" name="address" label={t("Address")}
                    value={formik.values.address || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="ranking" name="ranking" label={t("Ranking")}
                    type="number" value={formik.values.ranking || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="intake" name="intake" label={t("Intake")}
                    value={formik.values.intake || ""} onChange={formik.handleChange}
                    placeholder={t("e.g., Spring 2024, Fall 2024")} />
                </Grid>

                <SectionLabel>{t("Scholarship")}</SectionLabel>
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.scholarshipAvailable || false}
                        onChange={(e) => formik.setFieldValue("scholarshipAvailable", e.target.checked)}
                      />
                    }
                    label={t("Scholarship Available")}
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
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="website" name="website" label={t("Website")}
                    value={formik.values.website || ""} onChange={formik.handleChange}
                    placeholder={t("https://")} />
                </Grid>
              </Grid>
            )}

            {tabValue === 2 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Fees")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="tuitionFee" name="tuitionFee" label={t("Tuition Fee")}
                    type="number" value={formik.values.tuitionFee || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="applicationFee" name="applicationFee" label={t("Application Fee")}
                    type="number" value={formik.values.applicationFee || ""} onChange={formik.handleChange} />
                </Grid>

                <SectionLabel>{t("Programs")}</SectionLabel>
                <Grid size={12}>
                  <Box className="flex gap-2 mb-2">
                    <TextField
                      fullWidth
                      size="small"
                      placeholder={t("Add a program")}
                      value={programInput}
                      onChange={(e) => setProgramInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addProgram();
                        }
                      }}
                    />
                    <Button variant="outlined" size="small" onClick={addProgram}>
                      <NiPlus size="medium" />
                    </Button>
                  </Box>
                  <Box className="flex flex-wrap gap-1">
                    {(formik.values.programs || []).map((program, index) => (
                      <Chip
                        key={index}
                        label={program}
                        onDelete={() => removeProgram(index)}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  {(formik.values.programs || []).length === 0 && (
                    <Typography variant="body2" color="textSecondary">
                      {t("No programs added yet")}
                    </Typography>
                  )}
                </Grid>

                <SectionLabel>{t("Requirements")}</SectionLabel>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    id="requirements"
                    name="requirements"
                    label={t("Requirements")}
                    value={formik.values.requirements || ""}
                    onChange={formik.handleChange}
                    placeholder={t("Enter admission requirements...")}
                  />
                </Grid>
              </Grid>
            )}

            {tabValue === 3 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Description")}</SectionLabel>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    id="description"
                    name="description"
                    label={t("Description")}
                    value={formik.values.description || ""}
                    onChange={formik.handleChange}
                    placeholder={t("Enter school description...")}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>

          <Divider />
          <Box className="p-4 flex justify-end gap-2">
            <Button color="grey" onClick={() => navigate(`/${role}/schools`)}>{t("Cancel")}</Button>
            <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
              {loading ? t("Saving...") : t("Save School")}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}
