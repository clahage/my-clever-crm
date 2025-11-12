# Duplicate Map (Triage)

| Name                | All Paths | Proposed Canonical | Reason |
|---------------------|-----------|--------------------|--------|
| firebase.js         | src/lib/firebase.js, src/auth/firebase.js, src/config/firebase.js | src/lib/firebase.js | Single source of truth, others re-export |
| ClientLayout.jsx    | src/client/ClientLayout.jsx, src/pages/ClientPortal/ClientLayout.jsx | src/client/ClientLayout.jsx | Used in client app, referenced by router |
| Dashboard.jsx       | src/components/Dashboard.jsx, src/pages/Dashboard.jsx, src/client/pages/Dashboard.jsx | src/components/Dashboard.jsx | Main dashboard logic, referenced by nav/routes |
| Disputes.jsx        | src/client/pages/Disputes.jsx, src/pages/Disputes.jsx | src/pages/Disputes.jsx | Used in main nav/routes |
| Documents.jsx       | src/client/pages/Documents.jsx, src/pages/Documents.jsx | src/pages/Documents.jsx | Used in main nav/routes |
| Reports.jsx         | src/client/pages/Reports.jsx, src/pages/Reports.jsx | src/pages/Reports.jsx | Used in main nav/routes |
| ActivityLog.jsx     | src/components/ActivityLog.jsx, src/pages/restore/ActivityLog.jsx | src/components/ActivityLog.jsx | Real implementation vs stub |
| UserManagement.jsx  | src/components/admin/UserManagement.jsx, src/pages/UserManagement.jsx | src/components/admin/UserManagement.jsx | More complete, admin feature |
| Billing.jsx         | src/components/Billing.jsx, src/pages/Billing.jsx | src/components/Billing.jsx | Real implementation |
| BrandLogo.jsx       | src/components/BrandLogo.jsx, src/skins/BrandLogo.jsx | src/components/BrandLogo.jsx | Real implementation |
| Clients.jsx         | src/components/Clients.jsx, src/pages/Clients.jsx | src/components/Clients.jsx | Real implementation |
| DisputeCenter.jsx   | src/components/DisputeCenter.jsx, src/pages/DisputeCenter.jsx, src/pages/restore/DisputeCenter.jsx | src/components/DisputeCenter.jsx | Real implementation |
| Home.jsx            | src/components/Home.jsx, src/Home.jsx, src/pages/Home.jsx | src/pages/Home.jsx | Used in main nav/routes |
| IDIQDashboard.jsx   | src/components/IDIQ/IDIQDashboard.jsx, src/components/IDIQIntegration/IDIQDashboard.jsx | src/components/IDIQ/IDIQDashboard.jsx | Used in main nav/routes |
| TopNav.jsx          | src/components/layout/TopNav.jsx, src/layout/TopNav.jsx | src/components/layout/TopNav.jsx | Used in main nav/routes |
| Leads.jsx           | src/components/Leads.jsx, src/pages/Leads.jsx | src/pages/Leads.jsx | Used in main nav/routes |
| Login.jsx           | src/components/Login.jsx, src/pages/Login.jsx | src/pages/Login.jsx | Used in main nav/routes |
| ModernDashboard.jsx | src/components/ModernDashboard.jsx, src/modern/ModernDashboard.jsx | src/components/ModernDashboard.jsx | Used in main nav/routes |
| ProgressPortal.jsx  | src/components/ProgressPortal.jsx, src/pages/restore/ProgressPortal.jsx | src/components/ProgressPortal.jsx | Real implementation |
| ProtectedRoute.jsx  | src/components/ProtectedRoute.jsx, src/routes/ProtectedRoute.jsx | src/components/ProtectedRoute.jsx | Used in main nav/routes |
| Settings.jsx        | src/components/Settings.jsx, src/pages/Settings.jsx | src/components/Settings.jsx | Real implementation |
| SkinSwitcher.jsx    | src/components/skin/SkinSwitcher.jsx, src/skins/SkinSwitcher.jsx | src/components/skin/SkinSwitcher.jsx | Real implementation |
| Sidebar.jsx         | src/layout/Sidebar.jsx, src/modern/Sidebar.jsx | src/layout/Sidebar.jsx | Used in main nav/routes |
| FeaturesTutorials.jsx | src/pages/FeaturesTutorials.jsx, src/pages/restore/FeaturesTutorials.jsx | src/pages/FeaturesTutorials.jsx | Real implementation |

... (truncated for brevity; full list in code)

- 25 duplicate groups found
- 25 have clear canonicals proposed

Reasoning: Canonical chosen based on usage in nav/routes, completeness, mtime, and restoration from Backup D where applicable.

Prompt D0 complete.
