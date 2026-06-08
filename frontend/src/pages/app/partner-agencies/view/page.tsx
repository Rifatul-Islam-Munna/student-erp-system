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
  Avatar,
  Paper,
  Chip,
  Breadcrumbs,
  IconButton,
} from "@mui/material";

import { PartnerAgencyService } from "@/services/partnerAgencyService";
import { PartnerAgency } from "@/types/partnerAgency";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function PartnerAgencyView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [partnerAgency, setPartnerAgency] = useState<PartnerAgency | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchPartnerAgency = async () => {
        try {
          const response = await PartnerAgencyService.getPartnerAgencyById(id);
          if (response.success && response.data) {
            setPartnerAgency(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch partner agency", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPartnerAgency();
    }
  }, [id]);

  const handleDelete = async () => {
    if (partnerAgency?._id && window.confirm(t("Are you sure you want to delete this partner agency?"))) {
      try {
        await PartnerAgencyService.deletePartnerAgency(partnerAgency._id);
        navigate(`/${role}/partner-agencies`);
      } catch (error) {
        console.error("Failed to delete partner agency", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!partnerAgency) return <Box className="p-4"><Typography>{t("Partner Agency not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | number | boolean | null | undefined }) => {
    if (value === null || value === undefined) return null;
    return (
      <Box className="mb-3">
        <Typography variant="caption" color="textSecondary">{label}</Typography>
        <Typography variant="body1">{value}</Typography>
      </Box>
    );
  };

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/partner-agencies`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{partnerAgency.name}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/partner-agencies`}>{t("Partner Agencies")}</Link>
            <Typography color="text.primary">{partnerAgency.name}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/partner-agencies/edit/${partnerAgency._id}`)}>
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
            <CardContent className="flex flex-col items-center">
              <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: "primary.main", fontSize: 36 }}>
                {partnerAgency.name?.charAt(0)}
              </Avatar>
              <Typography variant="h4">{partnerAgency.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {partnerAgency.code}
              </Typography>
              <Box className="mt-2 flex gap-2">
                <Chip 
                  label={partnerAgency.status === "active" ? t("Active") : t("Inactive")} 
                  size="small" 
                  color={partnerAgency.status === "active" ? "success" : "default"} 
                  variant="outlined" 
                />
              </Box>
              <Divider className="w-full my-4" />
              <Box className="w-full">
                <InfoItem label={t("Code")} value={partnerAgency.code} />
                <InfoItem label={t("Contact Person")} value={partnerAgency.contactPerson} />
                <InfoItem label={t("Commission Rate")} value={partnerAgency.commissionRate !== undefined ? `${partnerAgency.commissionRate}%` : undefined} />
              </Box>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Contact Information")}</Typography>
              <InfoItem label={t("Email")} value={partnerAgency.email} />
              <InfoItem label={t("Phone")} value={partnerAgency.phone} />
              <InfoItem label={t("Website")} value={partnerAgency.website} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Location")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InfoItem label={t("Country")} value={partnerAgency.country} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InfoItem label={t("City")} value={partnerAgency.city} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InfoItem label={t("Address")} value={partnerAgency.address} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {partnerAgency.notes && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Notes")}</Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {partnerAgency.notes}
                </Typography>
              </CardContent>
            </Card>
          )}

          {(partnerAgency.createdAt || partnerAgency.updatedAt) && (
            <Card className="rounded-xl shadow-sm">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Timestamps")}</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem label={t("Created")} value={formatDate(partnerAgency.createdAt)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem label={t("Last Updated")} value={formatDate(partnerAgency.updatedAt)} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}