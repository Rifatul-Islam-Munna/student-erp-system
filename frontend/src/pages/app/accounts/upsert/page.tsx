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
  Divider,
  FormControlLabel,
  Checkbox,
  Breadcrumbs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Link } from "react-router-dom";
import { AccountService } from "@/services/accountService";
import { Account, AccountType, AccountStatus } from "@/types/account";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  name: yup.string().required("Account Name is required"),
  code: yup.string().required("Account Code is required"),
  type: yup.string().required("Account Type is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>
      {children}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function AccountUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<Account>>({
    initialValues: {
      name: "",
      code: "",
      type: "asset" as AccountType,
      balance: 0,
      parentAccount: "",
      description: "",
      status: "active" as AccountStatus,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await AccountService.updateAccount(id, values);
        } else {
          await AccountService.createAccount(values);
        }
        navigate(`/${role}/accounts`);
      } catch (error) {
        console.error("Failed to save account", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchAccount = async () => {
        try {
          const response = await AccountService.getAccountById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch account", error);
        }
      };
      fetchAccount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {isEdit ? t("Edit Account") : t("Create Account")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/accounts`}>{t("Accounts")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="text"
          color="grey"
          startIcon={<NiArrowLeft size="medium" />}
          onClick={() => navigate(`/${role}/accounts`)}
        >
          {t("Back to List")}
        </Button>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Card className="rounded-xl shadow-sm">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label={t("Basic Information")} />
              <Tab label={t("Additional Details")} />
            </Tabs>
          </Box>

          <CardContent>
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Account Information")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="name" name="name" label={t("Account Name")}
                    value={formik.values.name} onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="code" name="code" label={t("Account Code")}
                    value={formik.values.code} onChange={formik.handleChange}
                    error={formik.touched.code && Boolean(formik.errors.code)}
                    helperText={formik.touched.code && formik.errors.code} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>{t("Account Type")}</InputLabel>
                    <Select
                      value={formik.values.type || "asset"}
                      label={t("Account Type")}
                      onChange={(e) => formik.setFieldValue("type", e.target.value)}
                    >
                      <MenuItem value="asset">{t("Asset")}</MenuItem>
                      <MenuItem value="liability">{t("Liability")}</MenuItem>
                      <MenuItem value="equity">{t("Equity")}</MenuItem>
                      <MenuItem value="income">{t("Income")}</MenuItem>
                      <MenuItem value="expense">{t("Expense")}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="balance" name="balance" label={t("Balance")}
                    type="number" value={formik.values.balance || 0} onChange={formik.handleChange} />
                </Grid>

                <SectionLabel>{t("Status")}</SectionLabel>
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formik.values.status === "active"}
                        onChange={(e) => formik.setFieldValue("status", e.target.checked ? "active" : "inactive")}
                      />
                    }
                    label={t("Active")}
                  />
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Hierarchy")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="parentAccount" name="parentAccount" label={t("Parent Account")}
                    value={formik.values.parentAccount || ""} onChange={formik.handleChange}
                    placeholder={t("Enter parent account ID (optional)")} />
                </Grid>

                <SectionLabel>{t("Description")}</SectionLabel>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={6}
                    id="description"
                    name="description"
                    label={t("Description")}
                    value={formik.values.description || ""}
                    onChange={formik.handleChange}
                    placeholder={t("Enter account description...")}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>

          <Divider />
          <Box className="p-4 flex justify-end gap-2">
            <Button color="grey" onClick={() => navigate(`/${role}/accounts`)}>{t("Cancel")}</Button>
            <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
              {loading ? t("Saving...") : t("Save Account")}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}