import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  Paper,
  Chip,
  IconButton,
  Breadcrumbs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import { DocumentService } from "@/services/documentService";
import { DocumentTemplate } from "@/types/document";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function DocumentView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [document, setDocument] = useState<DocumentTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
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
    }
  }, [id]);

  const handleDelete = async () => {
    if (document?._id && window.confirm(t("Are you sure you want to delete this document?"))) {
      try {
        await DocumentService.deleteDocument(document._id);
        navigate(`/${role}/documents`);
      } catch (error) {
        console.error("Failed to delete document", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!document) return <Box className="p-4"><Typography>{t("Document not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | null }) => (
    <Box className="mb-3">
      <Typography variant="caption" color="textSecondary">{label}</Typography>
      <Typography variant="body1">{value || "-"}</Typography>
    </Box>
  );

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "draft":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/documents`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{document.name}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/documents`}>{t("Documents")}</Link>
            <Typography color="text.primary">{document.name}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/documents/edit/${document._id}`)}>
            {t("Edit")}
          </Button>
          <Button variant="surface" color="error" startIcon={<NiBinEmpty size="medium" />} onClick={handleDelete}>
            {t("Delete")}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Basic Information")}</Typography>
              <InfoItem label={t("Name")} value={document.name} />
              <InfoItem label={t("Type")} value={document.type} />
              <Box className="mb-3">
                <Typography variant="caption" color="textSecondary">{t("Status")}</Typography>
                <Box className="mt-1">
                  <Chip
                    label={t(document.status || "")}
                    size="small"
                    color={getStatusColor(document.status)}
                  />
                </Box>
              </Box>
              <InfoItem label={t("File URL")} value={document.fileUrl} />
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Timestamps")}</Typography>
              <InfoItem label={t("Created At")} value={formatDate(document.createdAt)} />
              <InfoItem label={t("Updated At")} value={formatDate(document.updatedAt)} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Content")}</Typography>
              <Paper
                variant="outlined"
                className="p-4"
                sx={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  minHeight: 200,
                  bgcolor: "grey.50",
                }}
              >
                {document.content || t("No content defined")}
              </Paper>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Shortcodes")}</Typography>
              {(document.shortcodes && document.shortcodes.length > 0) ? (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("Shortcode")}</TableCell>
                      <TableCell>{t("Placeholder")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {document.shortcodes.map((shortcode, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{shortcode}</TableCell>
                        <TableCell>
                          <Chip label={`{{${shortcode}}}`} size="small" variant="outlined" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  {t("No shortcodes defined")}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}