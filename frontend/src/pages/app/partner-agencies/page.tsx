import { useCallback, useEffect, useState, ChangeEvent, useRef } from "react";
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
  Checkbox,
  TextField,
  InputAdornment,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

import { PartnerAgencyService } from "@/services/partnerAgencyService";
import { PartnerAgency, PartnerAgencyQuery } from "@/types/partnerAgency";
import NiPlus from "@/icons/nexture/ni-plus";
import NiEyeOpen from "@/icons/nexture/ni-eye-open";
import NiPen from "@/icons/nexture/ni-pen";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiArrowInDown from "@/icons/nexture/ni-arrow-in-down";
import NiArrowInUp from "@/icons/nexture/ni-arrow-in-up";
import NiSearch from "@/icons/nexture/ni-search";
import NiArrowUp from "@/icons/nexture/ni-arrow-up";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiChevronLeftSmall from "@/icons/nexture/ni-chevron-left-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import {
  CheckboxSmallChecked,
  CheckboxSmallEmptyOutlined,
  CheckboxSmallIndeterminate,
} from "@/icons/form/mui-checkbox";

type Order = "asc" | "desc";

interface HeadCell {
  id: keyof PartnerAgency | "actions";
  label: string;
  numeric: boolean;
}

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

export default function PartnerAgenciesIndex() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useParams();

  const [partnerAgencies, setPartnerAgencies] = useState<PartnerAgency[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof PartnerAgency>("createdAt" as any);

  const [selected, setSelected] = useState<readonly string[]>([]);

  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const headCells: HeadCell[] = [
    { id: "name", label: t("Partner Agency Name"), numeric: false },
    { id: "code", label: t("Code"), numeric: false },
    { id: "country", label: t("Country"), numeric: false },
    { id: "city", label: t("City"), numeric: false },
    { id: "contactPerson", label: t("Contact Person"), numeric: false },
    { id: "commissionRate", label: t("Commission Rate"), numeric: true },
    { id: "status", label: t("Status"), numeric: false },
    { id: "actions", label: t("Actions"), numeric: false },
  ];

  const fetchPartnerAgencies = useCallback(async () => {
    setLoading(true);
    try {
      const query: PartnerAgencyQuery = {
        page: page + 1,
        limit: rowsPerPage,
        search: search,
        country: countryFilter,
      };
      const response = await PartnerAgencyService.getPartnerAgencies(query);
      if (response.success) {
        setPartnerAgencies(Array.isArray(response.data) ? response.data : []);
        setTotalCount(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch partner agencies", error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, countryFilter]);

  useEffect(() => {
    fetchPartnerAgencies();
  }, [fetchPartnerAgencies]);

  const handleRequestSort = (property: keyof PartnerAgency) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = partnerAgencies.map((n) => n._id as string);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t("confirm-delete"))) {
      try {
        await PartnerAgencyService.deletePartnerAgency(id);
        fetchPartnerAgencies();
      } catch (error) {
        console.error("Failed to delete partner agency", error);
      }
    }
  };

  const handleExport = () => {
    const query = {
      search: search,
      country: countryFilter,
    };
    PartnerAgencyService.exportPartnerAgencies(query);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await PartnerAgencyService.importPartnerAgencies(file);
        alert(t("Import successful"));
        fetchPartnerAgencies();
      } catch (error: any) {
        alert(error.message || t("Import failed"));
      } finally {
        if (event.target) event.target.value = "";
      }
    }
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const cellSx = { border: "none", py: 1.5, px: 2 } as const;
  const headCellSx = { ...cellSx, py: 1.25, fontWeight: 600, color: "text.secondary", fontSize: "0.8rem", textTransform: "uppercase" as const, letterSpacing: "0.04em" } as const;

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {t("Partner Agencies")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Typography color="text.primary">{t("Partner Agencies")}</Typography>
          </Breadcrumbs>
        </Box>

        <Box className="flex items-center gap-2 flex-wrap">
          <Button
            variant="surface"
            color="grey"
            startIcon={<NiArrowInUp size="medium" />}
            onClick={handleImportClick}
          >
            {t("Import")}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".csv"
            onChange={handleFileChange}
          />
          <Button
            variant="surface"
            color="grey"
            startIcon={<NiArrowInDown size="medium" />}
            onClick={handleExport}
          >
            {t("Export")}
          </Button>
          <Button
            variant="surface"
            color="primary"
            startIcon={<NiPlus size="medium" />}
            onClick={() => navigate(`/${role}/partner-agencies/create`)}
          >
            {t("New Partner Agency")}
          </Button>
        </Box>
      </Box>

      <Box className="bg-background-paper mb-4 p-4 rounded-xl shadow-sm">
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t("Search by name, code, contact person...")}
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
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t("Country")}</InputLabel>
              <Select
                value={countryFilter}
                label={t("Country")}
                onChange={(e) => setCountryFilter(e.target.value)}
              >
                <MenuItem value="">{t("All Countries")}</MenuItem>
                {COUNTRIES.map((country) => (
                  <MenuItem key={country} value={country}>{country}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} className="flex justify-end">
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearch("");
                setCountryFilter("");
              }}
            >
              {t("Clear Filters")}
            </Button>
          </Grid>
        </Grid>
      </Box>

      <TableContainer className="bg-background-paper rounded-xl shadow-sm" sx={{ p: 1 }}>
        <Table className="mt-4 w-full min-w-3xl">
          <TableHead className="border-b-1 border-gray-200">
            <TableRow>
              <TableCell sx={{ ...headCellSx, width: 48, pr: 0 }}>
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < partnerAgencies.length}
                  checked={partnerAgencies.length > 0 && selected.length === partnerAgencies.length}
                  onChange={handleSelectAllClick}
                  icon={<CheckboxSmallEmptyOutlined />}
                  checkedIcon={<CheckboxSmallChecked />}
                  indeterminateIcon={<CheckboxSmallIndeterminate />}
                />
              </TableCell>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? "right" : "left"}
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={headCellSx}
                >
                  {headCell.id !== "actions" ? (
                    <TableSortLabel
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : "asc"}
                      onClick={() => handleRequestSort(headCell.id as keyof PartnerAgency)}
                      IconComponent={NiArrowUp}
                    >
                      {headCell.label}
                    </TableSortLabel>
                  ) : (
                    headCell.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ ...cellSx, py: 8 }}>
                  <Typography variant="body1">{t("Loading...")}</Typography>
                </TableCell>
              </TableRow>
            ) : partnerAgencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ ...cellSx, py: 8 }}>
                  <Typography variant="body1">{t("No partner agencies found")}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              partnerAgencies.map((partnerAgency, index) => {
                const id = partnerAgency._id as string;
                const isItemSelected = isSelected(id);
                const labelId = `partner-agency-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={id}
                    selected={isItemSelected}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 2,
                      transition: "background-color 0.15s ease",
                      "&:hover": { bgcolor: "action.hover" },
                      "&.Mui-selected": { bgcolor: "primary.50" },
                    }}
                  >
                    <TableCell sx={{ ...cellSx, width: 48, pr: 0 }} onClick={() => handleClick(id)}>
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        icon={<CheckboxSmallEmptyOutlined />}
                        checkedIcon={<CheckboxSmallChecked />}
                        indeterminateIcon={<CheckboxSmallIndeterminate />}
                      />
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row" sx={{ ...cellSx, fontWeight: 500 }} onClick={() => navigate(`/${role}/partner-agencies/view/${id}`)}>
                      {partnerAgency.name}
                    </TableCell>
                    <TableCell sx={cellSx} onClick={() => navigate(`/${role}/partner-agencies/view/${id}`)}>{partnerAgency.code}</TableCell>
                    <TableCell sx={cellSx} onClick={() => navigate(`/${role}/partner-agencies/view/${id}`)}>{partnerAgency.country}</TableCell>
                    <TableCell sx={cellSx} onClick={() => navigate(`/${role}/partner-agencies/view/${id}`)}>{partnerAgency.city}</TableCell>
                    <TableCell sx={cellSx} onClick={() => navigate(`/${role}/partner-agencies/view/${id}`)}>{partnerAgency.contactPerson}</TableCell>
                    <TableCell sx={cellSx} onClick={() => navigate(`/${role}/partner-agencies/view/${id}`)}>
                      {partnerAgency.commissionRate !== undefined ? `${partnerAgency.commissionRate}%` : "-"}
                    </TableCell>
                    <TableCell sx={cellSx} onClick={() => navigate(`/${role}/partner-agencies/view/${id}`)}>
                      {partnerAgency.status === "active" ? t("Active") : t("Inactive")}
                    </TableCell>
                    <TableCell align="right" sx={cellSx}>
                      <Box className="flex justify-end gap-1">
                        <Tooltip title={t("View")}>
                          <IconButton size="small" onClick={() => navigate(`/${role}/partner-agencies/view/${id}`)}
                            sx={{ transition: "all 0.2s", "&:hover": { bgcolor: "primary.50", color: "primary.main" } }}>
                            <NiEyeOpen size="medium" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("Edit")}>
                          <IconButton size="small" onClick={() => navigate(`/${role}/partner-agencies/edit/${id}`)}
                            sx={{ transition: "all 0.2s", "&:hover": { bgcolor: "primary.50", color: "primary.main" } }}>
                            <NiPen size="medium" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("Delete")}>
                          <IconButton size="small" onClick={() => handleDelete(id)} color="error"
                            sx={{ transition: "all 0.2s", "&:hover": { bgcolor: "error.50" } }}>
                            <NiBinEmpty size="medium" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
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