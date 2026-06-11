import { MenuItem } from "@/types/types";

export const leftMenuItems: MenuItem[] = [
  {
    id: "Academics",
    icon: "NiBook",
    label: "menu-Academics",
    href: "",
    description: "menu-Academics-description",
    children: [
      { id: "students", label: "menu-students", icon: "NiUsers", href: "/students" },
      { id: "teachers", label: "menu-teachers", icon: "NiUser", href: "/teachers" },
      { id: "batches", label: "menu-batches", icon: "NiFolder", href: "/batches" },
      { id: "attendance", label: "menu-attendance", icon: "NiCalendar", href: "/attendance" },
    ],
  },
  {
    id: "CRM",
    icon: "NiUser",
    label: "menu-CRM",
    href: "",
    description: "menu-CRM-description",
    children: [
      { id: "visitors", label: "menu-visitors", icon: "NiUser", href: "/visitors" },
      { id: "users", label: "menu-users", icon: "NiUsers", href: "/users" },
      { id: "permissions", label: "menu-permissions", icon: "NiShield", href: "/permissions" },
    ],
  },
  {
    id: "Schools",
    icon: "NiBuilding",
    label: "menu-Schools",
    href: "",
    description: "menu-Schools-description",
    children: [
      { id: "schools", label: "menu-schools", icon: "NiBuilding", href: "/schools" },
      { id: "school-submissions", label: "menu-school-submissions", icon: "NiFile", href: "/school-submissions" },
    ],
  },
  {
    id: "Visa",
    icon: "NiPaperPlane",
    label: "menu-Visa",
    href: "",
    description: "menu-Visa-description",
    children: [
      { id: "visa-applications", label: "menu-visa-applications", icon: "NiFile", href: "/visa-applications" },
    ],
  },
  {
    id: "Partners",
    icon: "NiHandshake",
    label: "menu-Partners",
    href: "",
    description: "menu-Partners-description",
    children: [
      { id: "partner-agencies", label: "menu-partner-agencies", icon: "NiHandshake", href: "/partner-agencies" },
    ],
  },
  {
    id: "Finance",
    icon: "NiWallet",
    label: "menu-Finance",
    href: "",
    description: "menu-Finance-description",
    children: [
      { id: "accounts", label: "menu-accounts", icon: "NiCreditCard", href: "/accounts" },
      { id: "transactions", label: "menu-transactions", icon: "NiRepeat", href: "/transactions" },
      { id: "invoices", label: "menu-invoices", icon: "NiFile", href: "/invoices" },
    ],
  },
  {
    id: "HR",
    icon: "NiBriefcase",
    label: "menu-HR",
    href: "",
    description: "menu-HR-description",
    children: [
      { id: "employees", label: "menu-employees", icon: "NiBriefcase", href: "/employees" },
      { id: "branches", label: "menu-branches", icon: "NiMapPin", href: "/branches" },
      { id: "inventory", label: "menu-inventory", icon: "NiInbox", href: "/inventory" },
    ],
  },
  {
    id: "Tasks",
    icon: "NiCheckSquare",
    label: "menu-Tasks",
    href: "",
    description: "menu-Tasks-description",
    children: [
      { id: "tasks", label: "menu-tasks", icon: "NiCheckSquare", href: "/tasks" },
      { id: "targets", label: "menu-targets", icon: "NiChartBar", href: "/targets" },
    ],
  },
  {
    id: "Communication",
    icon: "NiMessages",
    label: "menu-Communication",
    href: "",
    description: "menu-Communication-description",
    children: [
      { id: "messages", label: "menu-messages", icon: "NiMessages", href: "/messages" },
      { id: "events", label: "menu-events", icon: "NiCalendar", href: "/events" },
    ],
  },
  {
    id: "Documents",
    icon: "NiFolder",
    label: "menu-documents",
    href: "/documents",
    description: "menu-documents-description",
  },
  {
    id: "System",
    icon: "NiSettings",
    label: "menu-System",
    href: "",
    description: "menu-System-description",
    children: [
      { id: "workflow-rules", label: "menu-workflow-rules", icon: "NiAutomation", href: "/workflow-rules" },
      { id: "faqs", label: "menu-faqs", icon: "NiQuestionMark", href: "/faqs" },
      { id: "audit-logs", label: "menu-audit-logs", icon: "NiHistory", href: "/audit-logs" },
      { id: "notifications", label: "menu-notifications", icon: "NiBell", href: "/notifications" },
      { id: "settings", label: "menu-settings", icon: "NiSettings", href: "/settings" },
    ],
  },
];

export const leftMenuBottomItems: MenuItem[] = [];
