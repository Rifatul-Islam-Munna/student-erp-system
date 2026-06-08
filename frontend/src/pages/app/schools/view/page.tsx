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

import { SchoolService } from "@/services/schoolService";
import { School } from "@/types/school";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function SchoolView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchSchool = async () => {
        try {
          const response = await SchoolService.getSchoolById(id);
          if (response.success && response.data) {
            setSchool(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch school", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSchool();
    }
  }, [id]);

  const handleDelete = async () => {
    if (school?._id && window.confirm(t("Are you sure you want to delete this school?"))) {
      try {
        await SchoolService.deleteSchool(school._id);
        navigate(`/${role}/schools`);
      } catch (error) {
        console.error("Failed to delete school", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!school) return <Box className="p-4"><Typography>{t("School not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | number | boolean | null | undefined }) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "boolean") {
      return (
        <Box className="mb-3">
          <Typography variant="caption" color="textSecondary">{label}</Typography>
          <Box>
            <Chip
              label={value ? t("Yes") : t("No")}
              size="small"
              color={value ? "success" : "default"}
              variant="outlined"
            />
          </Box>
        </Box>
      );
    }
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
            <IconButton onClick={() => navigate(`/${role}/schools`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{school.name}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/schools`}>{t("Schools")}</Link>
            <Typography color="text.primary">{school.name}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/schools/edit/${school._id}`)}>
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
                {school.name?.charAt(0)}
              </Avatar>
              <Typography variant="h4">{school.name}</Typography>
              {school.country && (
                <Typography variant="body2" color="textSecondary">
                  {school.city}, {school.country}
                </Typography>
              )}
              <Box className="mt-2 flex gap-2">
                {school.scholarshipAvailable && (
                  <Chip label={t("Scholarship Available")} size="small" color="success" variant="outlined" />
                )}
              </Box>
              <Divider className="w-full my-4" />
              <Box className="w-full">
                <InfoItem label={t("Ranking")} value={school.ranking} />
                <InfoItem label={t("Intake")} value={school.intake} />
                <InfoItem label={t("Website")} value={school.website} />
              </Box>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Contact Information")}</Typography>
              <InfoItem label={t("Email")} value={school.email} />
              <InfoItem label={t("Phone")} value={school.phone} />
              <InfoItem label={t("Address")} value={school.address} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Location")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InfoItem label={t("Country")} value={school.country} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InfoItem label={t("City")} value={school.city} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <InfoItem label={t("Address")} value={school.address} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Fees")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label={t("Tuition Fee")} value={school.tuitionFee ? `$${school.tuitionFee.toLocaleString()}` : undefined} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label={t("Application Fee")} value={school.applicationFee ? `$${school.applicationFee.toLocaleString()}` : undefined} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {school.programs && school.programs.length > 0 && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Programs")}</Typography>
                <Box className="flex flex-wrap gap-1">
                  {school.programs.map((program, index) => (
                    <Chip key={index} label={program} variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {school.requirements && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Requirements")}</Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {school.requirements}
                </Typography>
              </CardContent>
            </Card>
          )}

          {school.description && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Description")}</Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {school.description}
                </Typography>
              </CardContent>
            </Card>
          )}

          {(school.createdAt || school.updatedAt) && (
            <Card className="rounded-xl shadow-sm">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Timestamps")}</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem label={t("Created")} value={formatDate(school.createdAt)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem label={t("Last Updated")} value={formatDate(school.updatedAt)} />
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