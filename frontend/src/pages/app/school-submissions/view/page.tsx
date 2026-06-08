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
  Paper,
  IconButton,
  Chip,
  Breadcrumbs,
} from "@mui/material";

import { SchoolSubmissionService } from "@/services/schoolSubmissionService";
import { SchoolSubmission } from "@/types/schoolSubmission";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function SchoolSubmissionView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [submission, setSubmission] = useState<SchoolSubmission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchSubmission = async () => {
        try {
          const response = await SchoolSubmissionService.getSchoolSubmissionById(id);
          if (response.success && response.data) {
            setSubmission(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch school submission", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSubmission();
    }
  }, [id]);

  const handleDelete = async () => {
    if (submission?._id && window.confirm(t("Are you sure you want to delete this submission?"))) {
      try {
        await SchoolSubmissionService.deleteSchoolSubmission(submission._id);
        navigate(`/${role}/school-submissions`);
      } catch (error) {
        console.error("Failed to delete school submission", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!submission) return <Box className="p-4"><Typography>{t("School submission not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | null }) => (
    <Box className="mb-3">
      <Typography variant="caption" color="textSecondary">{label}</Typography>
      <Typography variant="body1">{value || "-"}</Typography>
    </Box>
  );

  const formatStatus = (status?: string) => {
    if (!status) return "-";
    return t(status.replace("_", " "));
  };

  const formatDate = (date?: string | Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "accepted": return "success";
      case "rejected": return "error";
      case "waitlisted": return "warning";
      case "submitted":
      case "under_review": return "info";
      default: return "default";
    }
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/school-submissions`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{submission.student || t("School Submission")}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/school-submissions`}>{t("School Submissions")}</Link>
            <Typography color="text.primary">{submission.student || t("View")}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/school-submissions/edit/${submission._id}`)}>
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
              <Typography variant="h6" className="mb-4">{t("Basic Information")}</Typography>
              <InfoItem label={t("Student")} value={submission.student} />
              <InfoItem label={t("School")} value={submission.school} />
              <Divider className="my-4" />
              <Box className="flex gap-2 mb-3">
                <Chip label={formatStatus(submission.applicationStatus)} size="small" color={getStatusColor(submission.applicationStatus) as any} variant="outlined" />
                <Chip label={formatStatus(submission.visaStatus)} size="small" color={getStatusColor(submission.visaStatus) as any} variant="outlined" />
              </Box>
              <InfoItem label={t("Submitted Date")} value={formatDate(submission.submittedDate)} />
              <InfoItem label={t("Intake")} value={submission.intake} />
              <InfoItem label={t("Scholarship")} value={submission.scholarship} />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Notes")}</Typography>
              <Paper variant="outlined" className="p-4 rounded-lg">
                <Typography variant="body1" style={{ whiteSpace: "pre-wrap" }}>
                  {submission.notes || "-"}
                </Typography>
              </Paper>
              <Divider className="my-4" />
              <Typography variant="caption" color="textSecondary">
                {t("Created")}: {formatDate(submission.createdAt)}
              </Typography>
              <br />
              <Typography variant="caption" color="textSecondary">
                {t("Updated")}: {formatDate(submission.updatedAt)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}