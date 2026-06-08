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

import { BatchService } from "@/services/batchService";
import { Batch } from "@/types/batch";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

const statusColors: Record<string, "success" | "warning" | "error" | "default"> = {
  active: "success",
  completed: "default",
  upcoming: "warning",
  cancelled: "error",
};

export default function BatchView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchBatch = async () => {
        try {
          const response = await BatchService.getBatchById(id);
          if (response.success && response.data) {
            setBatch(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch batch", error);
        } finally {
          setLoading(false);
        }
      };
      fetchBatch();
    }
  }, [id]);

  const handleDelete = async () => {
    if (batch?._id && window.confirm(t("Are you sure you want to delete this batch?"))) {
      try {
        await BatchService.deleteBatch(batch._id);
        navigate(`/${role}/batches`);
      } catch (error) {
        console.error("Failed to delete batch", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!batch) return <Box className="p-4"><Typography>{t("Batch not found")}</Typography></Box>;

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
            <IconButton onClick={() => navigate(`/${role}/batches`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{batch.name}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/batches`}>{t("Batches")}</Link>
            <Typography color="text.primary">{batch.name}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/batches/edit/${batch._id}`)}>
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
                {batch.name?.charAt(0)}
              </Avatar>
              <Typography variant="h4">{batch.name}</Typography>
              {batch.courseName && (
                <Typography variant="body2" color="textSecondary">
                  {batch.courseName}
                </Typography>
              )}
              <Box className="mt-2 flex gap-2">
                {batch.status && (
                  <Chip 
                    label={batch.status} 
                    size="small" 
                    color={statusColors[batch.status] || "default"} 
                    variant="outlined"
                  />
                )}
              </Box>
              <Divider className="w-full my-4" />
              <Box className="w-full">
                <InfoItem label={t("Start Date")} value={formatDate(batch.startDate)} />
                <InfoItem label={t("End Date")} value={formatDate(batch.endDate)} />
                <InfoItem label={t("Timing")} value={batch.timing} />
              </Box>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Capacity")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label={t("Enrolled Students")} value={batch.enrolledStudents} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label={t("Max Students")} value={batch.maxStudents} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label={t("Fees")} value={batch.fees ? `$${batch.fees.toLocaleString()}` : undefined} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {batch.description && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Description")}</Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {batch.description}
                </Typography>
              </CardContent>
            </Card>
          )}

          {(batch.createdAt || batch.updatedAt) && (
            <Card className="rounded-xl shadow-sm">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Timestamps")}</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem label={t("Created")} value={formatDate(batch.createdAt)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem label={t("Last Updated")} value={formatDate(batch.updatedAt)} />
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