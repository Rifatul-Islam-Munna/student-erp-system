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
  Divider,
  Breadcrumbs,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Link } from "react-router-dom";

import { MessageService } from "@/services/messageService";
import { Message } from "@/types/message";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiSendUpRight from "@/icons/nexture/ni-send-up-right";

const validationSchema = yup.object({
  to: yup.string().required("Recipient is required"),
  subject: yup.string().required("Subject is required"),
});

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Grid size={12}>
    <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1, mb: -0.5 }}>
      {children}
    </Typography>
    <Divider sx={{ mt: 1 }} />
  </Grid>
);

export default function MessageUpsert() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role, id } = useParams();
  const isEdit = Boolean(id);

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const formik = useFormik<Partial<Message>>({
    initialValues: {
      to: "",
      subject: "",
      body: "",
      status: "draft",
      sentAt: undefined,
      readAt: undefined,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEdit && id) {
          await MessageService.updateMessage(id, values);
        } else {
          await MessageService.createMessage(values);
        }
        navigate(`/${role}/messages`);
      } catch (error) {
        console.error("Failed to save message", error);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEdit && id) {
      const fetchMessage = async () => {
        try {
          const response = await MessageService.getMessageById(id);
          if (response.success && response.data) {
            formik.setValues({ ...formik.initialValues, ...response.data });
          }
        } catch (error) {
          console.error("Failed to fetch message", error);
        }
      };
      fetchMessage();
    }
  }, [isEdit, id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSend = async () => {
    await formik.setFieldValue("status", "sent");
    await formik.setFieldValue("sentAt", new Date().toISOString());
    formik.handleSubmit();
  };

  return (
    <Box className="p-4">
      <Box className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Box>
          <Typography variant="h1" component="h1" className="mb-0">
            {isEdit ? t("Edit Message") : t("Compose Message")}
          </Typography>
          <Breadcrumbs>
            <Link to={`/${role}/dashboards`}>{t("Home")}</Link>
            <Link to={`/${role}/messages`}>{t("Messages")}</Link>
            <Typography color="text.primary">{isEdit ? t("Edit") : t("Compose")}</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="text"
          color="grey"
          startIcon={<NiArrowLeft size="medium" />}
          onClick={() => navigate(`/${role}/messages`)}
        >
          {t("Back to List")}
        </Button>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Card className="rounded-xl shadow-sm">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
              <Tab label={t("Compose")} />
              <Tab label={t("Settings")} />
            </Tabs>
          </Box>

          <CardContent>
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Message")}</SectionLabel>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    id="to"
                    name="to"
                    label={t("To")}
                    value={formik.values.to}
                    onChange={formik.handleChange}
                    error={formik.touched.to && Boolean(formik.errors.to)}
                    helperText={formik.touched.to && formik.errors.to}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    id="subject"
                    name="subject"
                    label={t("Subject")}
                    value={formik.values.subject}
                    onChange={formik.handleChange}
                    error={formik.touched.subject && Boolean(formik.errors.subject)}
                    helperText={formik.touched.subject && formik.errors.subject}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    id="body"
                    name="body"
                    label={t("Body")}
                    multiline
                    rows={10}
                    value={formik.values.body}
                    onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>
            )}

            {tabValue === 1 && (
              <Grid container spacing={3}>
                <SectionLabel>{t("Message Settings")}</SectionLabel>
                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formik.values.status === "sent"}
                        onChange={(e) => {
                          const newStatus = e.target.checked ? "sent" : "draft";
                          formik.setFieldValue("status", newStatus);
                          if (newStatus === "sent" && !formik.values.sentAt) {
                            formik.setFieldValue("sentAt", new Date().toISOString());
                          }
                        }}
                      />
                    }
                    label={formik.values.status === "sent" ? t("Sent") : t("Draft")}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>

          <Divider />
          <Box className="p-4 flex justify-end gap-2">
            <Button color="grey" onClick={() => navigate(`/${role}/messages`)}>
              {t("Cancel")}
            </Button>
            <Button
              type="submit"
              variant="surface"
              color="primary"
              startIcon={<NiFloppyDisk size="medium" />}
              disabled={loading}
            >
              {loading ? t("Saving...") : t("Save as Draft")}
            </Button>
            <Button
              type="button"
              variant="contained"
              color="primary"
              startIcon={<NiSendUpRight size="medium" />}
              disabled={loading || !formik.values.to || !formik.values.subject}
              onClick={handleSend}
            >
              {t("Send")}
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
}