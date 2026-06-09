import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { SYSTEM_DOCUMENT_VARIABLES } from "@/constants/documentVariables";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiPen from "@/icons/nexture/ni-pen";
import NiPrinter from "@/icons/nexture/ni-printer";
import { DocumentService } from "@/services/documentService";
import { DocumentTemplate } from "@/types/document";

const getStatusColor = (status: DocumentTemplate["status"]) => {
  if (status === "active") return "success";
  if (status === "inactive") return "default";
  return "warning";
};

export default function DocumentView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [document, setDocument] = useState<DocumentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchDocument = async () => {
      try {
        const response = await DocumentService.getDocumentById(id);
        if (response.success && response.data) {
          setDocument(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch document", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const paperStyle = useMemo(() => {
    if (!document?.pageSettings) return {};
    return {
      width: `${document.pageSettings.widthMm}mm`,
      minHeight: `${document.pageSettings.heightMm}mm`,
      padding: `${document.pageSettings.marginTopMm}mm ${document.pageSettings.marginRightMm}mm ${document.pageSettings.marginBottomMm}mm ${document.pageSettings.marginLeftMm}mm`,
    };
  }, [document]);

  const handleGenerate = async () => {
    if (!document?._id) return;
    if (document.docType === "student" && !studentId.trim()) {
      setGenerateError("Student ID required for student document");
      return;
    }

    setGenerateError("");
    setGenerating(true);

    try {
      await DocumentService.generateAndDownloadPdf(
        {
          templateId: document._id,
          studentId: document.docType === "student" ? studentId.trim() : undefined,
        },
        document.name,
      );
    } catch (error) {
      console.error("Failed to generate document", error);
      setGenerateError("Failed to generate document");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <Box className="p-4">{t("Loading...")}</Box>;
  if (!document) return <Box className="p-4">{t("Document not found")}</Box>;

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Box>
          <Box className="mb-1 flex items-center gap-2">
            <IconButton onClick={() => navigate(`/${role}/documents`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{document.name}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/settings`}>{t("Settings")}</Link>
            <Link to={`/${role}/documents`}>{t("Documents")}</Link>
            <Typography color="text.primary">{document.name}</Typography>
          </Breadcrumbs>
        </Box>

        <Box className="flex flex-wrap gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />} onClick={() => navigate(`/${role}/documents/edit/${document._id}`)}>
            {t("Edit")}
          </Button>
          <Button variant="surface" color="grey" startIcon={<NiPrinter size="medium" />} onClick={handleGenerate} disabled={generating}>
            {generating ? t("Generating PDF...") : t("Generate PDF")}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card className="rounded-[24px] shadow-sm">
            <CardContent className="space-y-4">
              <Typography variant="h6">{t("Template Details")}</Typography>
              <Box className="flex flex-wrap gap-2">
                <Chip label={t(document.docType)} color={document.docType === "student" ? "primary" : document.docType === "system" ? "warning" : "default"} variant="outlined" />
                <Chip label={t(document.status)} color={getStatusColor(document.status)} />
                <Chip label={document.pageSettings?.preset || "A4"} variant="outlined" />
              </Box>
              <Typography color="text.secondary">{document.description || t("No internal note")}</Typography>
              <Divider />
              <Typography variant="body2">{t("Variables in template")}: <strong>{document.shortcodes?.length || 0}</strong></Typography>
              <Typography variant="body2">{t("Paper orientation")}: <strong>{document.pageSettings?.orientation || "portrait"}</strong></Typography>
              <Typography variant="body2">{t("Updated")}: <strong>{document.updatedAt ? new Date(document.updatedAt).toLocaleString() : "-"}</strong></Typography>
            </CardContent>
          </Card>

          <Card className="mt-4 rounded-[24px] shadow-sm">
            <CardContent className="space-y-4">
              <Typography variant="h6">{t("Generate Output")}</Typography>
              {document.docType === "student" && (
                <TextField
                  fullWidth
                  size="small"
                  label={t("Student ID")}
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  placeholder={t("Enter student ID")}
                />
              )}
              {generateError && <Alert severity="error">{t(generateError)}</Alert>}
              <Typography variant="body2" color="text.secondary">
                {document.docType === "student"
                  ? t("Student template replaces student variables before download.")
                  : t("System and other templates download with current system variables only.")}
              </Typography>
            </CardContent>
          </Card>

          <Card className="mt-4 rounded-[24px] shadow-sm">
            <CardContent className="space-y-3">
              <Typography variant="h6">{t("System Variables")}</Typography>
              <Box className="flex flex-wrap gap-2">
                {SYSTEM_DOCUMENT_VARIABLES.map((item) => (
                  <Chip key={item.templateVariable} label={item.templateVariable} size="small" variant="outlined" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper className="overflow-auto rounded-[28px] bg-[#dde5ee] p-5 shadow-sm">
            <Box className="mx-auto rounded-[14px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]" sx={paperStyle}>
              <Box
                className="ql-editor"
                sx={{
                  position: "relative",
                  minHeight: "100%",
                  "& .document-shape-embed": {
                    pointerEvents: "auto",
                  },
                }}
                dangerouslySetInnerHTML={{ __html: document.templateContent || "<p></p>" }}
              />
            </Box>
          </Paper>

          <Card className="mt-4 rounded-[24px] shadow-sm">
            <CardContent className="space-y-3">
              <Typography variant="h6">{t("Used Variables")}</Typography>
              <Box className="flex flex-wrap gap-2">
                {(document.shortcodes || []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">{t("No variables inside document")}</Typography>
                ) : (
                  document.shortcodes.map((shortcode) => (
                    <Chip key={shortcode} label={shortcode} color="success" variant="outlined" />
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
