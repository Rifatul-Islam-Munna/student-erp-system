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
  Switch,
  FormControlLabel,
  Divider,
  Breadcrumbs,
  Checkbox,
} from "@mui/material";
import { Link } from "react-router-dom";

import { FAQService } from "@/services/faqService";
import { FAQ } from "@/types/faq";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";

const validationSchema = yup.object({
  question: yup.string().required("Question is required"),
  answer: yup.string().required("Answer is required"),
});

export default function FAQUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<FAQ>>({
    initialValues: {
      question: "",
      answer: "",
      category: "",
      order: 0,
      isActive: true,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await FAQService.updateFAQ(id, values);
        } else {
          await FAQService.createFAQ(values);
        }
        navigate(`/${role}/faqs`);
      } catch (error) {
        console.error("Failed to save FAQ", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchFAQ = async () => {
        try {
          const response = await FAQService.getFAQById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch FAQ", error);
        }
      };
      fetchFAQ();
    }
  }, [isEdit, id]);

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {isEdit ? t("Edit FAQ") : t("Create FAQ")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/faqs`}>{t("FAQs")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="text" color="grey" startIcon={<NiArrowLeft size="medium" />} onClick={() => navigate(`/${role}/faqs`)}>
          {t("Back to List")}
        </Button>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Card className="rounded-xl shadow-sm">
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth id="category" name="category" label={t("Category")}
                  value={formik.values.category || ""} onChange={formik.handleChange} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField fullWidth id="order" name="order" label={t("Order")} type="number"
                  value={formik.values.order || 0} onChange={formik.handleChange} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth id="question" name="question" label={t("Question")} multiline rows={2}
                  value={formik.values.question} onChange={formik.handleChange}
                  error={formik.touched.question && Boolean(formik.errors.question)}
                  helperText={formik.touched.question && formik.errors.question} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField fullWidth id="answer" name="answer" label={t("Answer")} multiline rows={4}
                  value={formik.values.answer} onChange={formik.handleChange}
                  error={formik.touched.answer && Boolean(formik.errors.answer)}
                  helperText={formik.touched.answer && formik.errors.answer} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel control={
                  <Checkbox checked={formik.values.isActive !== false}
                    onChange={(e) => formik.setFieldValue("isActive", e.target.checked)} />
                } label={t("Active")} />
              </Grid>
            </Grid>
          </CardContent>

          <Divider />
          <Box className="p-4 flex justify-end gap-2">
            <Button color="grey" onClick={() => navigate(`/${role}/faqs`)}>{t("Cancel")}</Button>
            <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
              {loading ? t("Saving...") : t("Save FAQ")}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}