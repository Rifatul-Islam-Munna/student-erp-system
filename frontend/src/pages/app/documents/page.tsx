import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "notistack";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import NiArrowInDown from "@/icons/nexture/ni-arrow-in-down";
import NiArrowInUp from "@/icons/nexture/ni-arrow-in-up";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiEyeOpen from "@/icons/nexture/ni-eye-open";
import NiFolderPlus from "@/icons/nexture/ni-folder-plus";
import NiPen from "@/icons/nexture/ni-pen";
import NiSearch from "@/icons/nexture/ni-search";
import { DocumentService } from "@/services/documentService";
import { DocumentQuery, DocumentTemplate } from "@/types/document";

const getStatusColor = (status: DocumentTemplate["status"]) => {
  if (status === "active") return "success";
  if (status === "inactive") return "default";
  return "warning";
};

export default function DocumentsIndex() {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { role } = useParams();

  const [documents, setDocuments] = useState<DocumentTemplate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [docType, setDocType] = useState<DocumentQuery["docType"]>("");
  const [status, setStatus] = useState<DocumentQuery["status"]>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await DocumentService.getDocuments({
        page: page + 1,
        limit: rowsPerPage,
        search,
        docType,
        status,
      });
      if (response.success) {
        setDocuments(Array.isArray(response.data) ? response.data : []);
        setTotalCount(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch documents", error);
    } finally {
      setLoading(false);
    }
  }, [docType, page, rowsPerPage, search, status]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("Are you sure you want to delete this document?"))) return;
    try {
      await DocumentService.deleteDocument(id);
      enqueueSnackbar(t("Document deleted successfully"), { variant: "success" });
      await fetchDocuments();
    } catch (error: any) {
      console.error("Failed to delete document", error);
      enqueueSnackbar(error?.message || t("Failed to delete document"), { variant: "error" });
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await DocumentService.importDocuments(file);
      fetchDocuments();
    } catch (error) {
      console.error("Failed to import documents", error);
    } finally {
      event.target.value = "";
    }
  };

  const cellSx = { border: "none", py: 1.5, px: 2 } as const;
  const headCellSx = {
    ...cellSx,
    py: 1.25,
    fontWeight: 600,
    color: "text.secondary",
    fontSize: "0.8rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
  } as const;

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {t("Documents")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/settings`}>{t("Settings")}</Link>
            <Typography color="text.primary">{t("Documents")}</Typography>
          </Breadcrumbs>
        </Box>

        <Box className="flex flex-wrap items-center gap-2">
          <Button variant="surface" color="grey" startIcon={<NiArrowInUp size="medium" />} onClick={handleImportClick}>
            {t("Import")}
          </Button>
          <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".csv" onChange={handleFileChange} />
          <Button variant="surface" color="grey" startIcon={<NiArrowInDown size="medium" />} onClick={() => DocumentService.exportDocuments({ search, docType, status })}>
            {t("Export")}
          </Button>
          <Button variant="surface" color="primary" startIcon={<NiFolderPlus size="medium" />} onClick={() => navigate(`/${role}/documents/create`)}>
            {t("Create Document")}
          </Button>
        </Box>
      </Box>

      <Box className="bg-background-paper mb-4 rounded-xl p-4 shadow-sm">
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t("Search by title or note")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NiSearch size="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth select size="small" label={t("Document Type")} value={docType} onChange={(event) => setDocType(event.target.value as DocumentQuery["docType"])}>
              <MenuItem value="">{t("All Types")}</MenuItem>
              <MenuItem value="student">{t("Student")}</MenuItem>
              <MenuItem value="system">{t("System")}</MenuItem>
              <MenuItem value="other">{t("Other")}</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth select size="small" label={t("Status")} value={status} onChange={(event) => setStatus(event.target.value as DocumentQuery["status"])}>
              <MenuItem value="">{t("All Status")}</MenuItem>
              <MenuItem value="draft">{t("Draft")}</MenuItem>
              <MenuItem value="active">{t("Active")}</MenuItem>
              <MenuItem value="inactive">{t("Inactive")}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <TableContainer className="bg-background-paper rounded-xl shadow-sm" sx={{ p: 1 }}>
        <Table className="mt-4 w-full min-w-3xl">
          <TableHead className="border-b-1 border-gray-200">
            <TableRow>
              <TableCell sx={headCellSx}>{t("Title")}</TableCell>
              <TableCell sx={headCellSx}>{t("Type")}</TableCell>
              <TableCell sx={headCellSx}>{t("Paper")}</TableCell>
              <TableCell sx={headCellSx}>{t("Variables")}</TableCell>
              <TableCell sx={headCellSx}>{t("Status")}</TableCell>
              <TableCell sx={headCellSx}>{t("Updated")}</TableCell>
              <TableCell sx={{ ...headCellSx, textAlign: "right" }}>{t("Actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ ...cellSx, py: 8 }}>
                  <Typography variant="body1">{t("Loading...")}</Typography>
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ ...cellSx, py: 8 }}>
                  <Typography variant="body1">{t("No documents found")}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              documents.map((document) => (
                <TableRow key={document._id} hover sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                  <TableCell sx={{ ...cellSx, minWidth: 280 }} onClick={() => navigate(`/${role}/documents/view/${document._id}`)}>
                    <Typography fontWeight={600}>{document.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {document.description || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Chip label={t(document.docType)} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Typography fontWeight={600}>{document.pageSettings?.preset || "A4"}</Typography>
                    <Typography variant="body2" color="text.secondary">{document.pageSettings?.orientation || "portrait"}</Typography>
                  </TableCell>
                  <TableCell sx={cellSx}>{document.shortcodes?.length || 0}</TableCell>
                  <TableCell sx={cellSx}>
                    <Chip label={t(document.status)} size="small" color={getStatusColor(document.status)} />
                  </TableCell>
                  <TableCell sx={cellSx}>{document.updatedAt ? new Date(document.updatedAt).toLocaleDateString() : "-"}</TableCell>
                  <TableCell align="right" sx={cellSx}>
                    <Tooltip title={t("View")}>
                      <IconButton size="small" onClick={() => navigate(`/${role}/documents/view/${document._id}`)}>
                        <NiEyeOpen size="medium" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("Edit")}>
                      <IconButton size="small" onClick={() => navigate(`/${role}/documents/edit/${document._id}`)}>
                        <NiPen size="medium" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("Delete")}>
                      <IconButton size="small" color="error" onClick={() => void handleDelete(document._id as string)}>
                        <NiBinEmpty size="medium" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </TableContainer>
    </Box>
  );
}
