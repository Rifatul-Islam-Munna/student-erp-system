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

import { TaskService } from "@/services/taskService";
import { Task } from "@/types/task";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function TaskView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchTask = async () => {
        try {
          const response = await TaskService.getTaskById(id);
          if (response.success && response.data) {
            setTask(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch task", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTask();
    }
  }, [id]);

  const handleDelete = async () => {
    if (task?._id && window.confirm(t("Are you sure you want to delete this task?"))) {
      try {
        await TaskService.deleteTask(task._id);
        navigate(`/${role}/tasks`);
      } catch (error) {
        console.error("Failed to delete task", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!task) return <Box className="p-4"><Typography>{t("Task not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | number | boolean | null | string[] }) => (
    <Box className="mb-3">
      <Typography variant="caption" color="textSecondary">{label}</Typography>
      <Typography variant="body1">{value ? (Array.isArray(value) ? value.join(", ") : String(value)) : "-"}</Typography>
    </Box>
  );

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "pending": return "warning";
      case "in_progress": return "info";
      case "completed": return "success";
      case "cancelled": return "default";
      default: return "default";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "low": return "success";
      case "medium": return "info";
      case "high": return "warning";
      case "urgent": return "error";
      default: return "default";
    }
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/tasks`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{task.title}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/tasks`}>{t("Tasks")}</Link>
            <Typography color="text.primary">{task.title}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/tasks/edit/${task._id}`)}>
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
                <Typography variant="h4" className="mb-2">{task.title}</Typography>
                <Box className="flex gap-2 mb-4">
                  <Chip label={t(task.status || "pending")} size="small" color={getStatusColor(task.status)} variant="outlined" />
                  <Chip label={t(task.priority || "medium")} size="small" color={getPriorityColor(task.priority)} variant="outlined" />
                </Box>
                <Divider className="w-full my-4" />
                <Box className="w-full">
                  <InfoItem label={t("Assigned To")} value={task.assignedTo} />
                  <InfoItem label={t("Due Date")} value={formatDate(task.dueDate)} />
                  <InfoItem label={t("Created At")} value={formatDate(task.createdAt)} />
                  <InfoItem label={t("Updated At")} value={formatDate(task.updatedAt)} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Description")}</Typography>
              <Typography variant="body1">{task.description || "-"}</Typography>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Related To")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Related Student")} value={task.relatedStudent} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Related Visitor")} value={task.relatedVisitor} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Related Batch")} value={task.relatedBatch} /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}