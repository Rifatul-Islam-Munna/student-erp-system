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
  Stack,
  IconButton,
  Chip,
  Breadcrumbs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

import { StudentService } from "@/services/studentService";
import { Student } from "@/types/student";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function StudentView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchStudent = async () => {
        try {
          const response = await StudentService.getStudentById(id);
          if (response.success && response.data) {
            setStudent(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch student", error);
        } finally {
          setLoading(false);
        }
      };
      fetchStudent();
    }
  }, [id]);

  const handleDelete = async () => {
    if (student?._id && window.confirm(t("Are you sure you want to delete this student?"))) {
      try {
        await StudentService.deleteStudent(student._id);
        navigate(`/${role}/students`);
      } catch (error) {
        console.error("Failed to delete student", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!student) return <Box className="p-4"><Typography>{t("Student not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | null }) => (
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
      {/* Header */}
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/students`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{student.fullNameEn}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/students`}>{t("Students")}</Link>
            <Typography color="text.primary">{student.fullNameEn}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/students/edit/${student._id}`)}>
            {t("Edit")}
          </Button>
          <Button variant="surface" color="error" startIcon={<NiBinEmpty size="medium" />} onClick={handleDelete}>
            {t("Delete")}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column: Personal Info Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent className="flex flex-col items-center">
              <Avatar sx={{ width: 100, height: 100, mb: 2, bgcolor: "primary.main", fontSize: 36 }}>
                {student.fullNameEn?.charAt(0)}
              </Avatar>
              <Typography variant="h4">{student.fullNameEn}</Typography>
              {student.nameKatakana && (
                <Typography variant="body2" color="textSecondary">{student.nameKatakana}</Typography>
              )}
              <Box className="mt-2 flex gap-2">
                <Chip label={t(student.gender || "")} size="small" color="primary" variant="outlined" />
                <Chip label={student.studentType === "partner" ? t("Partner") : t("Own")} size="small" color="secondary" variant="outlined" />
              </Box>
              <Divider className="w-full my-4" />
              <Box className="w-full">
                <InfoItem label={t("Email")} value={student.email} />
                <InfoItem label={t("Phone")} value={student.phone} />
                <InfoItem label={t("WhatsApp")} value={student.whatsapp} />
                <InfoItem label={t("Date of Birth")} value={formatDate(student.dob)} />
                <InfoItem label={t("Nationality")} value={student.nationality} />
                <InfoItem label={t("Blood Group")} value={student.bloodGroup} />
                <InfoItem label={t("Marital Status")} value={student.maritalStatus ? t(student.maritalStatus) : undefined} />
              </Box>
            </CardContent>
          </Card>

          {/* Identity */}
          <Card className="rounded-xl shadow-sm">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Identity")}</Typography>
              <InfoItem label={t("National ID")} value={student.nationalId} />
              <InfoItem label={t("Passport No")} value={student.passportNo} />
              <InfoItem label={t("Passport Issue Date")} value={formatDate(student.passportIssueDate)} />
              <InfoItem label={t("Passport Expiry Date")} value={formatDate(student.passportExpiryDate)} />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Contact & Address */}
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Contact & Address")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Guardian Phone")} value={student.guardianPhone} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Emergency Contact Name")} value={student.emergencyContact} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Emergency Phone")} value={student.emergencyPhone} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Occupation")} value={student.occupation} /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><InfoItem label={t("Spouse Name")} value={student.spouseName} /></Grid>
                <Grid size={12}><InfoItem label={t("Permanent Address")} value={student.permanentAddress} /></Grid>
                <Grid size={12}><InfoItem label={t("Current Address")} value={student.currentAddressSameAsPermanent ? student.permanentAddress : student.currentAddress} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Study Info */}
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Study Information")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Visa Type")} value={student.visaType} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Country")} value={student.country} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("School Name")} value={student.schoolName} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Intake")} value={student.intake} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Expected Intake")} value={student.expectedIntake} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Source")} value={student.source} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Application Type")} value={student.applicationType} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Education */}
          {student.education && student.education.length > 0 && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Education History")}</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("Level/Degree")}</TableCell>
                      <TableCell>{t("Institution")}</TableCell>
                      <TableCell>{t("Board")}</TableCell>
                      <TableCell>{t("Year")}</TableCell>
                      <TableCell>{t("GPA")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {student.education.map((edu, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{edu.level || edu.degreeExam || "-"}</TableCell>
                        <TableCell>{edu.institution || edu.institutionName || "-"}</TableCell>
                        <TableCell>{edu.board || "-"}</TableCell>
                        <TableCell>{edu.year || edu.passingYear || "-"}</TableCell>
                        <TableCell>{edu.gpa || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Employment */}
          {student.employment && student.employment.length > 0 && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Employment History")}</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("Company Name")}</TableCell>
                      <TableCell>{t("Position")}</TableCell>
                      <TableCell>{t("Start Date")}</TableCell>
                      <TableCell>{t("End Date")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {student.employment.map((emp, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{emp.companyName || "-"}</TableCell>
                        <TableCell>{emp.position || emp.jobTitle || "-"}</TableCell>
                        <TableCell>{formatDate(emp.startDate)}</TableCell>
                        <TableCell>{formatDate(emp.endDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Language Education */}
          {student.languageEducation && student.languageEducation.length > 0 && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Language Education")}</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("Institute Name")}</TableCell>
                      <TableCell>{t("From Date")}</TableCell>
                      <TableCell>{t("To Date")}</TableCell>
                      <TableCell>{t("Total Hours")}</TableCell>
                      <TableCell>{t("Attendance %")}</TableCell>
                      <TableCell>{t("Grade")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {student.languageEducation.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.instituteName || "-"}</TableCell>
                        <TableCell>{formatDate(item.fromDate)}</TableCell>
                        <TableCell>{formatDate(item.toDate)}</TableCell>
                        <TableCell>{item.totalHours || "-"}</TableCell>
                        <TableCell>{item.attendancePercentage != null ? `${item.attendancePercentage}%` : "-"}</TableCell>
                        <TableCell>{item.grade || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Language Tests */}
          {student.languageTest && student.languageTest.length > 0 && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Language Tests")}</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("Exam Type")}</TableCell>
                      <TableCell>{t("Level")}</TableCell>
                      <TableCell>{t("Exam Date")}</TableCell>
                      <TableCell>{t("Score")}</TableCell>
                      <TableCell>{t("Result")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {student.languageTest.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.examType || "-"}</TableCell>
                        <TableCell>{item.level || "-"}</TableCell>
                        <TableCell>{formatDate(item.examDate)}</TableCell>
                        <TableCell>{item.score || "-"}</TableCell>
                        <TableCell>
                          {item.result ? (
                            <Chip
                              label={t(item.result)}
                              size="small"
                              color={item.result === "Pass" ? "success" : item.result === "Fail" ? "error" : "warning"}
                            />
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Other Info */}
          {(student.googleDriveLink || student.internalNotes) && (
            <Card className="rounded-xl shadow-sm">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Other Information")}</Typography>
                <InfoItem label={t("Google Drive Link")} value={student.googleDriveLink} />
                <InfoItem label={t("Internal Notes")} value={student.internalNotes} />
                <InfoItem label={t("Created")} value={formatDate(student.createdAt)} />
                <InfoItem label={t("Last Updated")} value={formatDate(student.updatedAt)} />
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
