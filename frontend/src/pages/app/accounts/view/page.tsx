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

import { AccountService } from "@/services/accountService";
import { Account, AccountType } from "@/types/account";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function AccountView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchAccount = async () => {
        try {
          const response = await AccountService.getAccountById(id);
          if (response.success && response.data) {
            setAccount(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch account", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAccount();
    }
  }, [id]);

  const handleDelete = async () => {
    if (account?._id && window.confirm(t("Are you sure you want to delete this account?"))) {
      try {
        await AccountService.deleteAccount(account._id);
        navigate(`/${role}/accounts`);
      } catch (error) {
        console.error("Failed to delete account", error);
      }
    }
  };

  const getTypeLabel = (type: AccountType) => {
    return t(type.charAt(0).toUpperCase() + type.slice(1));
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!account) return <Box className="p-4"><Typography>{t("Account not found")}</Typography></Box>;

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
            <IconButton onClick={() => navigate(`/${role}/accounts`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{account.name}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/accounts`}>{t("Accounts")}</Link>
            <Typography color="text.primary">{account.name}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/accounts/edit/${account._id}`)}>
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
                {account.name?.charAt(0)}
              </Avatar>
              <Typography variant="h4">{account.name}</Typography>
              <Chip
                label={getTypeLabel(account.type)}
                size="small"
                color="primary"
                variant="outlined"
                className="mt-2"
              />
              <Divider className="w-full my-4" />
              <Box className="w-full">
                <InfoItem label={t("Code")} value={account.code} />
                <InfoItem label={t("Balance")} value={account.balance.toLocaleString()} />
                <InfoItem label={t("Status")} value={account.status === "active" ? t("Active") : t("Inactive")} />
              </Box>
            </CardContent>
          </Card>

          {account.parentAccount && (
            <Card className="rounded-xl shadow-sm">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Hierarchy")}</Typography>
                <InfoItem label={t("Parent Account")} value={account.parentAccount} />
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {account.description && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Description")}</Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                  {account.description}
                </Typography>
              </CardContent>
            </Card>
          )}

          {(account.createdAt || account.updatedAt) && (
            <Card className="rounded-xl shadow-sm">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Timestamps")}</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem label={t("Created")} value={formatDate(account.createdAt)} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem label={t("Last Updated")} value={formatDate(account.updatedAt)} />
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