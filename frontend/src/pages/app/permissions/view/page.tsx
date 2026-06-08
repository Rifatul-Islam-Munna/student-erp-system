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

import { PermissionService } from "@/services/permissionService";
import { Permission } from "@/types/permission";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function PermissionView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchPermission = async () => {
        try {
          const response = await PermissionService.getPermissionById(id);
          if (response.success && response.data) {
            setPermission(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch permission", error);
        } finally {
          setLoading(false);
        }
      };
      fetchPermission();
    }
  }, [id]);

  const handleDelete = async () => {
    if (permission?._id && window.confirm(t("Are you sure you want to delete this permission?"))) {
      try {
        await PermissionService.deletePermission(permission._id);
        navigate(`/${role}/permissions`);
      } catch (error) {
        console.error("Failed to delete permission", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!permission) return <Box className="p-4"><Typography>{t("Permission not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | number | null | string[] }) => (
    <Box className="mb-3">
      <Typography variant="caption" color="textSecondary">{label}</Typography>
      <Typography variant="body1">{value ? (Array.isArray(value) ? value.join(", ") : String(value)) : "-"}</Typography>
    </Box>
  );

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/permissions`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{permission.name}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/permissions`}>{t("Permissions")}</Link>
            <Typography color="text.primary">{permission.name}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/permissions/edit/${permission._id}`)}>
            {t("Edit")}
          </Button>
          <Button variant="surface" color="error" startIcon={<NiBinEmpty size="medium" />} onClick={handleDelete}>
            {t("Delete")}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Box className="flex flex-col items-center">
                <Typography variant="h4" className="mb-2">{permission.name}</Typography>
                <Box className="flex gap-2 mb-4">
                  <Chip label={permission.key} size="small" color="info" variant="outlined" />
                  {permission.category && <Chip label={permission.category} size="small" color="primary" variant="outlined" />}
                </Box>
                <Divider className="w-full my-4" />
                <Box className="w-full">
                  <InfoItem label={t("Name")} value={permission.name} />
                  <InfoItem label={t("Key")} value={permission.key} />
                  <InfoItem label={t("Category")} value={permission.category} />
                  <InfoItem label={t("Description")} value={permission.description} />
                  <InfoItem label={t("Created At")} value={formatDate(permission.createdAt)} />
                  <InfoItem label={t("Updated At")} value={formatDate(permission.updatedAt)} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}