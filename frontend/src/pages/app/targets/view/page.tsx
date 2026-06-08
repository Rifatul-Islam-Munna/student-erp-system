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
  LinearProgress,
} from "@mui/material";

import { TargetService } from "@/services/targetService";
import { Target } from "@/types/target";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function TargetView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [target, setTarget] = useState<Target | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchTarget = async () => {
        try {
          const response = await TargetService.getTargetById(id);
          if (response.success && response.data) {
            setTarget(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch target", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTarget();
    }
  }, [id]);

  const handleDelete = async () => {
    if (target?._id && window.confirm(t("Are you sure you want to delete this target?"))) {
      try {
        await TargetService.deleteTarget(target._id);
        navigate(`/${role}/targets`);
      } catch (error) {
        console.error("Failed to delete target", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!target) return <Box className="p-4"><Typography>{t("Target not found")}</Typography></Box>;

  const achievementPercentage = target.targetAmount > 0
    ? ((target.achievedAmount || 0) / target.targetAmount) * 100
    : 0;

  const remainingAmount = target.targetAmount - (target.achievedAmount || 0);

  const InfoItem = ({ label, value }: { label: string; value?: string | number | boolean | null }) => (
    <Box className="mb-3">
      <Typography variant="caption" color="textSecondary">{label}</Typography>
      <Typography variant="body1">{value || "-"}</Typography>
    </Box>
  );

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return "-";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
  };

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active": return "success";
      case "completed": return "info";
      case "cancelled": return "error";
      case "expired": return "warning";
      default: return "default";
    }
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/targets`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{target.type}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/targets`}>{t("Targets")}</Link>
            <Typography color="text.primary">{target.type}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/targets/edit/${target._id}`)}>
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
              <Box className="mb-2">
                <Typography variant="h3" className="text-center">{t("Progress")}</Typography>
              </Box>
              <Box className="w-full mb-2">
                <Box className="flex justify-between mb-1">
                  <Typography variant="body2">{t("Achievement")}</Typography>
                  <Typography variant="body2">{achievementPercentage.toFixed(1)}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={Math.min(achievementPercentage, 100)} sx={{ height: 12, borderRadius: 6 }} />
              </Box>
              <Divider className="w-full my-4" />
              <Box className="w-full">
                <InfoItem label={t("User")} value={target.user} />
                <InfoItem label={t("Target Type")} value={target.type} />
                <InfoItem label={t("Status")} value={target.status ? t(target.status) : undefined} />
                <InfoItem label={t("Period")} value={target.period ? t(target.period) : undefined} />
                <InfoItem label={t("Start Date")} value={formatDate(target.startDate)} />
                <InfoItem label={t("End Date")} value={formatDate(target.endDate)} />
                <InfoItem label={t("Created At")} value={formatDate(target.createdAt)} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Target Details")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box className="p-4 bg-background-neutral/5 rounded-lg">
                    <Typography variant="caption" color="textSecondary">{t("Target Amount")}</Typography>
                    <Typography variant="h4" color="primary.main">{formatCurrency(target.targetAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box className="p-4 bg-background-neutral/5 rounded-lg">
                    <Typography variant="caption" color="textSecondary">{t("Achieved Amount")}</Typography>
                    <Typography variant="h4" color="success.main">{formatCurrency(target.achievedAmount)}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box className="p-4 bg-background-neutral/5 rounded-lg">
                    <Typography variant="caption" color="textSecondary">{t("Remaining Amount")}</Typography>
                    <Typography variant="h4" color={remainingAmount <= 0 ? "success.main" : "warning.main"}>
                      {formatCurrency(remainingAmount)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box className="p-4 bg-background-neutral/5 rounded-lg">
                    <Typography variant="caption" color="textSecondary">{t("Achievement Rate")}</Typography>
                    <Typography variant="h4" color={achievementPercentage >= 100 ? "success.main" : "info.main"}>
                      {achievementPercentage.toFixed(1)}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Timeline")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box className="p-3 border border-gray-200 rounded-lg">
                    <Typography variant="caption" color="textSecondary">{t("Start Date")}</Typography>
                    <Typography variant="body1" fontWeight={500}>{formatDate(target.startDate)}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box className="p-3 border border-gray-200 rounded-lg">
                    <Typography variant="caption" color="textSecondary">{t("End Date")}</Typography>
                    <Typography variant="body1" fontWeight={500}>{formatDate(target.endDate)}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box className="p-3 border border-gray-200 rounded-lg">
                    <Typography variant="caption" color="textSecondary">{t("Duration")}</Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {target.startDate && target.endDate
                        ? Math.ceil((new Date(target.endDate).getTime() - new Date(target.startDate).getTime()) / (1000 * 60 * 60 * 24))
                        : "-"} days
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}