import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Tabs,
  Tab,
  MenuItem,
  IconButton,
  Divider,
  Breadcrumbs,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Link } from "react-router-dom";

import { TransactionService } from "@/services/transactionService";
import { Transaction, TransactionType } from "@/types/transaction";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  date: yup.date().required("Date is required"),
  account: yup.string().required("Account is required"),
  type: yup.string().oneOf(["debit", "credit"]).required("Type is required"),
  amount: yup.number().required("Amount is required").positive("Amount must be positive"),
  description: yup.string().required("Description is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>{children}</Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function TransactionUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<Transaction>>({
    initialValues: {
      date: undefined,
      account: "",
      type: "debit" as TransactionType,
      amount: 0,
      description: "",
      reference: "",
      relatedInvoice: "",
      relatedStudent: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const data = {
          ...values,
          relatedInvoice: values.relatedInvoice || undefined,
          relatedStudent: values.relatedStudent || undefined,
        };
        if (isEdit && id) {
          await TransactionService.updateTransaction(id, data);
        } else {
          await TransactionService.createTransaction(data);
        }
        navigate(`/${role}/transactions`);
      } catch (error) {
        console.error("Failed to save transaction", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchTransaction = async () => {
        try {
          const response = await TransactionService.getTransactionById(id);
          if (response.success && response.data) {
            const transaction = response.data;
            formik.setValues({
              ...formik.initialValues,
              ...transaction,
              relatedInvoice: typeof transaction.relatedInvoice === "object" ? transaction.relatedInvoice?._id : transaction.relatedInvoice,
              relatedStudent: typeof transaction.relatedStudent === "object" ? transaction.relatedStudent?._id : transaction.relatedStudent,
            });
          }
        } catch (error) {
          console.error("Failed to fetch transaction", error);
        }
      };
      fetchTransaction();
    }
  }, [isEdit, id]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="p-4">
        <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Box>
            <Typography variant="h1" component="h1" className="mb-0">
              {isEdit ? t("Edit Transaction") : t("Create Transaction")}
            </Typography>
            <Breadcrumbs>
              <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
              <Link to={`/${role}/transactions`}>{t("Transactions")}</Link>
              <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
            </Breadcrumbs>
          </Box>
          <Button variant="text" color="grey" startIcon={<NiArrowLeft size="medium" />} onClick={() => navigate(`/${role}/transactions`)}>
            {t("Back to List")}
          </Button>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Card className="rounded-xl shadow-sm">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={(_event, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
                <Tab label={t("Basic Information")} />
                <Tab label={t("Related Information")} />
              </Tabs>
            </Box>

            <CardContent>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Transaction Details")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker label={t("Date")}
                      value={formik.values.date ? dayjs(formik.values.date) : null}
                      onChange={(value) => formik.setFieldValue("date", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true, error: formik.touched.date && Boolean(formik.errors.date), helperText: formik.touched.date && (formik.errors.date as string) } }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="account" name="account" label={t("Account")}
                      value={formik.values.account} onChange={formik.handleChange}
                      error={formik.touched.account && Boolean(formik.errors.account)}
                      helperText={formik.touched.account && formik.errors.account as string} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth select id="type" name="type" label={t("Type")}
                      value={formik.values.type || "debit"} onChange={formik.handleChange}
                      error={formik.touched.type && Boolean(formik.errors.type)}
                      helperText={formik.touched.type && formik.errors.type as string}>
                      <MenuItem value="debit">{t("Debit")}</MenuItem>
                      <MenuItem value="credit">{t("Credit")}</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="amount" name="amount" label={t("Amount")} type="number"
                      value={formik.values.amount} onChange={formik.handleChange}
                      error={formik.touched.amount && Boolean(formik.errors.amount)}
                      helperText={formik.touched.amount && formik.errors.amount as string} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="reference" name="reference" label={t("Reference")}
                      value={formik.values.reference || ""} onChange={formik.handleChange} />
                  </Grid>
                  <Grid size={12}>
                    <TextField fullWidth id="description" name="description" label={t("Description")} multiline rows={3}
                      value={formik.values.description} onChange={formik.handleChange}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description as string} />
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Related Information")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="relatedInvoice" name="relatedInvoice" label={t("Related Invoice")}
                      value={formik.values.relatedInvoice || ""} onChange={formik.handleChange}
                      placeholder={t("Enter invoice ID or leave empty")} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="relatedStudent" name="relatedStudent" label={t("Related Student")}
                      value={formik.values.relatedStudent || ""} onChange={formik.handleChange}
                      placeholder={t("Enter student ID or leave empty")} />
                  </Grid>
                </Grid>
              )}
            </CardContent>

            <Divider />
            <Box className="p-4 flex justify-end gap-2">
              <Button color="grey" onClick={() => navigate(`/${role}/transactions`)}>{t("Cancel")}</Button>
              <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
                {loading ? t("Saving...") : t("Save Transaction")}
              </Button>
            </Box>
          </Card>
        </form>
      </Box>
    </LocalizationProvider>
  );
}