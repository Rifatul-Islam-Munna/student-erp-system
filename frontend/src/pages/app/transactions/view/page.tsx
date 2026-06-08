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

import { TransactionService } from "@/services/transactionService";
import { Transaction, TransactionType } from "@/types/transaction";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function TransactionView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchTransaction = async () => {
        try {
          const response = await TransactionService.getTransactionById(id);
          if (response.success && response.data) {
            setTransaction(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch transaction", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTransaction();
    }
  }, [id]);

  const handleDelete = async () => {
    if (transaction?._id && window.confirm(t("Are you sure you want to delete this transaction?"))) {
      try {
        await TransactionService.deleteTransaction(transaction._id);
        navigate(`/${role}/transactions`);
      } catch (error) {
        console.error("Failed to delete transaction", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!transaction) return <Box className="p-4"><Typography>{t("Transaction not found")}</Typography></Box>;

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

  const getTypeColor = (type?: TransactionType) => {
    switch (type) {
      case "debit": return "error";
      case "credit": return "success";
      default: return "default";
    }
  };

  const getInvoiceNumber = (invoice: Transaction["relatedInvoice"]) => {
    if (!invoice) return "-";
    if (typeof invoice === "string") return invoice;
    return invoice.invoiceNumber || "-";
  };

  const getStudentName = (student: Transaction["relatedStudent"]) => {
    if (!student) return "-";
    if (typeof student === "string") return student;
    return student.fullNameEn || "-";
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/transactions`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{transaction.reference || transaction._id}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/transactions`}>{t("Transactions")}</Link>
            <Typography color="text.primary">{transaction.reference || transaction._id}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/transactions/edit/${transaction._id}`)}>
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
              <Typography variant="h6" className="mb-4">{t("Transaction Summary")}</Typography>
              <Divider className="mb-4" />
              <Box className="mb-4">
                <Typography variant="h3" color={transaction.type === "credit" ? "success.main" : "error.main"}>
                  {transaction.type === "credit" ? "+" : "-"}{formatCurrency(transaction.amount)}
                </Typography>
                <Box className="mt-2">
                  <Chip label={t(transaction.type || "")} size="small" color={getTypeColor(transaction.type)} variant="outlined" />
                </Box>
              </Box>
              <Divider className="mb-4" />
              <Box>
                <InfoItem label={t("Date")} value={formatDate(transaction.date)} />
                <InfoItem label={t("Account")} value={transaction.account} />
                <InfoItem label={t("Reference")} value={transaction.reference} />
                <InfoItem label={t("Created At")} value={formatDate(transaction.createdAt)} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Description")}</Typography>
              <Typography variant="body1">{transaction.description || "-"}</Typography>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Related Information")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoItem label={t("Related Invoice")} value={getInvoiceNumber(transaction.relatedInvoice)} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <InfoItem label={t("Related Student")} value={getStudentName(transaction.relatedStudent)} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}