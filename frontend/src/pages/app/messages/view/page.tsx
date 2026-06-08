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
  Chip,
  Breadcrumbs,
  IconButton,
} from "@mui/material";

import { MessageService } from "@/services/messageService";
import { Message } from "@/types/message";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function MessageView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [message, setMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchMessage = async () => {
        try {
          const response = await MessageService.getMessageById(id);
          if (response.success && response.data) {
            setMessage(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch message", error);
        } finally {
          setLoading(false);
        }
      };
      fetchMessage();
    }
  }, [id]);

  const handleDelete = async () => {
    if (message?._id && window.confirm(t("Are you sure you want to delete this message?"))) {
      try {
        await MessageService.deleteMessage(message._id);
        navigate(`/${role}/messages`);
      } catch (error) {
        console.error("Failed to delete message", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!message) return <Box className="p-4"><Typography>{t("Message not found")}</Typography></Box>;

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "sent":
        return "success";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/messages`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{message.subject}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/messages`}>{t("Messages")}</Link>
            <Typography color="text.primary">{message.subject}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/messages/edit/${message._id}`)}>
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
              <Typography variant="h6" className="mb-4">{t("Message Info")}</Typography>
              <Box className="mb-3">
                <Typography variant="caption" color="textSecondary">{t("To")}</Typography>
                <Typography variant="body1">{message.to}</Typography>
              </Box>
              <Box className="mb-3">
                <Typography variant="caption" color="textSecondary">{t("Subject")}</Typography>
                <Typography variant="body1">{message.subject}</Typography>
              </Box>
              <Box className="mb-3">
                <Typography variant="caption" color="textSecondary">{t("Status")}</Typography>
                <Box className="mt-1">
                  <Chip
                    label={t(message.status)}
                    size="small"
                    color={getStatusColor(message.status)}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Timestamps")}</Typography>
              <Box className="mb-3">
                <Typography variant="caption" color="textSecondary">{t("Sent At")}</Typography>
                <Typography variant="body1">{formatDate(message.sentAt)}</Typography>
              </Box>
              <Box className="mb-3">
                <Typography variant="caption" color="textSecondary">{t("Read At")}</Typography>
                <Typography variant="body1">{formatDate(message.readAt)}</Typography>
              </Box>
              <Box className="mb-3">
                <Typography variant="caption" color="textSecondary">{t("Created")}</Typography>
                <Typography variant="body1">{formatDate(message.createdAt)}</Typography>
              </Box>
              <Box className="mb-3">
                <Typography variant="caption" color="textSecondary">{t("Last Updated")}</Typography>
                <Typography variant="body1">{formatDate(message.updatedAt)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Message Body")}</Typography>
              <Divider />
              <Box className="mt-4 whitespace-pre-wrap">
                {message.body || <Typography color="textSecondary">{t("No content")}</Typography>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}