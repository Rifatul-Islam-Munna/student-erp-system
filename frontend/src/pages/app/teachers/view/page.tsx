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

import { TeacherService } from "@/services/teacherService";
import { Teacher } from "@/types/teacher";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function TeacherView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchTeacher = async () => {
        try {
          const response = await TeacherService.getTeacherById(id);
          if (response.success && response.data) {
            setTeacher(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch teacher", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTeacher();
    }
  }, [id]);

  const handleDelete = async () => {
    if (teacher?._id && window.confirm(t("Are you sure you want to delete this teacher?"))) {
      try {
        await TeacherService.deleteTeacher(teacher._id);
        navigate(`/${role}/teachers`);
      } catch (error) {
        console.error("Failed to delete teacher", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!teacher) return <Box className="p-4"><Typography>{t("Teacher not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | number | null | undefined }) => (
    <Box className="mb-3">
      <Typography variant="caption" color="textSecondary">{label}</Typography>
      <Typography variant="body1">{value || "-"}</Typography>
    </Box>
  );

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return t("Active");
      case "inactive":
        return t("Inactive");
      case "on_leave":
        return t("On Leave");
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "on_leave":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/teachers`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{teacher.fullName}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/teachers`}>{t("Teachers")}</Link>
            <Typography color="text.primary">{teacher.fullName}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/teachers/edit/${teacher._id}`)}>
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
                {teacher.fullName?.charAt(0)}
              </Avatar>
              <Typography variant="h4">{teacher.fullName}</Typography>
              <Box className="mt-2">
                <Chip 
                  label={getStatusLabel(teacher.status || "")} 
                  size="small" 
                  color={getStatusColor(teacher.status || "") as any}
                  variant="outlined" 
                />
              </Box>
              <Divider className="w-full my-4" />
              <Box className="w-full">
                <InfoItem label={t("Email")} value={teacher.email} />
                <InfoItem label={t("Phone")} value={teacher.phone} />
                <InfoItem label={t("Join Date")} value={formatDate(teacher.joinDate)} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Professional Information")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Specialization")} value={teacher.specialization} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Qualification")} value={teacher.qualification} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Experience")} value={teacher.experience ? `${teacher.experience} years` : undefined} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Employment Information")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Salary")} value={teacher.salary ? `$${teacher.salary.toLocaleString()}` : undefined} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Join Date")} value={formatDate(teacher.joinDate)} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <InfoItem label={t("Created")} value={formatDate(teacher.createdAt)} />
              <InfoItem label={t("Last Updated")} value={formatDate(teacher.updatedAt)} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}