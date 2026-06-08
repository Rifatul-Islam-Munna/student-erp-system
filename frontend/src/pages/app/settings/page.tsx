import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { SettingService } from "@/services/settingService";
import { SettingDocument } from "@/types/setting";

const SYSTEM_VARIABLES = [
  { key: "{{sys_agency_name}}", dbField: "site.name", note: "From settings page" },
  { key: "{{sys_agency_address}}", dbField: "site.address", note: "From settings page" },
  { key: "{{sys_agency_phone}}", dbField: "site.phone", note: "From settings page" },
  { key: "{{sys_agency_email}}", dbField: "site.email", note: "From settings page" },
  { key: "{{sys_branch_name}}", dbField: "branch.name", note: "From branch record" },
  { key: "{{sys_branch_address}}", dbField: "branch.address", note: "From branch record" },
  { key: "{{sys_today}}", dbField: "runtime", note: "Auto-generated current date" },
  { key: "{{sys_today:year}}", dbField: "runtime", note: "Auto-generated current year" },
  { key: "{{sys_today:month}}", dbField: "runtime", note: "Auto-generated current month" },
  { key: "{{sys_today:day}}", dbField: "runtime", note: "Auto-generated current day" },
  { key: "{{sys_today_jp}}", dbField: "runtime", note: "Auto-generated JP date text" },
  { key: "{{sys_batch_name}}", dbField: "batch.name", note: "From selected batch" },
  { key: "{{sys_batch_start}}", dbField: "batch.startDate", note: "From selected batch" },
  { key: "{{sys_batch_start:year}}", dbField: "batch.startDate", note: "From selected batch" },
  { key: "{{sys_batch_start:month}}", dbField: "batch.startDate", note: "From selected batch" },
  { key: "{{sys_batch_start:day}}", dbField: "batch.startDate", note: "From selected batch" },
  { key: "{{sys_batch_end}}", dbField: "batch.endDate", note: "From selected batch" },
  { key: "{{sys_batch_end:year}}", dbField: "batch.endDate", note: "From selected batch" },
  { key: "{{sys_batch_end:month}}", dbField: "batch.endDate", note: "From selected batch" },
  { key: "{{sys_batch_end:day}}", dbField: "batch.endDate", note: "From selected batch" },
  { key: "{{sys_batch_teacher}}", dbField: "batch.teacher", note: "From selected batch" },
  { key: "{{sys_batch_schedule}}", dbField: "batch.schedule", note: "From selected batch" },
  { key: "{{sys_batch_total_hours}}", dbField: "batch.totalHours", note: "From selected batch" },
  { key: "{{sys_school_name}}", dbField: "school.name", note: "From selected school" },
  { key: "{{sys_school_name_jp}}", dbField: "school.nameJapanese", note: "From selected school" },
  { key: "{{sys_school_address}}", dbField: "school.address", note: "From selected school" },
];

const defaultSettings: SettingDocument = {
  site: {
    name: "",
    address: "",
    phone: "",
    email: "",
    logo: "",
    maintenance_mode: false,
    maintenance_message: "",
    academic_year: "",
  },
  intake_months: [],
  visiting_sources: [],
  edu_degrees: [],
  event_categories: [],
  faq_categories: [],
  countries: [],
  visatypes: [],
  exam_types: [],
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingDocument>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await SettingService.getAll();
      setSettings({ ...defaultSettings, ...response.data, site: { ...defaultSettings.site, ...(response.data?.site || {}) } });
    } catch {
      setMessage({ type: "error", text: "Failed to load settings" });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await SettingService.update(settings);
      setMessage({ type: "success", text: "Settings updated" });
      await loadSettings();
    } catch {
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box className="p-6 space-y-6">
      <Box>
        <Typography variant="h4" className="mb-2">System Settings</Typography>
        <Typography color="text.secondary">Agency-level system variable source page.</Typography>
      </Box>

      {message && <Alert severity={message.type}>{message.text}</Alert>}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card>
            <CardContent className="space-y-4">
              <Typography variant="h6">Agency Information</Typography>

              <TextField
                fullWidth
                label="Agency Name"
                value={settings.site?.name || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, site: { ...prev.site, name: e.target.value } }))}
              />
              <TextField
                fullWidth
                label="Agency Address"
                multiline
                rows={2}
                value={settings.site?.address || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, site: { ...prev.site, address: e.target.value } }))}
              />
              <TextField
                fullWidth
                label="Agency Phone"
                value={settings.site?.phone || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, site: { ...prev.site, phone: e.target.value } }))}
              />
              <TextField
                fullWidth
                label="Agency Email"
                value={settings.site?.email || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, site: { ...prev.site, email: e.target.value } }))}
              />
              <TextField
                fullWidth
                label="Logo URL"
                value={settings.site?.logo || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, site: { ...prev.site, logo: e.target.value } }))}
              />
              <TextField
                fullWidth
                label="Academic Year"
                value={settings.site?.academic_year || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, site: { ...prev.site, academic_year: e.target.value } }))}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(settings.site?.maintenance_mode)}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, site: { ...prev.site, maintenance_mode: e.target.checked } }))
                    }
                  />
                }
                label="Maintenance Mode"
              />
              <TextField
                fullWidth
                label="Maintenance Message"
                multiline
                rows={2}
                value={settings.site?.maintenance_message || ""}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, site: { ...prev.site, maintenance_message: e.target.value } }))
                }
              />

              <Button variant="contained" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">System Variables</Typography>
              <Typography color="text.secondary" className="mb-4">
                These are system-side variables. Agency ones editable here. Others come from branch, batch, school, runtime.
              </Typography>

              <Box className="space-y-3">
                {SYSTEM_VARIABLES.map((variable) => (
                  <Box key={variable.key}>
                    <Box className="flex flex-wrap items-center gap-2 mb-1">
                      <Chip label={variable.key} size="small" />
                      <Typography variant="body2" className="font-mono">{variable.dbField}</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">{variable.note}</Typography>
                    <Divider className="mt-3" />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
