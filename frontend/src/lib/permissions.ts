export type PermissionGroup = {
  key: string;
  label: string;
  description: string;
  module: string;
  moduleLabel: string;
};

const MODULE_LABEL_OVERRIDES: Record<string, string> = {
  admins: "Admins",
  users: "Users",
  tasks: "Tasks",
  comm_logs: "Communication Logs",
  accounts: "Accounts",
  financial_reports: "Financial Reports",
  inventory: "Inventory",
  hr: "HR",
  payroll: "Payroll",
  staff_attendance: "Staff Attendance",
  events: "Events",
  faqs: "FAQs",
  branches: "Branches",
  teachers: "Teachers",
  students: "Students",
  batches: "Batches",
  batch_enrolled: "Batch Enrolled",
  batch_exams: "Batch Exams",
  attendance: "Attendance",
  schools: "Schools",
  school_submissions: "School Submissions",
  documents: "Documents",
  visitors: "Visitors",
  dashboard: "Dashboard",
  settings: "Settings",
  permissions: "Permissions",
  partner_agencies: "Partner Agencies",
  agency_reports: "Agency Reports",
  audit_logs: "Audit Logs",
  notifications: "Notifications",
  invoices: "Invoices",
  visa_applications: "Visa Applications",
  targets: "Targets",
  workflows: "Workflows",
  lead_scores: "Lead Scores",
  pipeline: "Pipeline",
  classes: "Classes",
  subjects: "Subjects",
  salary: "Salary",
  fees: "Fees",
  exams: "Exams",
  notices: "Notices",
  reports: "Reports",
  uploads: "Uploads",
  own_profile: "Own Profile",
  own_attendance: "Own Attendance",
  own_fees: "Own Fees",
  own_results: "Own Results",
  branch_students: "Branch Students",
  branch_attendance: "Branch Attendance",
  branch_results: "Branch Results",
};

const ACTION_LABEL_OVERRIDES: Record<string, string> = {
  view: "View",
  manage: "Manage",
  export: "Export",
};

const toTitleCase = (value: string) =>
  value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getPermissionAction = (permissionKey: string) => permissionKey.split("_")[0] || "manage";

export const getPermissionModuleKey = (permissionKey: string) => permissionKey.split("_").slice(1).join("_") || permissionKey;

export const getPermissionModuleLabel = (permissionKey: string) => {
  const moduleKey = getPermissionModuleKey(permissionKey);
  return MODULE_LABEL_OVERRIDES[moduleKey] || toTitleCase(moduleKey);
};

export const getPermissionLabel = (permissionKey: string) => {
  const action = ACTION_LABEL_OVERRIDES[getPermissionAction(permissionKey)] || toTitleCase(getPermissionAction(permissionKey));
  return `${action} ${getPermissionModuleLabel(permissionKey)}`;
};

export const getPermissionDescription = (permissionKey: string) => {
  const action = (ACTION_LABEL_OVERRIDES[getPermissionAction(permissionKey)] || "Manage").toLowerCase();
  return `Allows user to ${action} ${getPermissionModuleLabel(permissionKey).toLowerCase()}.`;
};

export const normalizePermissionRecord = (permission: {
  name?: string;
  key?: string;
  module?: string;
  category?: string;
  description?: string;
}) => {
  const key = permission.key || permission.name || "";
  return {
    key,
    name: permission.name || key,
    module: permission.module || permission.category || getPermissionModuleLabel(key),
    description: permission.description || getPermissionDescription(key),
  };
};

export const buildPermissionGroups = (keys: string[]) => {
  const items: PermissionGroup[] = keys.map((key) => ({
    key,
    label: getPermissionLabel(key),
    description: getPermissionDescription(key),
    module: getPermissionModuleKey(key),
    moduleLabel: getPermissionModuleLabel(key),
  }));

  return Object.values(
    items.reduce<Record<string, { title: string; items: PermissionGroup[] }>>((acc, item) => {
      const bucket = acc[item.module] || {
        title: item.moduleLabel,
        items: [],
      };
      bucket.items.push(item);
      acc[item.module] = bucket;
      return acc;
    }, {}),
  )
    .map((group) => ({
      ...group,
      items: group.items.sort((a, b) => a.label.localeCompare(b.label)),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
};
