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
  Chip,
  MenuItem,
} from "@mui/material";

import { InventoryService } from "@/services/inventoryService";
import { InventoryItem, InventoryItemQuery } from "@/types/inventory";
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
  id: keyof InventoryItem | "actions";
  label: string;
  numeric: boolean;
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case "active": return "success";
    case "inactive": return "warning";
    case "discontinued": return "error";
    default: return "default";
  }
};

const getStockStatus = (quantity?: number, reorderLevel?: number) => {
  if (quantity === undefined || quantity === null) return "default";
  if (reorderLevel !== undefined && quantity <= reorderLevel) return "warning";
  return "success";
};

export default function InventoryIndex() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useParams();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof InventoryItem>("createdAt" as any);

  const [selected, setSelected] = useState<readonly string[]>([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const headCells: HeadCell[] = [
    { id: "name", label: t("Name"), numeric: false },
    { id: "category", label: t("Category"), numeric: false },
    { id: "sku", label: t("SKU"), numeric: false },
    { id: "quantity", label: t("Quantity"), numeric: true },
    { id: "unitPrice", label: t("Unit Price"), numeric: true },
    { id: "supplier", label: t("Supplier"), numeric: false },
    { id: "status", label: t("Status"), numeric: false },
    { id: "actions", label: t("Actions"), numeric: false },
  ];

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const query: InventoryItemQuery = {
        page: page + 1,
        limit: rowsPerPage,
        search: search,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        sortBy: orderBy as string,
        sortOrder: order,
      };
      const response = await InventoryService.getItems(query);
      if (response.success) {
        setItems(Array.isArray(response.data) ? response.data : []);
        setTotalCount(response.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch inventory items", error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, categoryFilter, statusFilter, orderBy, order]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await InventoryService.getCategories();
      if (response.success && response.data) {
        setCategories(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRequestSort = (property: keyof InventoryItem) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = items.map((n) => n._id as string);
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
        await InventoryService.deleteItem(id);
        fetchItems();
      } catch (error) {
        console.error("Failed to delete inventory item", error);
      }
    }
  };

  const handleExport = () => {
    const query = {
      search: search,
      category: categoryFilter,
      status: statusFilter,
    };
    InventoryService.exportItems(query);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await InventoryService.importItems(file);
        alert(t("Import successful"));
        fetchItems();
      } catch (error: any) {
        alert(error.message || t("Import failed"));
      } finally {
        if (event.target) event.target.value = "";
      }
    }
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "-";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const cellSx = { border: "none", py: 1.5, px: 2 } as const;
  const headCellSx = { ...cellSx, py: 1.25, fontWeight: 600, color: "text.secondary", fontSize: "0.8rem", textTransform: "uppercase" as const, letterSpacing: "0.04em" } as const;

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {t("Inventory")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Typography color="text.primary">{t("Inventory")}</Typography>
          </Breadcrumbs>
        </Box>

        <Box className="flex items-center gap-2 flex-wrap">
          <Button variant="surface" color="grey" startIcon={<NiArrowInUp size="medium" />} onClick={handleImportClick}>
            {t("Import")}
          </Button>
          <Button variant="surface" color="grey" startIcon={<NiArrowInDown size="medium" />} onClick={handleExport}>
            {t("Export")}
          </Button>
          <Button variant="surface" color="primary" startIcon={<NiPlus size="medium" />} onClick={() => navigate(`/${role}/inventory/create`)}>
            {t("New Item")}
          </Button>
        </Box>
      </Box>

      <Box className="bg-background-paper mb-4 p-4 rounded-xl shadow-sm">
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth size="small" placeholder={t("Search by name, SKU...")}
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (<InputAdornment position="start"><NiSearch size="small" /></InputAdornment>),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth select size="small" placeholder={t("Category")}
              value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <MenuItem value="">{t("All Categories")}</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth select size="small" placeholder={t("Status")}
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="">{t("All Status")}</MenuItem>
              <MenuItem value="active">{t("Active")}</MenuItem>
              <MenuItem value="inactive">{t("Inactive")}</MenuItem>
              <MenuItem value="discontinued">{t("Discontinued")}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      <TableContainer className="bg-background-paper rounded-xl shadow-sm" sx={{ p: 1 }}>
        <Table className="mt-4 w-full min-w-3xl">
          <TableHead className="border-b-1 border-gray-200">
            <TableRow>
              <TableCell sx={{ ...headCellSx, width: 48, pr: 0 }}>
                <Checkbox color="primary" indeterminate={selected.length > 0 && selected.length < items.length}
                  checked={items.length > 0 && selected.length === items.length} onChange={handleSelectAllClick}
                  icon={<CheckboxSmallEmptyOutlined />} checkedIcon={<CheckboxSmallChecked />} indeterminateIcon={<CheckboxSmallIndeterminate />} />
              </TableCell>
              {headCells.map((headCell) => (
                <TableCell key={headCell.id} align={headCell.numeric ? "right" : "left"}
                  sortDirection={orderBy === headCell.id ? order : false} sx={headCellSx}>
                  {headCell.id !== "actions" ? (
                    <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : "asc"}
                      onClick={() => handleRequestSort(headCell.id as keyof InventoryItem)} IconComponent={NiArrowUp}>
                      {headCell.label}
                    </TableSortLabel>
                  ) : headCell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ ...cellSx, py: 8 }}><Typography variant="body1">{t("Loading...")}</Typography></TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ ...cellSx, py: 8 }}><Typography variant="body1">{t("No inventory items found")}</Typography></TableCell></TableRow>
            ) : (
              items.map((item, index) => {
                const id = item._id as string;
                const isItemSelected = isSelected(id);
                const labelId = `inventory-checkbox-${index}`;

                return (
                  <TableRow hover role="checkbox" aria-checked={isItemSelected} tabIndex={-1} key={id} selected={isItemSelected}
                    sx={{ cursor: "pointer", borderRadius: 2, transition: "background-color 0.15s ease", "&:hover": { bgcolor: "action.hover" }, "&.Mui-selected": { bgcolor: "primary.50" } }}>
                    <TableCell sx={{ ...cellSx, width: 48, pr: 0 }} onClick={() => handleClick(id)}>
                      <Checkbox color="primary" checked={isItemSelected} icon={<CheckboxSmallEmptyOutlined />} checkedIcon={<CheckboxSmallChecked />} indeterminateIcon={<CheckboxSmallIndeterminate />} />
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row" sx={{ ...cellSx, fontWeight: 500 }} onClick={() => navigate(`/${role}/inventory/view/${id}`)}>{item.name}</TableCell>
                    <TableCell sx={cellSx} onClick={() => navigate(`/${role}/inventory/view/${id}`)}>{item.category}</TableCell>
                    <TableCell sx={cellSx} onClick={() => navigate(`/${role}/inventory/view/${id}`)}>{item.sku}</TableCell>
                    <TableCell sx={cellSx} onClick={() => navigate(`/${role}/inventory/view/${id}`)} align="right">
                      <Chip label={item.quantity} size="small" color={getStockStatus(item.quantity, item.reorderLevel)} variant="outlined" />
                    </TableCell>
                    <TableCell sx={cellSx} onClick={() => navigate(`/${role}/inventory/view/${id}`)} align="right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell sx={cellSx} onClick={() => navigate(`/${role}/inventory/view/${id}`)}>{item.supplier || "-"}</TableCell>
                    <TableCell sx={cellSx} onClick={() => navigate(`/${role}/inventory/view/${id}`)}>
                      <Chip label={t(item.status || "")} size="small" color={getStatusColor(item.status)} />
                    </TableCell>
                    <TableCell align="right" sx={cellSx}>
                      <Box className="flex justify-end gap-1">
                        <Tooltip title={t("View")}>
                          <IconButton size="small" onClick={() => navigate(`/${role}/inventory/view/${id}`)}
                            sx={{ transition: "all 0.2s", "&:hover": { bgcolor: "primary.50", color: "primary.main" } }}>
                            <NiEyeOpen size="medium" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("Edit")}>
                          <IconButton size="small" onClick={() => navigate(`/${role}/inventory/edit/${id}`)}
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