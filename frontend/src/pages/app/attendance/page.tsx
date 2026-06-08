import { useCallback, useEffect, useState, ChangeEvent, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Breadcrumbs,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Divider,
  Chip,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

import { AttendanceService } from "@/services/attendanceService";
import { Attendance, AttendanceQuery } from "@/types/attendance";
import NiArrowInDown from "@/icons/nexture/ni-arrow-in-down";
import NiArrowInUp from "@/icons/nexture/ni-arrow-in-up";
import NiSearch from "@/icons/nexture/ni-search";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiChevronLeftSmall from "@/icons/nexture/ni-chevron-left-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";

export default function AttendanceIndex() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useParams();

  const [records, setRecords] = useState<Attendance[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const query: AttendanceQuery = {
        page: page + 1,
        limit: rowsPerPage,
        search: search,
        startDate: startDate ? startDate.startOf("day").toISOString() : undefined,
        endDate: endDate ? endDate.endOf("day").toISOString() : undefined,
      };
      const response = await AttendanceService.getAttendance(query);
      if (response.success) {
        setRecords(Array.isArray(response.data) ? response.data : []);
        setTotalCount(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch attendance", error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, startDate, endDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

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
    };
    AttendanceService.exportAttendance(query);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await AttendanceService.importAttendance(file);
        alert(t("Import successful"));
        fetchAttendance();
      } catch (error: any) {
        alert(error.message || t("Import failed"));
      } finally {
        if (event.target) event.target.value = "";
      }
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "present": return "success";
      case "absent": return "error";
      case "late": return "warning";
      case "excused": return "info";
      default: return "default";
    }
  };

  const cellSx = { border: "none", py: 1.5, px: 2 } as const;
  const headCellSx = { ...cellSx, py: 1.25, fontWeight: 600, color: "text.secondary", fontSize: "0.8rem", textTransform: "uppercase" as const, letterSpacing: "0.04em" } as const;

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {t("Attendance")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Typography color="text.primary">{t("Attendance")}</Typography>
          </Breadcrumbs>
        </Box>

        <Box className="flex items-center gap-2 flex-wrap">
          <Button variant="surface" color="grey" startIcon={<NiArrowInUp size="medium" />} onClick={handleImportClick}>
            {t("Import")}
          </Button>
          <input type="file" ref={fileInputRef} style={{ display: "none" }} accept=".csv" onChange={handleFileChange} />
          <Button variant="surface" color="grey" startIcon={<NiArrowInDown size="medium" />} onClick={handleExport}>
            {t("Export")}
          </Button>
        </Box>
      </Box>

      <Box className="bg-background-paper mb-4 p-4 rounded-xl shadow-sm">
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth size="small" placeholder={t("Search...")}
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><NiSearch size="small" /></InputAdornment>),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }} className="flex justify-end gap-2">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker label={t("Start Date")} value={startDate} onChange={(newValue) => setStartDate(newValue)}
                slotProps={{ textField: { size: "small", sx: { width: 150 } } }} />
              <DatePicker label={t("End Date")} value={endDate} onChange={(newValue) => setEndDate(newValue)}
                slotProps={{ textField: { size: "small", sx: { width: 150 } } }} />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Box>

      <TableContainer className="bg-background-paper rounded-xl shadow-sm" sx={{ p: 1 }}>
        <Table className="mt-4 w-full min-w-3xl">
          <TableHead className="border-b-1 border-gray-200">
            <TableRow>
              <TableCell sx={headCellSx}>{t("Date")}</TableCell>
              <TableCell sx={headCellSx}>{t("Student")}</TableCell>
              <TableCell sx={headCellSx}>{t("Batch")}</TableCell>
              <TableCell sx={headCellSx}>{t("Status")}</TableCell>
              <TableCell sx={headCellSx}>{t("Remarks")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ ...cellSx, py: 8 }}><Typography variant="body1">{t("Loading...")}</Typography></TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ ...cellSx, py: 8 }}><Typography variant="body1">{t("No attendance records found")}</Typography></TableCell></TableRow>
            ) : (
              records.map((record, index) => (
                <TableRow key={index} hover sx={{ cursor: "pointer", borderRadius: 2, "&:hover": { bgcolor: "action.hover" } }}>
                  <TableCell sx={cellSx}>{formatDate(record.date)}</TableCell>
                  <TableCell sx={cellSx}>{record.student?.fullNameEn || record.student?.fullName || "-"}</TableCell>
                  <TableCell sx={cellSx}>{record.batch?.name || "-"}</TableCell>
                  <TableCell sx={cellSx}>
                    <Chip label={t(record.status || "")} size="small" color={getStatusColor(record.status)} />
                  </TableCell>
                  <TableCell sx={cellSx}>{record.remarks || "-"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <Divider />
        <TablePagination className="flex justify-end bg-background-paper" rowsPerPageOptions={[5, 10, 25, 50]} component="div"
          count={totalCount} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
          slotProps={{ spacer: { className: "flex-none" }, toolbar: { className: "px-0" }, select: { IconComponent: () => (<NiChevronDownSmall size="medium" className="pointer-events-none absolute end-1"></NiChevronDownSmall>) } }}
          slots={{
            actions: {
              nextButton: (slotProps) => (<Button disabled={slotProps.disabled} onClick={slotProps.onClick} className="icon-only hover:bg-primary/10 hover:text-primary" size="medium" color="text-primary" variant="text" startIcon={<NiChevronRightSmall size={"medium"} />} />),
              previousButton: (slotProps) => (<Button disabled={slotProps.disabled} onClick={slotProps.onClick} className="icon-only hover:bg-primary/10 hover:text-primary" size="medium" color="text-primary" variant="text" startIcon={<NiChevronLeftSmall size={"medium"} />} />),
            },
          }}
        />
      </TableContainer>
    </Box>
  );
}