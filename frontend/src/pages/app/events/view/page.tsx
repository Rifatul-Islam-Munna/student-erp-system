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

import { EventService } from "@/services/eventService";
import { Event } from "@/types/event";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function EventView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        try {
          const response = await EventService.getEventById(id);
          if (response.success && response.data) {
            setEvent(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch event", error);
        } finally {
          setLoading(false);
        }
      };
      fetchEvent();
    }
  }, [id]);

  const handleDelete = async () => {
    if (event?._id && window.confirm(t("Are you sure you want to delete this event?"))) {
      try {
        await EventService.deleteEvent(event._id);
        navigate(`/${role}/events`);
      } catch (error) {
        console.error("Failed to delete event", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!event) return <Box className="p-4"><Typography>{t("Event not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | number | boolean | null | string[] }) => (
    <Box className="mb-3">
      <Typography variant="caption" color="textSecondary">{label}</Typography>
      <Typography variant="body1">{value ? (Array.isArray(value) ? value.join(", ") : String(value)) : "-"}</Typography>
    </Box>
  );

  const formatDateTime = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "scheduled": return "info";
      case "ongoing": return "warning";
      case "completed": return "success";
      case "cancelled": return "default";
      default: return "default";
    }
  };

  const renderReminder = () => {
    const reminder = event.reminder;
    if (!reminder?.enabled) return "-";
    return `${reminder.time || 30} ${reminder.unit || "minutes"}`;
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/events`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{event.title}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/events`}>{t("Events")}</Link>
            <Typography color="text.primary">{event.title}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/events/edit/${event._id}`)}>
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
              <Box className="flex flex-col items-center">
                <Typography variant="h4" className="mb-2">{event.title}</Typography>
                <Box className="flex gap-2 mb-4">
                  <Chip label={t(event.status || "scheduled")} size="small" color={getStatusColor(event.status)} variant="outlined" />
                </Box>
                <Divider className="w-full my-4" />
                <Box className="w-full">
                  <InfoItem label={t("Location")} value={event.location} />
                  <InfoItem label={t("Start Date")} value={formatDateTime(event.startDate)} />
                  <InfoItem label={t("End Date")} value={formatDateTime(event.endDate)} />
                  <InfoItem label={t("Reminder")} value={renderReminder()} />
                  <InfoItem label={t("Created At")} value={formatDateTime(event.createdAt)} />
                  <InfoItem label={t("Updated At")} value={formatDateTime(event.updatedAt)} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Description")}</Typography>
              <Typography variant="body1">{event.description || "-"}</Typography>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Attendees")}</Typography>
              <Box className="flex flex-wrap gap-2">
                {event.attendees && event.attendees.length > 0 ? (
                  event.attendees.map((attendee, index) => (
                    <Chip key={index} label={attendee} size="small" variant="outlined" />
                  ))
                ) : (
                  <Typography variant="body1" color="textSecondary">-</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}