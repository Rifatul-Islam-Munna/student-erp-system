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

import { InvoiceService } from "@/services/invoiceService";
import { StudentService } from "@/services/studentService";
import { Invoice, InvoiceItem } from "@/types/invoice";
import { Student } from "@/types/student";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiPlus from "@/icons/nexture/ni-plus";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

const validationSchema = yup.object({
  invoiceNumber: yup.string().required("Invoice Number is required"),
  student: yup.string().required("Student is required"),
  amount: yup.number().required("Amount is required").positive("Amount must be positive"),
  status: yup.string().oneOf(["pending", "paid", "overdue", "cancelled", "draft"]).required("Status is required"),
  dueDate: yup.date().required("Due Date is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>{children}</Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function InvoiceUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);

  const formik = useFormik<Partial<Invoice>>({
    initialValues: {
      invoiceNumber: "",
      student: "",
      amount: 0,
      status: "draft",
      dueDate: undefined,
      paidDate: undefined,
      items: [],
      notes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await InvoiceService.updateInvoice(id, values);
        } else {
          await InvoiceService.createInvoice(values);
        }
        navigate(`/${role}/invoices`);
      } catch (error) {
        console.error("Failed to save invoice", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await StudentService.getStudents({ limit: 1000 });
        if (response.success) {
          setStudents(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch students", error);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      const fetchInvoice = async () => {
        try {
          const response = await InvoiceService.getInvoiceById(id);
          if (response.success && response.data) {
            const invoice = response.data;
            formik.setValues({
              ...formik.initialValues,
              ...invoice,
            });
          }
        } catch (error) {
          console.error("Failed to fetch invoice", error);
        }
      };
      fetchInvoice();
    } else {
      const generateInvoiceNumber = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
        formik.setFieldValue("invoiceNumber", `INV-${year}${month}-${random}`);
      };
      generateInvoiceNumber();
    }
  }, [isEdit, id]);

  useEffect(() => {
    const total = (formik.values.items || []).reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    if (total > 0 && !isEdit) {
      formik.setFieldValue("amount", total);
    }
  }, [formik.values.items]);

  const addItem = () => {
    const items = formik.values.items || [];
    formik.setFieldValue("items", [...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    const items = [...(formik.values.items || [])];
    items.splice(index, 1);
    formik.setFieldValue("items", items);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const items = [...(formik.values.items || [])];
    items[index] = { ...items[index], [field]: value };
    if (field === "quantity" || field === "unitPrice") {
      items[index].total = items[index].quantity * items[index].unitPrice;
    }
    formik.setFieldValue("items", items);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box className="p-4">
        <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Box>
            <Typography variant="h1" component="h1" className="mb-0">
              {isEdit ? t("Edit Invoice") : t("Create Invoice")}
            </Typography>
            <Breadcrumbs>
              <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
              <Link to={`/${role}/invoices`}>{t("Invoices")}</Link>
              <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
            </Breadcrumbs>
          </Box>
          <Button variant="text" color="grey" startIcon={<NiArrowLeft size="medium" />} onClick={() => navigate(`/${role}/invoices`)}>
            {t("Back to List")}
          </Button>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Card className="rounded-xl shadow-sm">
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={tabValue} onChange={(_event, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
                <Tab label={t("Basic Information")} />
                <Tab label={t("Items")} />
                <Tab label={t("Notes")} />
              </Tabs>
            </Box>

            <CardContent>
              {tabValue === 0 && (
                <Grid container spacing={3}>
                  <SectionLabel>{t("Invoice Details")}</SectionLabel>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="invoiceNumber" name="invoiceNumber" label={t("Invoice Number")}
                      value={formik.values.invoiceNumber} onChange={formik.handleChange}
                      error={formik.touched.invoiceNumber && Boolean(formik.errors.invoiceNumber)}
                      helperText={formik.touched.invoiceNumber && formik.errors.invoiceNumber} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth select id="student" name="student" label={t("Student")}
                      value={typeof formik.values.student === "string" ? formik.values.student : formik.values.student?._id || ""}
                      onChange={formik.handleChange}
                      error={formik.touched.student && Boolean(formik.errors.student)}
                      helperText={formik.touched.student && formik.errors.student as string}>
                      {students.map((student) => (
                        <MenuItem key={student._id} value={student._id}>{student.fullNameEn}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth id="amount" name="amount" label={t("Amount")} type="number"
                      value={formik.values.amount} onChange={formik.handleChange}
                      error={formik.touched.amount && Boolean(formik.errors.amount)}
                      helperText={formik.touched.amount && formik.errors.amount as string} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth select id="status" name="status" label={t("Status")}
                      value={formik.values.status || "draft"} onChange={formik.handleChange}>
                      <MenuItem value="draft">{t("Draft")}</MenuItem>
                      <MenuItem value="pending">{t("Pending")}</MenuItem>
                      <MenuItem value="paid">{t("Paid")}</MenuItem>
                      <MenuItem value="overdue">{t("Overdue")}</MenuItem>
                      <MenuItem value="cancelled">{t("Cancelled")}</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker label={t("Due Date")}
                      value={formik.values.dueDate ? dayjs(formik.values.dueDate) : null}
                      onChange={(value) => formik.setFieldValue("dueDate", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true, error: formik.touched.dueDate && Boolean(formik.errors.dueDate), helperText: formik.touched.dueDate && (formik.errors.dueDate as string) } }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <DatePicker label={t("Paid Date")}
                      value={formik.values.paidDate ? dayjs(formik.values.paidDate) : null}
                      onChange={(value) => formik.setFieldValue("paidDate", value?.toISOString() || undefined)}
                      slotProps={{ textField: { fullWidth: true } }} />
                  </Grid>
                </Grid>
              )}

              {tabValue === 1 && (
                <Box>
                  <Box className="flex justify-between items-center mb-4">
                    <Typography variant="h6">{t("Invoice Items")}</Typography>
                    <Button startIcon={<NiPlus size="medium" />} onClick={addItem}>{t("Add Item")}</Button>
                  </Box>
                  {(formik.values.items || []).length === 0 && (
                    <Typography variant="body2" color="textSecondary" className="text-center py-8">{t("No items added yet")}</Typography>
                  )}
                  {formik.values.items?.map((item, index) => (
                    <Box key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-background-neutral/5">
                      <Box className="flex justify-between items-center mb-3">
                        <Typography variant="subtitle2">{t("Item")} #{index + 1}</Typography>
                        <IconButton color="error" size="small" onClick={() => removeItem(index)}><NiBinEmpty size="medium" /></IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField fullWidth label={t("Description")} name={`items.${index}.description`}
                            value={item.description || ""} onChange={(e) => updateItem(index, "description", e.target.value)} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                          <TextField fullWidth label={t("Quantity")} name={`items.${index}.quantity`} type="number"
                            value={item.quantity || ""} onChange={(e) => updateItem(index, "quantity", Number(e.target.value))} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                          <TextField fullWidth label={t("Unit Price")} name={`items.${index}.unitPrice`} type="number"
                            value={item.unitPrice || ""} onChange={(e) => updateItem(index, "unitPrice", Number(e.target.value))} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                          <TextField fullWidth label={t("Total")} name={`items.${index}.total`} type="number" disabled
                            value={item.quantity * item.unitPrice} />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}

              {tabValue === 2 && (
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <TextField fullWidth multiline rows={6} id="notes" name="notes" label={t("Notes")}
                      value={formik.values.notes || ""} onChange={formik.handleChange} />
                  </Grid>
                </Grid>
              )}
            </CardContent>

            <Divider />
            <Box className="p-4 flex justify-end gap-2">
              <Button color="grey" onClick={() => navigate(`/${role}/invoices`)}>{t("Cancel")}</Button>
              <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
                {loading ? t("Saving...") : t("Save Invoice")}
              </Button>
            </Box>
          </Card>
        </form>
      </Box>
    </LocalizationProvider>
  );
}