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
  Paper,
  IconButton,
  Chip,
  Breadcrumbs,
} from "@mui/material";

import { VisaApplicationService } from "@/services/visaApplicationService";
import { VisaApplication } from "@/types/visaApplication";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function VisaApplicationView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [visaApplication, setVisaApplication] = useState<VisaApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchVisaApplication = async () => {
        try {
          const response = await VisaApplicationService.getVisaApplicationById(id);
          if (response.success && response.data) {
            setVisaApplication(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch visa application", error);
        } finally {
          setLoading(false);
        }
      };
      fetchVisaApplication();
    }
  }, [id]);

  const handleDelete = async () => {
    if (visaApplication?._id && window.confirm(t("Are you sure you want to delete this visa application?"))) {
      try {
        await VisaApplicationService.deleteVisaApplication(visaApplication._id);
        navigate(`/${role}/visa-applications`);
      } catch (error) {
        console.error("Failed to delete visa application", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!visaApplication) return <Box className="p-4"><Typography>{t("Visa application not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | null }) => (
    <Box className="mb-3">
      <Typography variant="caption" color="textSecondary">{label}</Typography>
      <Typography variant="body1">{value || "-"}</Typography>
    </Box>
  );

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved": return "success";
      case "rejected": return "error";
      case "withdrawn": return "default";
      case "interview_scheduled": return "info";
      case "documents_requested": return "warning";
      default: return "default";
    }
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/visa-applications`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{t("Visa Application")}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/visa-applications`}>{t("Visa Applications")}</Link>
            <Typography color="text.primary">{visaApplication.passportNumber}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/visa-applications/edit/${visaApplication._id}`)}>
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
              <Typography variant="h6" className="mb-4">{t("Application Overview")}</Typography>
              <InfoItem label={t("Passport Number")} value={visaApplication.passportNumber} />
              <InfoItem label={t("Visa Type")} value={visaApplication.visaType} />
              <InfoItem label={t("Status")} value={visaApplication.status ? t(visaApplication.status) : undefined} />
              <Box className="mt-2">
                {visaApplication.status && (
                  <Chip label={t(visaApplication.status)} color={getStatusColor(visaApplication.status) as any} />
                )}
              </Box>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Key Dates")}</Typography>
              <InfoItem label={t("Application Date")} value={formatDate(visaApplication.applicationDate)} />
              <InfoItem label={t("Interview Date")} value={formatDate(visaApplication.interviewDate)} />
              <InfoItem label={t("Visa Grant Date")} value={formatDate(visaApplication.visaGrantDate)} />
              <InfoItem label={t("Visa Expiry Date")} value={formatDate(visaApplication.visaExpiryDate)} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Notes")}</Typography>
              <Typography variant="body1" style={{ whiteSpace: "pre-wrap" }}>
                {visaApplication.notes || "-"}
              </Typography>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Metadata")}</Typography>
              <InfoItem label={t("Created At")} value={formatDate(visaApplication.createdAt)} />
              <InfoItem label={t("Updated At")} value={formatDate(visaApplication.updatedAt)} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}