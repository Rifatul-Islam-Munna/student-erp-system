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
  Chip,
  Breadcrumbs,
  IconButton,
} from "@mui/material";

import { BranchService } from "@/services/branchService";
import { Branch } from "@/types/branch";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function BranchView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchBranch = async () => {
        try {
          const response = await BranchService.getBranchById(id);
          if (response.success && response.data) {
            setBranch(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch branch", error);
        } finally {
          setLoading(false);
        }
      };
      fetchBranch();
    }
  }, [id]);

  const handleDelete = async () => {
    if (branch?._id && window.confirm(t("Are you sure you want to delete this branch?"))) {
      try {
        await BranchService.deleteBranch(branch._id);
        navigate(`/${role}/branches`);
      } catch (error) {
        console.error("Failed to delete branch", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!branch) return <Box className="p-4"><Typography>{t("Branch not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | null | undefined }) => {
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
            <IconButton onClick={() => navigate(`/${role}/branches`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{branch.name}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/branches`}>{t("Branches")}</Link>
            <Typography color="text.primary">{branch.name}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/branches/edit/${branch._id}`)}>
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
                {branch.name?.charAt(0)}
              </Avatar>
              <Typography variant="h4">{branch.name}</Typography>
              {branch.code && (
                <Typography variant="body2" color="textSecondary">
                  {t("Code")}: {branch.code}
                </Typography>
              )}
              <Box className="mt-2">
                {branch.status && (
                  <Chip
                    label={branch.status === "active" ? t("Active") : t("Inactive")}
                    size="small"
                    color={branch.status === "active" ? "success" : "default"}
                    variant="outlined"
                  />
                )}
              </Box>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Contact Information")}</Typography>
              <InfoItem label={t("Email")} value={branch.email} />
              <InfoItem label={t("Phone")} value={branch.phone} />
              <InfoItem label={t("Address")} value={branch.address} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Branch Details")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label={t("Branch Name")} value={branch.name} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label={t("Branch Code")} value={branch.code} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label={t("Manager")} value={branch.manager} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label={t("Status")} value={branch.status} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Timestamps")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label={t("Created")} value={formatDate(branch.createdAt)} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <InfoItem label={t("Last Updated")} value={formatDate(branch.updatedAt)} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}