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
  IconButton,
  Chip,
  Breadcrumbs,
} from "@mui/material";

import { InventoryService } from "@/services/inventoryService";
import { InventoryItem, InventoryLog } from "@/types/inventory";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

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

const getLogActionColor = (action?: string) => {
  switch (action) {
    case "created": return "success";
    case "updated": return "info";
    case "deleted": return "error";
    case "stock_in": return "success";
    case "stock_out": return "error";
    case "reorder": return "warning";
    default: return "default";
  }
};

const formatDate = (date?: string | Date | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString();
};

const formatDateTime = (date?: string | Date | null) => {
  if (!date) return "-";
  return new Date(date).toLocaleString();
};

const formatCurrency = (amount?: number) => {
  if (amount === undefined || amount === null) return "-";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
};

export default function InventoryView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchItem = async () => {
        try {
          const response = await InventoryService.getItemById(id);
          if (response.success && response.data) {
            setItem(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch inventory item", error);
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      const fetchLogs = async () => {
        try {
          const response = await InventoryService.getLogs({ itemId: id, limit: 10 });
          if (response.success && response.data) {
            setLogs(Array.isArray(response.data) ? response.data : []);
          }
        } catch (error) {
          console.error("Failed to fetch inventory logs", error);
        }
      };
      fetchLogs();
    }
  }, [id]);

  const handleDelete = async () => {
    if (item?._id && window.confirm(t("Are you sure you want to delete this item?"))) {
      try {
        await InventoryService.deleteItem(item._id);
        navigate(`/${role}/inventory`);
      } catch (error) {
        console.error("Failed to delete inventory item", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!item) return <Box className="p-4"><Typography>{t("Item not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | number | null | string[] }) => (
    <Box className="mb-3">
      <Typography variant="caption" color="textSecondary">{label}</Typography>
      <Typography variant="body1">{value ? (Array.isArray(value) ? value.join(", ") : String(value)) : "-"}</Typography>
    </Box>
  );

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/inventory`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{item.name}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/inventory`}>{t("Inventory")}</Link>
            <Typography color="text.primary">{item.name}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/inventory/edit/${item._id}`)}>
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
              <Typography variant="h6" className="mb-4">{t("Item Summary")}</Typography>
              <Divider className="mb-4" />
              <Box className="mb-4">
                <Typography variant="h3">{formatCurrency(item.unitPrice)}</Typography>
                <Box className="mt-2">
                  <Chip label={t(item.status || "")} size="small" color={getStatusColor(item.status)} variant="outlined" />
                </Box>
              </Box>
              <Divider className="mb-4" />
              <Box>
                <InfoItem label={t("SKU")} value={item.sku} />
                <InfoItem label={t("Category")} value={item.category} />
                <InfoItem label={t("Supplier")} value={item.supplier} />
                <InfoItem label={t("Created At")} value={formatDate(item.createdAt)} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Stock Information")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box className="text-center p-4 bg-background-paper rounded-lg">
                    <Typography variant="h3" color={getStockStatus(item.quantity, item.reorderLevel) === "warning" ? "warning.main" : "success.main"}>
                      {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">{t("Current Stock")}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box className="text-center p-4 bg-background-paper rounded-lg">
                    <Typography variant="h3">{formatCurrency(item.unitPrice)}</Typography>
                    <Typography variant="body2" color="textSecondary">{t("Unit Price")}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box className="text-center p-4 bg-background-paper rounded-lg">
                    <Typography variant="h3">{item.reorderLevel ?? 10}</Typography>
                    <Typography variant="body2" color="textSecondary">{t("Reorder Level")}</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Description")}</Typography>
              <Typography variant="body1">{item.description || "-"}</Typography>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Activity Log")}</Typography>
              {logs.length === 0 ? (
                <Typography variant="body2" color="textSecondary">{t("No activity logs found")}</Typography>
              ) : (
                <Box>
                  {logs.map((log, index) => (
                    <Box key={log._id || index} className="flex items-start gap-3 py-2">
                      <Chip label={t(log.action || "")} size="small" color={getLogActionColor(log.action)} variant="outlined" />
                      <Box className="flex-1">
                        <Typography variant="body2">
                          {log.quantity !== undefined && log.previousQuantity !== undefined
                            ? `${t("Stock changed from")} ${log.previousQuantity} ${t("to")} ${log.quantity}`
                            : log.notes || t(log.action || "")}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDateTime(log.createdAt)}
                          {log.performedBy && ` • ${log.performedBy}`}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}