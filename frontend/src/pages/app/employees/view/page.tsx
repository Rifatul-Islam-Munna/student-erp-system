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
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import { EmployeeService } from "@/services/employeeService";
import { EmployeeProfile, Attendance, Payroll, AttendanceQuery, PayrollQuery } from "@/types/employee";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function EmployeeView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role: userRole, id } = useParams();

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchEmployee = async () => {
        try {
          const response = await EmployeeService.getEmployeeById(id);
          if (response.success && response.data) {
            setEmployee(response.data);
            fetchAttendance(response.data._id!);
            fetchPayroll(response.data._id!);
          }
        } catch (error) {
          console.error("Failed to fetch employee", error);
        } finally {
          setLoading(false);
        }
      };
      fetchEmployee();
    }
  }, [id]);

  const fetchAttendance = async (employeeId: string) => {
    try {
      const query: AttendanceQuery = { employeeId, limit: 10 };
      const response = await EmployeeService.getAttendance(query);
      if (response.success && Array.isArray(response.data)) {
        setAttendance(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch attendance", error);
    }
  };

  const fetchPayroll = async (employeeId: string) => {
    try {
      const query: PayrollQuery = { employeeId, limit: 10 };
      const response = await EmployeeService.getPayroll(query);
      if (response.success && Array.isArray(response.data)) {
        setPayroll(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch payroll", error);
    }
  };

  const handleDelete = async () => {
    if (employee?._id && window.confirm(t("Are you sure you want to delete this employee?"))) {
      try {
        await EmployeeService.deleteEmployee(employee._id);
        navigate(`/${userRole}/employees`);
      } catch (error) {
        console.error("Failed to delete employee", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!employee) return <Box className="p-4"><Typography>{t("Employee not found")}</Typography></Box>;

  const InfoItem = ({ label, value }: { label: string; value?: string | number | null }) => (
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
            <IconButton onClick={() => navigate(`/${userRole}/employees`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{employee.user?.fullName}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${userRole}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${userRole}/employees`}>{t("Employees")}</Link>
            <Typography color="text.primary">{employee.user?.fullName}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${userRole}/employees/edit/${employee._id}`)}>
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
                {employee.user?.fullName?.charAt(0)}
              </Avatar>
              <Typography variant="h4">{employee.user?.fullName}</Typography>
              <Typography variant="body2" color="textSecondary">{employee.user?.email}</Typography>
              <Box className="mt-2 flex gap-2">
                <Chip label={employee.department || "-"} size="small" color="primary" variant="outlined" />
                <Chip label={t(employee.status || "")} size="small" color={employee.status === "active" ? "success" : "error"} variant="outlined" />
              </Box>
              <Divider className="w-full my-4" />
              <Box className="w-full">
                <InfoItem label={t("Employee ID")} value={employee.employeeId} />
                <InfoItem label={t("Phone")} value={employee.user?.phone} />
                <InfoItem label={t("Address")} value={employee.user?.address} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Employment Details")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Department")} value={employee.department} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Designation")} value={employee.designation} /></Grid>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Join Date")} value={formatDate(employee.joinDate)} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Compensation")}</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}><InfoItem label={t("Base Salary")} value={employee.salary ? `$${employee.salary.toLocaleString()}` : "-"} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          {attendance.length > 0 && (
            <Card className="rounded-xl shadow-sm mb-4">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Recent Attendance")}</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("Date")}</TableCell>
                        <TableCell>{t("Check In")}</TableCell>
                        <TableCell>{t("Check Out")}</TableCell>
                        <TableCell>{t("Hours")}</TableCell>
                        <TableCell>{t("Status")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendance.slice(0, 5).map((att) => (
                        <TableRow key={att._id}>
                          <TableCell>{formatDate(att.date)}</TableCell>
                          <TableCell>{att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : "-"}</TableCell>
                          <TableCell>{att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : "-"}</TableCell>
                          <TableCell>{att.hoursWorked || "-"}</TableCell>
                          <TableCell>{t(att.status || "")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {payroll.length > 0 && (
            <Card className="rounded-xl shadow-sm">
              <CardContent>
                <Typography variant="h6" className="mb-4">{t("Recent Payroll")}</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("Month")}</TableCell>
                        <TableCell>{t("Base Salary")}</TableCell>
                        <TableCell>{t("Allowances")}</TableCell>
                        <TableCell>{t("Deductions")}</TableCell>
                        <TableCell>{t("Net Salary")}</TableCell>
                        <TableCell>{t("Status")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payroll.slice(0, 5).map((pay) => (
                        <TableRow key={pay._id}>
                          <TableCell>{pay.month} {pay.year}</TableCell>
                          <TableCell>{pay.baseSalary || "-"}</TableCell>
                          <TableCell>{pay.allowances || "-"}</TableCell>
                          <TableCell>{pay.deductions || "-"}</TableCell>
                          <TableCell>{pay.netSalary || "-"}</TableCell>
                          <TableCell>{t(pay.status || "")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}