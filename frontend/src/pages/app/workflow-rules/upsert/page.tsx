import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Tabs,
  Tab,
  MenuItem,
  Divider,
  Breadcrumbs,
  Switch,
  IconButton,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Link } from "react-router-dom";

import { WorkflowRuleService } from "@/services/workflowRuleService";
import { WorkflowRule, WorkflowRuleCondition, WorkflowRuleAction } from "@/types/workflowRule";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiPlus from "@/icons/nexture/ni-plus";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
  trigger: yup.string().required("Trigger is required"),
});

const operatorOptions = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Not Contains" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "is_empty", label: "Is Empty" },
  { value: "is_not_empty", label: "Is Not Empty" },
];

const actionTypeOptions = [
  { value: "notification", label: "Notification" },
  { value: "email", label: "Email" },
  { value: "webhook", label: "Webhook" },
  { value: "update_field", label: "Update Field" },
  { value: "create_task", label: "Create Task" },
  { value: "assign_to", label: "Assign To" },
];

const triggerOptions = [
  { value: "on_create", label: "On Create" },
  { value: "on_update", label: "On Update" },
  { value: "on_delete", label: "On Delete" },
  { value: "on_status_change", label: "On Status Change" },
  { value: "scheduled", label: "Scheduled" },
];

export default function WorkflowRuleUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<WorkflowRule>>({
    initialValues: {
      name: "",
      trigger: "on_create",
      triggerEntity: "",
      conditions: [],
      actions: [],
      isActive: true,
      priority: 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await WorkflowRuleService.updateWorkflowRule(id, values);
        } else {
          await WorkflowRuleService.createWorkflowRule(values);
        }
        navigate(`/${role}/workflow-rules`);
      } catch (error) {
        console.error("Failed to save workflow rule", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchRule = async () => {
        try {
          const response = await WorkflowRuleService.getWorkflowRuleById(id);
          if (response.success && response.data) {
            formik.setValues({
              ...formik.initialValues,
              ...response.data,
              conditions: response.data.conditions || [],
              actions: response.data.actions || [],
            });
          }
        } catch (error) {
          console.error("Failed to fetch workflow rule", error);
        }
      };
      fetchRule();
    }
  }, [isEdit, id]);

  const addCondition = () => {
    const newCondition: WorkflowRuleCondition = {
      field: "",
      operator: "equals",
      value: "",
    };
    formik.setFieldValue("conditions", [...(formik.values.conditions || []), newCondition]);
  };

  const removeCondition = (index: number) => {
    const newConditions = [...(formik.values.conditions || [])];
    newConditions.splice(index, 1);
    formik.setFieldValue("conditions", newConditions);
  };

  const updateCondition = (index: number, field: keyof WorkflowRuleCondition, value: any) => {
    const newConditions = [...(formik.values.conditions || [])];
    newConditions[index] = { ...newConditions[index], [field]: value };
    formik.setFieldValue("conditions", newConditions);
  };

  const addAction = () => {
    const newAction: WorkflowRuleAction = {
      type: "notification",
      config: {},
    };
    formik.setFieldValue("actions", [...(formik.values.actions || []), newAction]);
  };

  const removeAction = (index: number) => {
    const newActions = [...(formik.values.actions || [])];
    newActions.splice(index, 1);
    formik.setFieldValue("actions", newActions);
  };

  const updateAction = (index: number, field: keyof WorkflowRuleAction, value: any) => {
    const newActions = [...(formik.values.actions || [])];
    newActions[index] = { ...newActions[index], [field]: value };
    formik.setFieldValue("actions", newActions);
  };

  const updateActionConfig = (index: number, configKey: string, value: any) => {
    const newActions = [...(formik.values.actions || [])];
    newActions[index] = {
      ...newActions[index],
      config: { ...newActions[index].config, [configKey]: value },
    };
    formik.setFieldValue("actions", newActions);
  };

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <Grid size={12}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>{children}</Typography>
      <Divider sx={{ mt: 1 }} />
    </Grid>
  );

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {isEdit ? t("Edit Workflow Rule") : t("Create Workflow Rule")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/workflow-rules`}>{t("Workflow Rules")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : t("Create")}</Typography>
          </Breadcrumbs>
        </Box>
        <Button variant="text" color="grey" startIcon={<NiArrowLeft size="medium" />} onClick={() => navigate(`/${role}/workflow-rules`)}>
          {t("Back to List")}
        </Button>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Card className="rounded-xl shadow-sm">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={(_event, newValue) => setTabValue(newValue)} variant="scrollable" scrollButtons="auto">
              <Tab label={t("Basic Details")} />
              <Tab label={t("Conditions")} />
              <Tab label={t("Actions")} />
            </Tabs>
          </Box>

          <CardContent>
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Basic Information")}</SectionLabel>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth id="name" name="name" label={t("Name")}
                    value={formik.values.name} onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField fullWidth select id="trigger" name="trigger" label={t("Trigger")}
                    value={formik.values.trigger || "on_create"} onChange={formik.handleChange}
                    error={formik.touched.trigger && Boolean(formik.errors.trigger)}
                    helperText={formik.touched.trigger && formik.errors.trigger}>
                    {triggerOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{t(option.label)}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField fullWidth id="triggerEntity" name="triggerEntity" label={t("Trigger Entity")}
                    value={formik.values.triggerEntity || ""} onChange={formik.handleChange}
                    placeholder={t("e.g., task, student, invoice")} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField fullWidth type="number" id="priority" name="priority" label={t("Priority")}
                    value={formik.values.priority || 0} onChange={formik.handleChange} />
                </Grid>
                <Grid size={{ xs: 12, md: 3 }} className="flex items-center">
                  <FormControl fullWidth>
                    <InputLabel>{t("Status")}</InputLabel>
                    <Select
                      value={formik.values.isActive ? "true" : "false"}
                      label={t("Status")}
                      onChange={(e) => formik.setFieldValue("isActive", e.target.value === "true")}
                    >
                      <MenuItem value="true">{t("Active")}</MenuItem>
                      <MenuItem value="false">{t("Inactive")}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Conditions")}</SectionLabel>
                <Grid size={12}>
                  <Box className="flex justify-end mb-2">
                    <Button variant="surface" color="primary" startIcon={<NiPlus size="medium" />} onClick={addCondition}>
                      {t("Add Condition")}
                    </Button>
                  </Box>
                  {(formik.values.conditions || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">{t("No conditions added yet")}</Typography>
                  ) : (
                    (formik.values.conditions || []).map((condition, index) => (
                      <Box key={index} className="mb-3 p-3 border rounded" sx={{ bgcolor: "background.default" }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: 12, md: 3 }}>
                            <TextField fullWidth size="small" label={t("Field")}
                              value={condition.field} onChange={(e) => updateCondition(index, "field", e.target.value)}
                              placeholder={t("e.g., status, priority")} />
                          </Grid>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>{t("Operator")}</InputLabel>
                              <Select value={condition.operator} label={t("Operator")}
                                onChange={(e) => updateCondition(index, "operator", e.target.value)}>
                                {operatorOptions.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>{t(option.label)}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField fullWidth size="small" label={t("Value")}
                              value={condition.value || ""} onChange={(e) => updateCondition(index, "value", e.target.value)}
                              disabled={condition.operator === "is_empty" || condition.operator === "is_not_empty"} />
                          </Grid>
                          <Grid size={{ xs: 12, md: 2 }} className="flex justify-end">
                            <IconButton color="error" onClick={() => removeCondition(index)}>
                              <NiBinEmpty size="medium" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Box>
                    ))
                  )}
                </Grid>
              </Grid>
            )}

            {tabValue === 2 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Actions")}</SectionLabel>
                <Grid size={12}>
                  <Box className="flex justify-end mb-2">
                    <Button variant="surface" color="primary" startIcon={<NiPlus size="medium" />} onClick={addAction}>
                      {t("Add Action")}
                    </Button>
                  </Box>
                  {(formik.values.actions || []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">{t("No actions added yet")}</Typography>
                  ) : (
                    (formik.values.actions || []).map((action, index) => (
                      <Box key={index} className="mb-3 p-3 border rounded" sx={{ bgcolor: "background.default" }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: 12, md: 3 }}>
                            <FormControl fullWidth size="small">
                              <InputLabel>{t("Action Type")}</InputLabel>
                              <Select value={action.type} label={t("Action Type")}
                                onChange={(e) => updateAction(index, "type", e.target.value)}>
                                {actionTypeOptions.map((option) => (
                                  <MenuItem key={option.value} value={option.value}>{t(option.label)}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                          <Grid size={{ xs: 12, md: 8 }}>
                            <TextField fullWidth size="small" label={t("Configuration (JSON)")}
                              value={JSON.stringify(action.config, null, 2)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value);
                                  formik.setFieldValue(`actions.${index}.config`, parsed);
                                } catch {}
                              }}
                              placeholder={t('{"key": "value"}')} />
                          </Grid>
                          <Grid size={{ xs: 12, md: 1 }} className="flex justify-end">
                            <IconButton color="error" onClick={() => removeAction(index)}>
                              <NiBinEmpty size="medium" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Box>
                    ))
                  )}
                </Grid>
              </Grid>
            )}
          </CardContent>

          <Divider />
          <Box className="p-4 flex justify-end gap-2">
            <Button color="grey" onClick={() => navigate(`/${role}/workflow-rules`)}>{t("Cancel")}</Button>
            <Button type="submit" variant="surface" color="primary" startIcon={<NiFloppyDisk size="medium" />} disabled={loading}>
              {loading ? t("Saving...") : t("Save Rule")}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}