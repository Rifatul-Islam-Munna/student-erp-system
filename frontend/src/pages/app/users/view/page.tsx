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
  IconButton,
  Chip,
  Breadcrumbs,
} from "@mui/material";

import { UserService } from "@/services/userService";
import { User } from "@/types/user";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function UserView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role: userRole, id } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          const response = await UserService.getUserById(id);
          if (response.success && response.data) {
            setUser(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch user", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id]);

  const handleDelete = async () => {
    if (user?._id && window.confirm(t("Are you sure you want to delete this user?"))) {
      try {
        await UserService.deleteUser(user._id);
        navigate(`/${userRole}/users`);
      } catch (error) {
        console.error("Failed to delete user", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!user) return <Box className="p-4"><Typography>{t("User not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | null | number }) => (
    <Box className="mb-3">
      <Typography variant="caption" color="textSecondary">{label}</Typography>
      <Typography variant="body1">{value || "-"}</Typography>
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
            <IconButton onClick={() => navigate(`/${userRole}/users`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{user.fullName}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${userRole}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${userRole}/users`}>{t("Users")}</Link>
            <Typography color="text.primary">{user.fullName}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${userRole}/users/edit/${user._id}`)}>
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
                {user.fullName?.charAt(0)}
              </Avatar>
              <Typography variant="h4">{user.fullName}</Typography>
              <Typography variant="body2" color="textSecondary">{user.email}</Typography>
              <Box className="mt-2 flex gap-2">
                <Chip label={t(user.role)} size="small" color="primary" variant="outlined" />
                <Chip label={t(user.accountStatus || "")} size="small" color={user.accountStatus === "active" ? "success" : "error"} variant="outlined" />
              </Box>
              <Divider className="w-full my-4" />
              <Box className="w-full">
                <InfoItem label={t("Phone")} value={user.phone} />
                <InfoItem label={t("Address")} value={user.address} />
                <InfoItem label={t("Created At")} value={formatDate(user.createdAt)} />
                <InfoItem label={t("Last Login")} value={formatDate(user.lastLoginAt)} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Commission & Earnings")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Commission Type")} value={user.commissionType || "-"} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Commission Amount")} value={user.commissionAmount} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Total Earnings")} value={user.totalEarnings} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          {user.permissions && user.permissions.length > 0 && (
            <Card className="rounded-xl shadow-sm">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Permissions")}</Typography>
                <Box className="flex flex-wrap gap-1">
                  {user.permissions.map((perm, idx) => (
                    <Chip key={idx} label={perm} size="small" variant="outlined" />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}