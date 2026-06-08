import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { leftMenuBottomItems, leftMenuItems } from "@/menu-items";
import RoleGuard from "@/components/layout/role-guard";
import AppLayout from "@/pages/app/layout";
import AuthLayout from "@/pages/auth/layout";
import Loading from "@/pages/loading";
import NotFound from "@/pages/not-found";

const modules = import.meta.glob("./pages/**/page.tsx");

const lazyLoad = (path: string) => {
  let key: string;
  if (path === "/") {
    key = "./pages/page.tsx";
  } else if (path.startsWith("/auth")) {
    key = `./pages/auth${path.substring(5)}/page.tsx`;
  } else {
    key = `./pages/app${path}/page.tsx`;
  }

  const importer = modules[key];

  if (!importer) {
    console.log("Route not found:", key, "looking for:", path);
    return <Navigate to="/404" replace />;
  }

  const Component = React.lazy(importer as () => Promise<{ default: React.ComponentType<any> }>);

  return (
    <React.Suspense fallback={<Loading />}>
      <Component />
    </React.Suspense>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={lazyLoad("/")} />
      <Route
        path="/:role"
        element={
          <RoleGuard>
            <AppLayout />
          </RoleGuard>
        }
      >
        {/* Students */}
        <Route path="students" element={lazyLoad("/students")} />
        <Route path="students/create" element={lazyLoad("/students/upsert")} />
        <Route path="students/edit/:id" element={lazyLoad("/students/upsert")} />
        <Route path="students/view/:id" element={lazyLoad("/students/view")} />

        {/* Users */}
        <Route path="users" element={lazyLoad("/users")} />
        <Route path="users/create" element={lazyLoad("/users/upsert")} />
        <Route path="users/edit/:id" element={lazyLoad("/users/upsert")} />
        <Route path="users/view/:id" element={lazyLoad("/users/view")} />

        {/* Visitors */}
        <Route path="visitors" element={lazyLoad("/visitors")} />
        <Route path="visitors/create" element={lazyLoad("/visitors/upsert")} />
        <Route path="visitors/edit/:id" element={lazyLoad("/visitors/upsert")} />
        <Route path="visitors/view/:id" element={lazyLoad("/visitors/view")} />

        {/* Teachers */}
        <Route path="teachers" element={lazyLoad("/teachers")} />
        <Route path="teachers/create" element={lazyLoad("/teachers/upsert")} />
        <Route path="teachers/edit/:id" element={lazyLoad("/teachers/upsert")} />
        <Route path="teachers/view/:id" element={lazyLoad("/teachers/view")} />

        {/* Schools */}
        <Route path="schools" element={lazyLoad("/schools")} />
        <Route path="schools/create" element={lazyLoad("/schools/upsert")} />
        <Route path="schools/edit/:id" element={lazyLoad("/schools/upsert")} />
        <Route path="schools/view/:id" element={lazyLoad("/schools/view")} />

        {/* School Submissions */}
        <Route path="school-submissions" element={lazyLoad("/school-submissions")} />
        <Route path="school-submissions/create" element={lazyLoad("/school-submissions/upsert")} />
        <Route path="school-submissions/edit/:id" element={lazyLoad("/school-submissions/upsert")} />
        <Route path="school-submissions/view/:id" element={lazyLoad("/school-submissions/view")} />

        {/* Visa Applications */}
        <Route path="visa-applications" element={lazyLoad("/visa-applications")} />
        <Route path="visa-applications/create" element={lazyLoad("/visa-applications/upsert")} />
        <Route path="visa-applications/edit/:id" element={lazyLoad("/visa-applications/upsert")} />
        <Route path="visa-applications/view/:id" element={lazyLoad("/visa-applications/view")} />

        {/* Partner Agencies */}
        <Route path="partner-agencies" element={lazyLoad("/partner-agencies")} />
        <Route path="partner-agencies/create" element={lazyLoad("/partner-agencies/upsert")} />
        <Route path="partner-agencies/edit/:id" element={lazyLoad("/partner-agencies/upsert")} />
        <Route path="partner-agencies/view/:id" element={lazyLoad("/partner-agencies/view")} />

        {/* Batches */}
        <Route path="batches" element={lazyLoad("/batches")} />
        <Route path="batches/create" element={lazyLoad("/batches/upsert")} />
        <Route path="batches/edit/:id" element={lazyLoad("/batches/upsert")} />
        <Route path="batches/view/:id" element={lazyLoad("/batches/view")} />

        {/* Branches */}
        <Route path="branches" element={lazyLoad("/branches")} />
        <Route path="branches/create" element={lazyLoad("/branches/upsert")} />
        <Route path="branches/edit/:id" element={lazyLoad("/branches/upsert")} />
        <Route path="branches/view/:id" element={lazyLoad("/branches/view")} />

        {/* Attendance */}
        <Route path="attendance" element={lazyLoad("/attendance")} />

        {/* Accounts */}
        <Route path="accounts" element={lazyLoad("/accounts")} />
        <Route path="accounts/create" element={lazyLoad("/accounts/upsert")} />
        <Route path="accounts/edit/:id" element={lazyLoad("/accounts/upsert")} />
        <Route path="accounts/view/:id" element={lazyLoad("/accounts/view")} />

        {/* Transactions */}
        <Route path="transactions" element={lazyLoad("/transactions")} />
        <Route path="transactions/create" element={lazyLoad("/transactions/upsert")} />
        <Route path="transactions/edit/:id" element={lazyLoad("/transactions/upsert")} />
        <Route path="transactions/view/:id" element={lazyLoad("/transactions/view")} />

        {/* Invoices */}
        <Route path="invoices" element={lazyLoad("/invoices")} />
        <Route path="invoices/create" element={lazyLoad("/invoices/upsert")} />
        <Route path="invoices/edit/:id" element={lazyLoad("/invoices/upsert")} />
        <Route path="invoices/view/:id" element={lazyLoad("/invoices/view")} />

        {/* Employees */}
        <Route path="employees" element={lazyLoad("/employees")} />
        <Route path="employees/create" element={lazyLoad("/employees/upsert")} />
        <Route path="employees/edit/:id" element={lazyLoad("/employees/upsert")} />
        <Route path="employees/view/:id" element={lazyLoad("/employees/view")} />

        {/* Inventory */}
        <Route path="inventory" element={lazyLoad("/inventory")} />
        <Route path="inventory/create" element={lazyLoad("/inventory/upsert")} />
        <Route path="inventory/edit/:id" element={lazyLoad("/inventory/upsert")} />
        <Route path="inventory/view/:id" element={lazyLoad("/inventory/view")} />

        {/* Tasks */}
        <Route path="tasks" element={lazyLoad("/tasks")} />
        <Route path="tasks/create" element={lazyLoad("/tasks/upsert")} />
        <Route path="tasks/edit/:id" element={lazyLoad("/tasks/upsert")} />
        <Route path="tasks/view/:id" element={lazyLoad("/tasks/view")} />

        {/* Targets */}
        <Route path="targets" element={lazyLoad("/targets")} />
        <Route path="targets/create" element={lazyLoad("/targets/upsert")} />
        <Route path="targets/edit/:id" element={lazyLoad("/targets/upsert")} />
        <Route path="targets/view/:id" element={lazyLoad("/targets/view")} />

        {/* Messages */}
        <Route path="messages" element={lazyLoad("/messages")} />
        <Route path="messages/create" element={lazyLoad("/messages/upsert")} />
        <Route path="messages/edit/:id" element={lazyLoad("/messages/upsert")} />
        <Route path="messages/view/:id" element={lazyLoad("/messages/view")} />

        {/* Documents */}
        <Route path="documents" element={lazyLoad("/documents")} />
        <Route path="documents/create" element={lazyLoad("/documents/upsert")} />
        <Route path="documents/edit/:id" element={lazyLoad("/documents/upsert")} />
        <Route path="documents/view/:id" element={lazyLoad("/documents/view")} />

        {/* Events */}
        <Route path="events" element={lazyLoad("/events")} />
        <Route path="events/create" element={lazyLoad("/events/upsert")} />
        <Route path="events/edit/:id" element={lazyLoad("/events/upsert")} />
        <Route path="events/view/:id" element={lazyLoad("/events/view")} />

        {/* Workflow Rules */}
        <Route path="workflow-rules" element={lazyLoad("/workflow-rules")} />
        <Route path="workflow-rules/create" element={lazyLoad("/workflow-rules/upsert")} />
        <Route path="workflow-rules/edit/:id" element={lazyLoad("/workflow-rules/upsert")} />
        <Route path="workflow-rules/view/:id" element={lazyLoad("/workflow-rules/view")} />

        {/* FAQs */}
        <Route path="faqs" element={lazyLoad("/faqs")} />
        <Route path="faqs/create" element={lazyLoad("/faqs/upsert")} />
        <Route path="faqs/edit/:id" element={lazyLoad("/faqs/upsert")} />
        <Route path="faqs/view/:id" element={lazyLoad("/faqs/view")} />

        {/* Audit Logs */}
        <Route path="audit-logs" element={lazyLoad("/audit-logs")} />

        {/* Permissions */}
        <Route path="permissions" element={lazyLoad("/permissions")} />
        <Route path="permissions/create" element={lazyLoad("/permissions/upsert")} />
        <Route path="permissions/edit/:id" element={lazyLoad("/permissions/upsert")} />
        <Route path="permissions/view/:id" element={lazyLoad("/permissions/view")} />

        {/* Notifications */}
        <Route path="notifications" element={lazyLoad("/notifications")} />

        {/* Settings */}
        <Route path="settings" element={lazyLoad("/settings")} />

        {/* Dashboards - catch all for role */}
        <Route path="dashboards" element={lazyLoad("/dashboards")} />
      </Route>
      <Route path="/auth" element={<AuthLayout />}>
        <Route index element={<Navigate to="/auth/sign-in" replace />} />
        <Route path="sign-in" element={lazyLoad("/auth/sign-in")} />
        <Route path="sign-up" element={lazyLoad("/auth/sign-up")} />
        <Route path="password-reset" element={lazyLoad("/auth/password-reset")} />
        <Route path="password-sent" element={lazyLoad("/auth/password-sent")} />
        <Route path="password-new" element={lazyLoad("/auth/password-new")} />
        <Route path="get-verification" element={lazyLoad("/auth/get-verification")} />
        <Route path="set-verification" element={lazyLoad("/auth/set-verification")} />
        <Route path="terms-and-conditions" element={lazyLoad("/auth/terms-and-conditions")} />
        <Route path="privacy-policy" element={lazyLoad("/auth/privacy-policy")} />
      </Route>

      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;