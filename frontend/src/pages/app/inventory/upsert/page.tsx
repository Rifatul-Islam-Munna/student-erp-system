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
import { Link } from "react-router-dom";

import { InventoryService } from "@/services/inventoryService";
import { InventoryItem } from "@/types/inventory";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
  category: yup.string().required("Category is required"),
  sku: yup.string().required("SKU is required"),
  quantity: yup.number().required("Quantity is required").min(0, "Quantity must be at least 0"),
  unitPrice: yup.number().required("Unit price is required").min(0, "Unit price must be at least 0"),
  supplier: yup.string(),
  reorderLevel: yup.number().min(0, "Reorder level must be at least 0"),
  status: yup.string().oneOf(["active", "inactive", "discontinued"]),
  description: yup.string(),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>{children}</Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function InventoryUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const formik = useFormik<Partial<InventoryItem>>({
    initialValues: {
      name: "",
      category: "",
      sku: "",
      quantity: 0,
      unitPrice: 0,
      supplier: "",
      reorderLevel: 10,
      status: "active",
      description: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await InventoryService.updateItem(id, values);
        } else {
          await InventoryService.createItem(values);
        }
        navigate(`/${role}/inventory`);
      } catch (error) {
        console.error("Failed to save inventory item", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await InventoryService.getCategories();
        if (response.success && response.data) {
          setCategories(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      const fetchItem = async () => {
        try {
          const response = await InventoryService.getItemById(id);
          if (response.success && response.data) {
            const item = response.data;
            formik.setValues({
              ...formik.initialValues,
              ...item,
            });
          }
        } catch (error) {
          console.error("Failed to fetch inventory item", error);
        }
      };
      fetchItem();
    }
  }, [isEdit, id]);

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {isEdit ? t("Edit Item") : t("Create Item")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/inventory`}>{t("Inventory")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="text" color="grey" startIcon={<NiArrowLeft size="medium" />} onClick={() => navigate(`/${role}/inventory`)}>
          {t("Back to List")}
        </Button>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Card className="rounded-xl shadow-sm">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={(_event, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
              <Tab label={t("Basic Information")} />
              <Tab label={t("Stock Information")} />
              <Tab label={t("Additional Information")} />
            </Tabs>
          </Box>

          <CardContent>
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Item Details")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="name" name="name" label={t("Name")}
                    value={formik.values.name} onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name as string} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="sku" name="sku" label={t("SKU")}
                    value={formik.values.sku} onChange={formik.handleChange}
                    error={formik.touched.sku && Boolean(formik.errors.sku)}
                    helperText={formik.touched.sku && formik.errors.sku as string} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="category" name="category" label={t("Category")}
                    value={formik.values.category} onChange={formik.handleChange}
                    error={formik.touched.category && Boolean(formik.errors.category)}
                    helperText={formik.touched.category && formik.errors.category as string}
                    select>
                    {categories.length > 0 ? categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    )) : (
                      <>
                        <MenuItem value="Electronics">{t("Electronics")}</MenuItem>
                        <MenuItem value="Office Supplies">{t("Office Supplies")}</MenuItem>
                        <MenuItem value="Furniture">{t("Furniture")}</MenuItem>
                        <MenuItem value="Software">{t("Software")}</MenuItem>
                        <MenuItem value="Other">{t("Other")}</MenuItem>
                      </>
                    )}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="supplier" name="supplier" label={t("Supplier")}
                    value={formik.values.supplier || ""} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="status" name="status" label={t("Status")} select
                    value={formik.values.status || "active"} onChange={formik.handleChange}>
                    <MenuItem value="active">{t("Active")}</MenuItem>
                    <MenuItem value="inactive">{t("Inactive")}</MenuItem>
                    <MenuItem value="discontinued">{t("Discontinued")}</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={12}>
                  <TextField fullWidth id="description" name="description" label={t("Description")} multiline rows={3}
                    value={formik.values.description || ""} onChange={formik.handleChange} />
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Stock Details")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="quantity" name="quantity" label={t("Quantity")} type="number"
                    value={formik.values.quantity} onChange={formik.handleChange}
                    error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                    helperText={formik.touched.quantity && formik.errors.quantity as string} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="unitPrice" name="unitPrice" label={t("Unit Price")} type="number"
                    value={formik.values.unitPrice} onChange={formik.handleChange}
                    error={formik.touched.unitPrice && Boolean(formik.errors.unitPrice)}
                    helperText={formik.touched.unitPrice && formik.errors.unitPrice as string} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="reorderLevel" name="reorderLevel" label={t("Reorder Level")} type="number"
                    value={formik.values.reorderLevel ?? 10} onChange={formik.handleChange}
                    error={formik.touched.reorderLevel && Boolean(formik.errors.reorderLevel)}
                    helperText={formik.touched.reorderLevel && formik.errors.reorderLevel as string} />
                </Grid>
              </Grid>
            )}

            {tabValue === 2 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Additional Information")}</SectionLabel>
                <Grid size={12}>
                  <Typography variant="body2" color="textSecondary">
                    {t("Additional details can be added in future updates.")}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </CardContent>

          <Divider />
          <Box className="p-4 flex justify-end gap-2">
            <Button color="grey" onClick={() => navigate(`/${role}/inventory`)}>{t("Cancel")}</Button>
            <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
              {loading ? t("Saving...") : t("Save Item")}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}