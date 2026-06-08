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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import { VisitorService } from "@/services/visitorService";
import { Visitor } from "@/types/visitor";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function VisitorView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchVisitor = async () => {
        try {
          const response = await VisitorService.getVisitorById(id);
          if (response.success && response.data) {
            setVisitor(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch visitor", error);
        } finally {
          setLoading(false);
        }
      };
      fetchVisitor();
    }
  }, [id]);

  const handleDelete = async () => {
    if (visitor?._id && window.confirm(t("Are you sure you want to delete this visitor?"))) {
      try {
        await VisitorService.deleteVisitor(visitor._id);
        navigate(`/${role}/visitors`);
      } catch (error) {
        console.error("Failed to delete visitor", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!visitor) return <Box className="p-4"><Typography>{t("Visitor not found")}</Typography></Box>;

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
      case "new": return "info";
      case "contacted": return "primary";
      case "interested": return "success";
      case "follow_up": return "warning";
      case "converted": return "success";
      case "lost": return "error";
      default: return "default";
    }
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/visitors`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{visitor.fullName}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/visitors`}>{t("Visitors")}</Link>
            <Typography color="text.primary">{visitor.fullName}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/visitors/edit/${visitor._id}`)}>
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
                {visitor.fullName?.charAt(0)}
              </Avatar>
              <Typography variant="h4">{visitor.fullName}</Typography>
              <Typography variant="body2" color="textSecondary">{visitor.email}</Typography>
              <Box className="mt-2 flex gap-2">
                <Chip label={t(visitor.status || "")} size="small" color={getStatusColor(visitor.status)} variant="outlined" />
                <Chip label={visitor.leadCategory ? t(visitor.leadCategory) : "-"} size="small" variant="outlined" />
              </Box>
              <Divider className="w-full my-4" />
              <Box className="w-full">
                <InfoItem label={t("Phone")} value={visitor.phone} />
                <InfoItem label={t("Guardian Phone")} value={visitor.guardianPhone} />
                <InfoItem label={t("Date of Birth")} value={formatDate(visitor.dateOfBirth)} />
                <InfoItem label={t("Gender")} value={visitor.gender ? t(visitor.gender) : undefined} />
                <InfoItem label={t("Lead Score")} value={visitor.leadScore} />
                <InfoItem label={t("Created At")} value={formatDate(visitor.createdAt)} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Contact & Address")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Email")} value={visitor.email} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Address")} value={visitor.address} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Source")} value={visitor.source} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Counselor")} value={visitor.counselor} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Visa & Course")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Visa Type")} value={visitor.visaType} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Intake")} value={visitor.intake} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Course Type")} value={visitor.courseType} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Course Name")} value={visitor.courseName} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Budget Concerned")} value={visitor.BudgetConcerned ? t("Yes") : t("No")} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Preferred Date")} value={formatDate(visitor.preferredDate)} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          {visitor.education && visitor.education.length > 0 && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Education History")}</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("Exam Name")}</TableCell>
                      <TableCell>{t("Year")}</TableCell>
                      <TableCell>{t("Board")}</TableCell>
                      <TableCell>{t("GPA")}</TableCell>
                      <TableCell>{t("Group/Subject")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visitor.education.map((edu, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{edu.examName || "-"}</TableCell>
                        <TableCell>{edu.year || "-"}</TableCell>
                        <TableCell>{edu.board || "-"}</TableCell>
                        <TableCell>{edu.gpa || "-"}</TableCell>
                        <TableCell>{edu.groupSubject || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {visitor.JapaneseTest?.hasCertificate && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Japanese Test")}</Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Exam Type")} value={visitor.JapaneseTest.examType} /></Grid>
                  <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Level")} value={visitor.JapaneseTest.level} /></Grid>
                  <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Score")} value={visitor.JapaneseTest.score} /></Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {visitor.counselingNote && (
            <Card className="rounded-xl shadow-sm">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Counseling Note")}</Typography>
                <Typography variant="body1">{visitor.counselingNote}</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}