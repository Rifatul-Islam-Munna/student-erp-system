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
  Chip,
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiPlus from "@/icons/nexture/ni-plus";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import { DocumentService } from "@/services/documentService";
import { DocumentTemplate } from "@/types/document";

const DOCUMENT_TYPES = [
  "contract",
  "agreement",
  "letter",
  "invoice",
  "certificate",
  "form",
  "other",
];

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
  type: yup.string().required("Type is required"),
  status: yup.string().oneOf(["active", "inactive", "draft"]).required("Status is required"),
});

export default function DocumentUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<DocumentTemplate>>({
    initialValues: {
      name: "",
      type: "other",
      content: "",
      fileUrl: "",
      shortcodes: [],
      status: "draft",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await DocumentService.updateDocument(id, values);
        } else {
          await DocumentService.createDocument(values);
        }
        navigate(`/${role}/documents`);
      } catch (error) {
        console.error("Failed to save document", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchDocument = async () => {
        try {
          const response = await DocumentService.getDocumentById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch document", error);
        }
      };
      fetchDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const addShortcode = () => {
    formik.setFieldValue("shortcodes", [...(formik.values.shortcodes || []), ""]);
  };

  const removeShortcode = (index: number) => {
    const shortcodes = [...(formik.values.shortcodes || [])];
    shortcodes.splice(index, 1);
    formik.setFieldValue("shortcodes", shortcodes);
  };

  const updateShortcode = (index: number, value: string) => {
    const shortcodes = [...(formik.values.shortcodes || [])];
    shortcodes[index] = value;
    formik.setFieldValue("shortcodes", shortcodes);
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {isEdit ? t("Edit Document") : t("Create Document")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/documents`}>{t("Documents")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="text"
          color="grey"
          startIcon={<NiArrowLeft size="medium" />}
          onClick={() => navigate(`/${role}/documents`)}
        >
          {t("Back to List")}
        </Button>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Card className="rounded-xl shadow-sm">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label={t("Basic Information")} />
              <Tab label={t("Content")} />
              <Tab label={t("Shortcodes")} />
              <Tab label={t("Settings")} />
            </Tabs>
          </Box>

          <CardContent>
            {tabValue === 0 && (
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
                    select
                    id="type"
                    name="type"
                    label={t("Type")}
                    value={formik.values.type || "other"}
                    onChange={formik.handleChange}
                    error={formik.touched.type && Boolean(formik.errors.type)}
                    helperText={formik.touched.type && formik.errors.type}
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <MenuItem key={type} value={type}>
                        {t(type.charAt(0).toUpperCase() + type.slice(1))}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    select
                    id="status"
                    name="status"
                    label={t("Status")}
                    value={formik.values.status || "draft"}
                    onChange={formik.handleChange}
                    error={formik.touched.status && Boolean(formik.errors.status)}
                    helperText={formik.touched.status && formik.errors.status}
                  >
                    <MenuItem value="draft">{t("Draft")}</MenuItem>
                    <MenuItem value="active">{t("Active")}</MenuItem>
                    <MenuItem value="inactive">{t("Inactive")}</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="fileUrl"
                    name="fileUrl"
                    label={t("File URL")}
                    value={formik.values.fileUrl || ""}
                    onChange={formik.handleChange}
                    placeholder="https://"
                  />
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={3}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={15}
                    id="content"
                    name="content"
                    label={t("Content Template")}
                    value={formik.values.content || ""}
                    onChange={formik.handleChange}
                    placeholder={t("Enter document template content with shortcodes like {{name}}, {{date}}, etc.")}
                  />
                </Grid>
                <Grid size={12}>
                  <Typography variant="caption" color="textSecondary">
                    {t("Use shortcodes like")} {"{{fieldName}}"} {t("to dynamically insert values when generating the document")}
                  </Typography>
                </Grid>
              </Grid>
            )}

            {tabValue === 2 && (
              <Box>
                <Box className="flex justify-between items-center mb-4">
                  <Typography variant="h6">{t("Available Shortcodes")}</Typography>
                  <Button startIcon={<NiPlus size="medium" />} onClick={addShortcode}>
                    {t("Add Shortcode")}
                  </Button>
                </Box>

                <Box className="mb-2">
                  <Typography variant="caption" color="textSecondary">
                    {t("Define the shortcode placeholders that will be replaced with actual values during document generation")}
                  </Typography>
                </Box>

                {(formik.values.shortcodes || []).length === 0 ? (
                  <Box className="text-center py-8">
                    <Typography variant="body2" color="textSecondary">
                      {t("No shortcodes defined yet")}
                    </Typography>
                  </Box>
                ) : (
                  (formik.values.shortcodes || []).map((shortcode, index) => (
                    <Box key={index} className="mb-3 flex gap-2 items-center">
                      <TextField
                        size="small"
                        value={shortcode}
                        onChange={(e) => updateShortcode(index, e.target.value)}
                        placeholder="{{fieldName}}"
                        sx={{ flex: 1 }}
                      />
                      <Chip label={`{{${shortcode}}}`} size="small" variant="outlined" />
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => removeShortcode(index)}
                      >
                        <NiBinEmpty size="medium" />
                      </IconButton>
                    </Box>
                  ))
                )}
              </Box>
            )}

            {tabValue === 3 && (
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Typography variant="subtitle2" className="mb-2">
                    {t("Document Configuration")}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    id="fileUrl"
                    name="fileUrl"
                    label={t("Template File URL")}
                    value={formik.values.fileUrl || ""}
                    onChange={formik.handleChange}
                    placeholder="https://drive.google.com/..."
                    helperText={t("Optional: Link to a template file on Google Drive or other storage")}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>

          <Divider />
          <Box className="p-4 flex justify-end gap-2">
            <Button color="grey" onClick={() => navigate(`/${role}/documents`)}>
              {t("Cancel")}
            </Button>
            <Button
              type="submit"
              variant="surface"
              color="primary"
              startIcon={<NiFloppyDisk size="medium" />}
              disabled={loading}
            >
              {loading ? t("Saving...") : t("Save Document")}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}