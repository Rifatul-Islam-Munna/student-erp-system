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
  Switch,
} from "@mui/material";

import { WorkflowRuleService } from "@/services/workflowRuleService";
import { WorkflowRule } from "@/types/workflowRule";
import NiPen from "@/icons/nexture/ni-pen";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

export default function WorkflowRuleView() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();

  const [rule, setRule] = useState<WorkflowRule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchRule = async () => {
        try {
          const response = await WorkflowRuleService.getWorkflowRuleById(id);
          if (response.success && response.data) {
            setRule(response.data);
          }
        } catch (error) {
          console.error("Failed to fetch workflow rule", error);
        } finally {
          setLoading(false);
        }
      };
      fetchRule();
    }
  }, [id]);

  const handleDelete = async () => {
    if (rule?._id && window.confirm(t("Are you sure you want to delete this workflow rule?"))) {
      try {
        await WorkflowRuleService.deleteWorkflowRule(rule._id);
        navigate(`/${role}/workflow-rules`);
      } catch (error) {
        console.error("Failed to delete workflow rule", error);
      }
    }
  };

  const handleToggle = async () => {
    if (rule?._id) {
      try {
        await WorkflowRuleService.toggleWorkflowRule(rule._id, !rule.isActive);
        setRule({ ...rule, isActive: !rule.isActive });
      } catch (error) {
        console.error("Failed to toggle workflow rule", error);
      }
    }
  };

  if (loading) return <Box className="p-4"><Typography>{t("Loading...")}</Typography></Box>;
  if (!rule) return <Box className="p-4"><Typography>{t("Workflow rule not found")}</Typography></Box>;

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

  const getTriggerLabel = (trigger?: string) => {
    switch (trigger) {
      case "on_create": return "On Create";
      case "on_update": return "On Update";
      case "on_delete": return "On Delete";
      case "on_status_change": return "On Status Change";
      case "scheduled": return "Scheduled";
      default: return trigger || "-";
    }
  };

  const getOperatorLabel = (operator?: string) => {
    switch (operator) {
      case "equals": return "Equals";
      case "not_equals": return "Not Equals";
      case "contains": return "Contains";
      case "not_contains": return "Not Contains";
      case "greater_than": return "Greater Than";
      case "less_than": return "Less Than";
      case "is_empty": return "Is Empty";
      case "is_not_empty": return "Is Not Empty";
      default: return operator || "-";
    }
  };

  const getActionTypeLabel = (actionType?: string) => {
    switch (actionType) {
      case "notification": return "Notification";
      case "email": return "Email";
      case "webhook": return "Webhook";
      case "update_field": return "Update Field";
      case "create_task": return "Create Task";
      case "assign_to": return "Assign To";
      default: return actionType || "-";
    }
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Box className="flex items-center gap-2 mb-1">
            <IconButton onClick={() => navigate(`/${role}/workflow-rules`)}>
              <NiArrowLeft size="medium" />
            </IconButton>
            <Typography variant="h1" className="mb-0">{rule.name}</Typography>
          </Box>
          <Breadcrumbs className="ms-12">
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/workflow-rules`}>{t("Workflow Rules")}</Link>
            <Typography color="text.primary">{rule.name}</Typography>
          </Breadcrumbs>
        </Box>
        <Box className="flex gap-2">
          <Button variant="surface" color="primary" startIcon={<NiPen size="medium" />}
            onClick={() => navigate(`/${role}/workflow-rules/edit/${rule._id}`)}>
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
                <Typography variant="h4" className="mb-2">{rule.name}</Typography>
                <Box className="flex gap-2 mb-4">
                  <Chip label={t(getTriggerLabel(rule.trigger))} size="small" color="info" variant="outlined" />
                  <Chip label={t(rule.isActive ? "Active" : "Inactive")} size="small" color={rule.isActive ? "success" : "default"} variant="outlined" />
                </Box>
                <Divider className="w-full my-4" />
                <Box className="w-full">
                  <Grid container spacing={2} alignItems="center" className="mb-3">
                    <Grid size={{ xs: 8 }}>
                      <Typography variant="caption" color="textSecondary">{t("Status")}</Typography>
                    </Grid>
                    <Grid size={{ xs: 4 }} className="flex justify-end">
                      <Switch checked={rule.isActive} onChange={handleToggle} color="primary" />
                    </Grid>
                  </Grid>
                  <InfoItem label={t("Trigger")} value={getTriggerLabel(rule.trigger)} />
                  <InfoItem label={t("Trigger Entity")} value={rule.triggerEntity} />
                  <InfoItem label={t("Priority")} value={rule.priority} />
                  <InfoItem label={t("Created At")} value={formatDate(rule.createdAt)} />
                  <InfoItem label={t("Updated At")} value={formatDate(rule.updatedAt)} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Conditions")}</Typography>
              {(rule.conditions || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">{t("No conditions defined")}</Typography>
              ) : (
                <Box className="space-y-2">
                  {(rule.conditions || []).map((condition, index) => (
                    <Box key={index} className="p-3 border rounded" sx={{ bgcolor: "background.default" }}>
                      <Typography variant="body2">
                        <strong>{condition.field}</strong> {t(getOperatorLabel(condition.operator))} <strong>{condition.value !== undefined ? String(condition.value) : ""}</strong>
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm mb-4">
            <CardContent>
              <Typography variant="h6" className="mb-4">{t("Actions")}</Typography>
              {(rule.actions || []).length === 0 ? (
                <Typography variant="body2" color="text.secondary">{t("No actions defined")}</Typography>
              ) : (
                <Box className="space-y-2">
                  {(rule.actions || []).map((action, index) => (
                    <Box key={index} className="p-3 border rounded" sx={{ bgcolor: "background.default" }}>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2">
                            <strong>{t(getActionTypeLabel(action.type))}</strong>
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                            {JSON.stringify(action.config, null, 2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}