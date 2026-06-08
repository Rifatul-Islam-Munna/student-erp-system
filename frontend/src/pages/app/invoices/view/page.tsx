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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import { InvoiceService } from "@/services/invoiceService";
import { Invoice } from "@/types/invoice";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function InvoiceView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchInvoice = async () => {
        try {
          const response = await InvoiceService.getInvoiceById(id);
          if (response.success && response.data) {
            setInvoice(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch invoice", error);
        } finally {
          setLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [id]);

  const handleDelete = async () => {
    if (invoice?._id && window.confirm(t("Are you sure you want to delete this invoice?"))) {
      try {
        await InvoiceService.deleteInvoice(invoice._id);
        navigate(`/${role}/invoices`);
      } catch (error) {
        console.error("Failed to delete invoice", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!invoice) return <Box className="p-4"><Typography>{t("Invoice not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | number | boolean | null | string[] }) => (
    <Box className="mb-3">
      <Typography variant="caption" color="textSecondary">{label}</Typography>
      <Typography variant="body1">{value ? (Array.isArray(value) ? value.join(", ") : String(value)) : "-"}</Typography>
    </Box>
  );

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "-";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const getStudentName = (student: Invoice["student"]) => {
    if (!student) return "-";
    if (typeof student === "string") return student;
    return student.fullNameEn || "-";
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "pending": return "warning";
      case "paid": return "success";
      case "overdue": return "error";
      case "cancelled": return "default";
      case "draft": return "info";
      default: return "default";
    }
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/invoices`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{invoice.invoiceNumber}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/invoices`}>{t("Invoices")}</Link>
            <Typography color="text.primary">{invoice.invoiceNumber}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/invoices/edit/${invoice._id}`)}>
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
              <Typography variant="h6" className="mb-4">{t("Invoice Summary")}</Typography>
              <Divider className="mb-4" />
              <Box className="mb-4">
                <Typography variant="h3" color="primary">{formatCurrency(invoice.amount)}</Typography>
                <Box className="mt-2">
                  <Chip label={t(invoice.status || "")} size="small" color={getStatusColor(invoice.status)} variant="outlined" />
                </Box>
              </Box>
              <Divider className="mb-4" />
              <Box>
                <InfoItem label={t("Invoice Number")} value={invoice.invoiceNumber} />
                <InfoItem label={t("Student")} value={getStudentName(invoice.student)} />
                <InfoItem label={t("Due Date")} value={formatDate(invoice.dueDate)} />
                <InfoItem label={t("Paid Date")} value={formatDate(invoice.paidDate)} />
                <InfoItem label={t("Created At")} value={formatDate(invoice.createdAt)} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {invoice.items && invoice.items.length > 0 && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Invoice Items")}</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>{t("Description")}</TableCell>
                      <TableCell align="right">{t("Quantity")}</TableCell>
                      <TableCell align="right">{t("Unit Price")}</TableCell>
                      <TableCell align="right">{t("Total")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{item.description || "-"}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.quantity * item.unitPrice)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={4} align="right"><Typography fontWeight={600}>{t("Total")}</Typography></TableCell>
                      <TableCell align="right"><Typography fontWeight={600}>{formatCurrency(invoice.amount)}</Typography></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {invoice.notes && (
            <Card className="rounded-xl shadow-sm">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Notes")}</Typography>
                <Typography variant="body1">{invoice.notes}</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}