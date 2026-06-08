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

import { FAQService } from "@/services/faqService";
import { FAQ } from "@/types/faq";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function FAQView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [faq, setFaq] = useState<FAQ | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchFAQ = async () => {
        try {
          const response = await FAQService.getFAQById(id);
          if (response.success && response.data) {
            setFaq(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch FAQ", error);
        } finally {
          setLoading(false);
        }
      };
      fetchFAQ();
    }
  }, [id]);

  const handleDelete = async () => {
    if (faq?._id && window.confirm(t("Are you sure you want to delete this FAQ?"))) {
      try {
        await FAQService.deleteFAQ(faq._id);
        navigate(`/${role}/faqs`);
      } catch (error) {
        console.error("Failed to delete FAQ", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!faq) return <Box className="p-4"><Typography>{t("FAQ not found")}</Typography></Box>;

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/faqs`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{t("FAQ Details")}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/faqs`}>{t("FAQs")}</Link>
            <Typography color="text.primary">{faq.question?.substring(0, 20)}...</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/faqs/edit/${faq._id}`)}>
            {t("Edit")}
          </Button>
          <Button variant="surface" color="error" startIcon={<NiBinEmpty size="medium" />} onClick={handleDelete}>
            {t("Delete")}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Question")}</Typography>
              <Typography variant="body1" className="mb-4">{faq.question}</Typography>
              
              <Divider className="my-4" />
              
              <Typography variant="h6" className="mb-4">{t("Answer")}</Typography>
              <Typography variant="body1">{faq.answer}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Details")}</Typography>
              
              <Box className="mb-3">
                <Typography variant="caption" color="textSecondary">{t("Category")}</Typography>
                <Typography variant="body1">{faq.category || "-"}</Typography>
              </Box>
              
              <Box className="mb-3">
                <Typography variant="caption" color="textSecondary">{t("Order")}</Typography>
                <Typography variant="body1">{faq.order || 0}</Typography>
              </Box>
              
              <Box className="mb-3">
                <Typography variant="caption" color="textSecondary">{t("Status")}</Typography>
                <Box className="mt-1">
                  <Chip label={faq.isActive ? t("Active") : t("Inactive")} size="small" color={faq.isActive ? "success" : "default"} />
                </Box>
              </Box>
              
              <Box className="mb-3">
                <Typography variant="caption" color="textSecondary">{t("Created At")}</Typography>
                <Typography variant="body1">{formatDate(faq.createdAt)}</Typography>
              </Box>
              
              <Box className="mb-3">
                <Typography variant="caption" color="textSecondary">{t("Last Updated")}</Typography>
                <Typography variant="body1">{formatDate(faq.updatedAt)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}