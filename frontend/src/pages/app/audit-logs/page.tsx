import { useCallback, useEffect, useState, ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Breadcrumbs,
  Typography,
  Grid,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  TextField,
  InputAdornment,
  Divider,
  Chip,
  MenuItem,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { AuditLogService } from "@/services/auditLogService";
import { AuditLog, AuditLogQuery } from "@/types/auditLog";
import NiArrowInDown from "@/icons/nexture/ni-arrow-in-down";
import NiSearch from "@/icons/nexture/ni-search";
import NiArrowUp from "@/icons/nexture/ni-arrow-up";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiChevronLeftSmall from "@/icons/nexture/ni-chevron-left-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";

type Order = "asc" | "desc";

interface HeadCell {
  id: keyof AuditLog | "actions";
  label: string;
  numeric: boolean;
}

const ACTION_OPTIONS = [
  "create",
  "update",
  "delete",
  "login",
  "logout",
  "export",
  "import",
  "view",
];

const ENTITY_TYPE_OPTIONS = [
  "user",
  "student",
  "visaApplication",
  "school",
  "schoolSubmission",
  "task",
  "transaction",
  "invoice",
  "document",
  "partnerAgency",
  "event",
  "visitor",
  "target",
  "batch",
  "account",
  "branch",
  "teacher",
  "workflowRule",
];

export default function AuditLogsIndex() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useParams();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof AuditLog>("timestamp" as any);

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [entityType, setEntityType] = useState("");
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);

  const headCells: HeadCell[] = [
    { id: "timestamp", label: t("Date & Time"), numeric: false },
    { id: "action", label: t("Action"), numeric: false },
    { id: "entityType", label: t("Entity Type"), numeric: false },
    { id: "entityId", label: t("Entity ID"), numeric: false },
    { id: "user", label: t("User"), numeric: false },
    { id: "ipAddress", label: t("IP Address"), numeric: false },
  ];

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const query: AuditLogQuery = {
        page: page + 1,
        limit: rowsPerPage,
        search: search,
        action: action,
        entityType: entityType,
        startDate: startDate ? startDate.startOf("day").toISOString() : undefined,
        endDate: endDate ? endDate.endOf("day").toISOString() : undefined,
      };
      const response = await AuditLogService.getAuditLogs(query);
      if (response.success) {
        setAuditLogs(Array.isArray(response.data) ? response.data : []);
        setTotalCount(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, action, entityType, startDate, endDate]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleRequestSort = (property: keyof AuditLog) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = () => {
    const query = {
      startDate: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      search: search,
      action: action,
      entityType: entityType,
    };
    AuditLogService.exportAuditLogs(query);
  };

  const formatDateTime = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const cellSx = { border: "none", py: 1.5, px: 2 } as const;
  const headCellSx = { ...cellSx, py: 1.25, fontWeight: 600, color: "text.secondary", fontSize: "0.8rem", textTransform: "uppercase" as const, letterSpacing: "0.04em" } as const;

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {t("Audit Logs")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Typography color="text.primary">{t("Audit Logs")}</Typography>
          </Breadcrumbs>
        </Box>

        <Box className="flex items-center gap-2 flex-wrap">
          <Button
            variant="surface"
            color="grey"
            startIcon={<NiArrowInDown size="medium" />}
            onClick={handleExport}
          >
            {t("Export")}
          </Button>
        </Box>
      </Box>

      <Box className="bg-background-paper mb-4 p-4 rounded-xl shadow-sm">
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t("Search...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NiSearch size="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              select
              size="small"
              placeholder={t("Action")}
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <MenuItem value="">{t("All Actions")}</MenuItem>
              {ACTION_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {t(opt)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <TextField
              fullWidth
              select
              size="small"
              placeholder={t("Entity Type")}
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
            >
              <MenuItem value="">{t("All Types")}</MenuItem>
              {ENTITY_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {t(opt)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} className="flex justify-end gap-2">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label={t("Start Date")}
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
              />
              <DatePicker
                label={t("End Date")}
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { size: "small", sx: { width: 150 } } }}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Box>

      <TableContainer className="bg-background-paper rounded-xl shadow-sm" sx={{ p: 1 }}>
        <Table className="mt-4 w-full min-w-3xl">
          <TableHead className="border-b-1 border-gray-200">
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? "right" : "left"}
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={headCellSx}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : "asc"}
                    onClick={() => handleRequestSort(headCell.id as keyof AuditLog)}
                    IconComponent={NiArrowUp}
                  >
                    {headCell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ ...cellSx, py: 8 }}>
                  <Typography variant="body1">{t("Loading...")}</Typography>
                </TableCell>
              </TableRow>
            ) : auditLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ ...cellSx, py: 8 }}>
                  <Typography variant="body1">{t("No audit logs found")}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              auditLogs.map((log, index) => {
                const id = log._id || index.toString();
                return (
                  <TableRow
                    hover
                    role="checkbox"
                    tabIndex={-1}
                    key={id}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 2,
                      transition: "background-color 0.15s ease",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <TableCell sx={{ ...cellSx, fontWeight: 500 }}>
                      {formatDateTime(log.timestamp)}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip label={t(log.action)} size="small" color="default" />
                    </TableCell>
                    <TableCell sx={cellSx}>{t(log.entityType)}</TableCell>
                    <TableCell sx={cellSx}>{log.entityId || "-"}</TableCell>
                    <TableCell sx={cellSx}>{log.user?.fullName || "-"}</TableCell>
                    <TableCell sx={cellSx}>{log.ipAddress || "-"}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <Divider />
        <TablePagination
          className="flex justify-end bg-background-paper"
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          slotProps={{
            spacer: { className: "flex-none" },
            toolbar: { className: "px-0" },
            select: {
              IconComponent: () => {
                return (
                  <NiChevronDownSmall size="medium" className="pointer-events-none absolute end-1"></NiChevronDownSmall>
                );
              },
            },
          }}
          slots={{
            actions: {
              nextButton: (slotProps) => {
                return (
                  <Button
                    disabled={slotProps.disabled}
                    onClick={slotProps.onClick}
                    className="icon-only hover:bg-primary/10 hover:text-primary"
                    size="medium"
                    color="text-primary"
                    variant="text"
                    startIcon={<NiChevronRightSmall size={"medium"} />}
                  />
                );
              },
              previousButton: (slotProps) => {
                return (
                  <Button
                    disabled={slotProps.disabled}
                    onClick={slotProps.onClick}
                    className="icon-only hover:bg-primary/10 hover:text-primary"
                    size="medium"
                    color="text-primary"
                    variant="text"
                    startIcon={<NiChevronLeftSmall size={"medium"} />}
                  />
                );
              },
            },
          }}
        />
      </TableContainer>
    </Box>
  );
}