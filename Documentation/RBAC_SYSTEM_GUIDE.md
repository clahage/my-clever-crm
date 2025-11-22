# 🔐 ROLE-BASED ACCESS CONTROL (RBAC) SYSTEM
## Implementation Guide & Documentation

**Version:** 1.0  
**Date:** November 21, 2025  
**Status:** ✅ COMPLETE - Ready for Use

---

## 📋 OVERVIEW

Complete role-based access control system with 10 distinct user roles, granular permissions, and easy-to-use components.

### Roles Implemented:
1. **Master Admin** (Owner) - Full system control
2. **Office Manager** (Laurie) - Operations oversight  
3. **Admin** - System administrator
4. **Manager** - Department manager
5. **Employee** - Standard staff
6. **Client** - Active paying customer
7. **Prospect** - Potential client
8. **Affiliate** - Referral partner
9. **Viewer** - Read-only guest
10. **Custom** - Extensible for future roles

---

## 🎯 KEY FEATURES

✅ **10 Distinct Roles** with hierarchy levels  
✅ **100+ Granular Permissions** for fine-grained control  
✅ **Special Role Assignments** for specific users (Laurie, Owner)  
✅ **React Hooks** for easy permission checking  
✅ **UI Components** for conditional rendering  
✅ **Protected Routes** with role validation  
✅ **Role Badges** with icons and colors  
✅ **Client Portal** configuration  
✅ **Data Scope Control** (own/assigned/all data access)  
✅ **Billing & Revenue** visibility levels  

---

## 🏗️ ARCHITECTURE

### File Structure

```
src/
├── config/
│   └── roleConfig.js           # Role definitions & permissions
├── contexts/
│   └── AuthContext.jsx         # Enhanced with role support
├── hooks/
│   └── usePermissions.js       # Permission checking hook
└── components/
    └── auth/
        ├── PermissionGate.jsx  # Conditional rendering
        ├── ProtectedRoute.jsx  # Route protection
        └── RoleBadge.jsx       # Role display components
```

### Core Components

1. **roleConfig.js** - Central configuration
2. **usePermissions()** - Permission checking hook
3. **<PermissionGate>** - Conditional UI rendering
4. **<ProtectedRoute>** - Route-level protection
5. **<RoleBadge>** - Visual role indicators

---

## 👥 ROLE DEFINITIONS

### Internal Roles

#### 1. Master Admin (Level 8)
- **User:** Business Owner
- **Permissions:** ALL (wildcard *)
- **Access:** Complete system control
- **Features:**
  - Can impersonate other users
  - Can manage all roles
  - Full data access
  - Full billing & revenue visibility
  - White-label configuration
- **Landing Page:** `/smart-dashboard`
- **Color:** Gold (#FFD700)
- **Icon:** Crown

#### 2. Office Manager (Level 7.5) 🌟 **LAURIE'S ROLE**
- **User:** Laurie (main office person)
- **Permissions:** Operations-focused
  - All client management
  - All communications
  - All documents
  - Tasks & scheduling
  - Credit operations (view reports, disputes, bureau comm)
  - Billing (view only, no modifications)
  - Analytics (summary level)
  - Team viewing
  - Settings (general, templates, notifications)
- **Access:** All client data
- **Restrictions:**
  - Cannot modify billing/payments
  - Cannot see detailed revenue breakdowns
  - Cannot manage user roles
  - Cannot impersonate users
- **Landing Page:** `/clients-hub`
- **Color:** Purple (#9333EA)
- **Icon:** Briefcase

#### 3. Admin (Level 7)
- **User:** System administrators
- **Permissions:** Elevated but not full
  - All client management
  - All communications
  - All documents
  - Full credit operations
  - Billing view only
  - Full analytics
  - Team management
  - Settings (general, templates)
- **Access:** All data
- **Landing Page:** `/smart-dashboard`
- **Color:** Red (#DC2626)
- **Icon:** Shield

#### 4. Manager (Level 6)
- **User:** Department managers
- **Permissions:** Supervisory
  - All client management
  - Communications
  - Documents
  - Tasks & calendar
  - Credit report viewing
  - Standard analytics
  - Team viewing
- **Access:** Assigned clients only
- **Landing Page:** `/clients-hub`
- **Color:** Purple (#7C3AED)
- **Icon:** Users

#### 5. Employee (Level 5)
- **User:** Standard staff members
- **Permissions:** Daily operations
  - View/edit clients
  - Send communications
  - View/upload documents
  - Manage own tasks
  - View credit reports
  - Standard reports
- **Access:** Assigned clients only
- **Landing Page:** `/clients-hub`
- **Color:** Blue (#2563EB)
- **Icon:** User

### Client Roles

#### 6. Client (Level 3) 🌟 **ACTIVE CUSTOMERS**
- **User:** Paying clients
- **Permissions:** Self-service portal
  - View own profile
  - View own credit reports
  - View dispute status
  - View/download own documents
  - Send/receive messages
  - View progress tracker
  - View/pay own invoices
  - Create support tickets
- **Access:** Own data only
- **Landing Page:** `/progress-portal`
- **Color:** Green (#059669)
- **Icon:** User
- **Portal Features:**
  - Progress tracking ✓
  - Credit reports ✓
  - Dispute status ✓
  - Documents ✓
  - Messages ✓
  - Billing ✓
  - Support ✓

#### 7. Prospect (Level 2) 🌟 **POTENTIAL CLIENTS**
- **User:** Trial/evaluation users
- **Permissions:** Limited preview
  - View own profile
  - Access onboarding
  - View public resources
  - Send messages
  - Create support tickets
- **Access:** Own data only
- **Landing Page:** `/onboarding-hub`
- **Color:** Orange (#EA580C)
- **Icon:** UserPlus
- **Portal Features:**
  - Onboarding wizard ✓
  - Public resources ✓
  - Messages ✓
  - Support ✓

### Partner Roles

#### 8. Affiliate (Level 4)
- **User:** Referral partners
- **Permissions:** Partnership management
  - View own referrals
  - Create referrals
  - View own commissions
  - View/download marketing materials
  - Affiliate reports
  - Support tickets
- **Access:** Own referrals only
- **Landing Page:** `/affiliates-hub`
- **Color:** Violet (#8B5CF6)
- **Icon:** Handshake

#### 9. Viewer (Level 1)
- **User:** Read-only guests
- **Permissions:** Minimal
  - View public resources only
- **Access:** No data
- **Landing Page:** `/resources`
- **Color:** Gray (#6B7280)
- **Icon:** Eye

---

## 🔑 PERMISSION SYSTEM

### Permission Format
`resource.action` (e.g., `clients.view`, `billing.invoices`)

### Special Permissions

**Wildcard (`*`):**
- Master Admin has `permissions: '*'` (all permissions)

**Resource Wildcards:**
- `clients.*` grants all client permissions
- `billing.*` grants all billing permissions

### Core Permissions

#### Clients
- `clients.view` - View client list
- `clients.create` - Create new clients
- `clients.edit` - Edit client info
- `clients.delete` - Delete clients
- `clients.export` - Export client data
- `clients.import` - Import clients
- `clients.notes` - Add/edit notes
- `clients.tags` - Manage tags
- `clients.segments` - Manage segments

#### Communications
- `communications.view` - View all communications
- `communications.send` - Send emails/SMS
- `communications.templates` - Manage templates
- `communications.history` - View history
- `communications.campaigns` - Manage campaigns

#### Documents
- `documents.view` - View all documents
- `documents.view_own` - View own only
- `documents.upload` - Upload documents
- `documents.edit` - Edit documents
- `documents.delete` - Delete documents
- `documents.share` - Share documents
- `documents.download_own` - Download own

#### Tasks & Calendar
- `tasks.view` - View all tasks
- `tasks.create` - Create tasks
- `tasks.edit` - Edit tasks
- `tasks.delete` - Delete tasks
- `tasks.assign` - Assign to others
- `tasks.complete` - Mark complete
- `calendar.view` - View calendar
- `calendar.manage` - Manage events

#### Credit Operations
- `credit.view_reports` - View all reports
- `credit.view_own_reports` - View own only
- `credit.disputes` - Manage disputes
- `credit.view_disputes` - View dispute status
- `credit.bureau_communication` - Bureau comm
- `credit.enroll_clients` - Enroll in IDIQ

#### Billing
- `billing.view` - View all billing
- `billing.view_own` - View own invoices
- `billing.invoices` - Manage invoices
- `billing.payments.view` - View payments
- `billing.payments.process` - Process payments
- `billing.pay_own` - Pay own invoices
- `billing.receipts` - Generate receipts

#### Analytics & Reports
- `analytics.view` - View analytics
- `analytics.advanced` - Advanced analytics
- `reports.standard` - Standard reports
- `reports.custom` - Custom reports
- `reports.export` - Export reports
- `reports.affiliate_own` - Own affiliate reports

#### Team Management
- `team.view` - View team
- `team.manage` - Manage team
- `team.roles` - Assign roles
- `team.tasks.assign` - Assign tasks

#### Settings
- `settings.general` - General settings
- `settings.templates` - Manage templates
- `settings.notifications` - Notifications
- `settings.integrations` - Integrations
- `settings.security` - Security settings

[See roleConfig.js for complete list of 100+ permissions]

---

## 💻 USAGE EXAMPLES

### 1. Check Permissions in Components

```jsx
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { can, isAdmin, isClient } = usePermissions();

  return (
    <div>
      {can('clients.create') && (
        <Button>Add Client</Button>
      )}

      {isAdmin && (
        <AdminPanel />
      )}

      {isClient && (
        <ClientPortal />
      )}
    </div>
  );
}
```

### 2. Conditional Rendering with PermissionGate

```jsx
import PermissionGate, { AdminOnly, ClientOnly } from '@/components/auth/PermissionGate';

function Dashboard() {
  return (
    <div>
      {/* Show only if user has permission */}
      <PermissionGate permission="clients.view">
        <ClientsList />
      </PermissionGate>

      {/* Show only to admins */}
      <AdminOnly>
        <AdminSettings />
      </AdminOnly>

      {/* Show only to clients */}
      <ClientOnly>
        <ClientPortal />
      </ClientOnly>

      {/* Require multiple permissions */}
      <PermissionGate 
        permission={['billing.view', 'billing.invoices']}
        requireAll={true}
      >
        <BillingPanel />
      </PermissionGate>

      {/* Show access denied message */}
      <PermissionGate 
        permission="admin.settings"
        showDenied={true}
      >
        <AdvancedSettings />
      </PermissionGate>
    </div>
  );
}
```

### 3. Protect Routes

```jsx
import ProtectedRoute, { AdminRoute, ClientRoute } from '@/components/auth/ProtectedRoute';

// In App.jsx or router config
<Routes>
  {/* Require specific permission */}
  <Route 
    path="/clients" 
    element={
      <ProtectedRoute requiredPermission="clients.view">
        <ClientsPage />
      </ProtectedRoute>
    } 
  />

  {/* Require minimum role */}
  <Route 
    path="/analytics" 
    element={
      <ProtectedRoute requiredRole="manager">
        <AnalyticsPage />
      </ProtectedRoute>
    } 
  />

  {/* Admin-only route */}
  <Route 
    path="/admin" 
    element={
      <AdminRoute>
        <AdminPanel />
      </AdminRoute>
    } 
  />

  {/* Client portal */}
  <Route 
    path="/portal" 
    element={
      <ClientRoute>
        <ClientPortal />
      </ClientRoute>
    } 
  />
</Routes>
```

### 4. Display Role Badges

```jsx
import RoleBadge, { RoleAvatar, RoleIndicator } from '@/components/auth/RoleBadge';

function UserProfile({ user }) {
  return (
    <div>
      {/* Role badge with icon */}
      <RoleBadge role={user.role} size="medium" />

      {/* Role avatar */}
      <RoleAvatar role={user.role} size={48} />

      {/* Compact indicator */}
      <RoleIndicator role={user.role} />
    </div>
  );
}
```

### 5. usePermissions Hook - All Features

```jsx
import { usePermissions } from '@/hooks/usePermissions';

function AdvancedComponent() {
  const {
    // Permission checking
    can,
    canAccessRoute,
    canAccessData,
    hasAllPermissions,
    hasAnyPermission,
    
    // Role checking
    isAtLeast,
    isRole,
    
    // Quick role checks
    isMasterAdmin,
    isOfficeManager,
    isAdmin,
    isManager,
    isEmployee,
    isClient,
    isProspect,
    isAffiliate,
    
    // User info
    userRole,
    userId,
    userProfile,
    roleLevel
  } = usePermissions();

  // Check single permission
  if (can('clients.create')) {
    // User can create clients
  }

  // Check multiple permissions (AND)
  if (hasAllPermissions(['clients.edit', 'clients.delete'])) {
    // User has all permissions
  }

  // Check multiple permissions (OR)
  if (hasAnyPermission(['clients.view', 'clients.edit'])) {
    // User has at least one permission
  }

  // Check if user is at least a certain role
  if (isAtLeast('manager')) {
    // User is manager or higher
  }

  // Check exact role
  if (isRole('officeManager')) {
    // User is office manager (Laurie)
  }

  // Check data access
  if (canAccessData(someUserId)) {
    // User can access this user's data
  }

  return <div>...</div>;
}
```

---

## 🔧 SPECIAL CONFIGURATIONS

### Assigning Laurie as Office Manager

In `src/config/roleConfig.js`, update the `SPECIAL_ROLE_ASSIGNMENTS`:

```javascript
export const SPECIAL_ROLE_ASSIGNMENTS = {
  // Laurie - Office Manager
  'LAURIE_FIREBASE_UID': 'officeManager',  // Replace with actual UID
  
  // Owner - Master Admin
  'YOUR_FIREBASE_UID': 'masterAdmin',      // Replace with actual UID
};
```

**To get Firebase UID:**
1. Have Laurie sign up/login
2. Check Firestore `userProfiles` collection
3. Copy her document ID (UID)
4. Add to SPECIAL_ROLE_ASSIGNMENTS
5. She'll automatically get officeManager role on next login

### Creating Clients & Prospects

```javascript
// In your signup/onboarding flow
await signup(email, password, displayName, 'client');    // For paying clients
await signup(email, password, displayName, 'prospect');  // For trial users
```

### Manually Updating Roles

```javascript
// From admin panel or script
import { updateUserRole } from '@/contexts/AuthContext';

// Promote user to office manager
await updateUserRole(userId, 'officeManager');

// Convert prospect to client
await updateUserRole(prospectId, 'client');

// Make someone an employee
await updateUserRole(userId, 'user');
```

---

## 🎨 ROLE COLORS & ICONS

| Role | Color | Icon | Badge Color |
|------|-------|------|-------------|
| Master Admin | Gold | Crown | #FFD700 |
| Office Manager | Purple | Briefcase | #9333EA |
| Admin | Red | Shield | #DC2626 |
| Manager | Purple | Users | #7C3AED |
| Employee | Blue | User | #2563EB |
| Client | Green | User | #059669 |
| Prospect | Orange | UserPlus | #EA580C |
| Affiliate | Violet | Handshake | #8B5CF6 |
| Viewer | Gray | Eye | #6B7280 |

---

## 📊 DATA ACCESS LEVELS

### Master Admin
- **Scope:** ALL data across entire system
- **Clients:** Can see and manage all clients
- **Billing:** Full access to all billing/revenue
- **Reports:** All analytics and reports

### Office Manager (Laurie)
- **Scope:** ALL clients (read/write)
- **Clients:** Can manage all clients
- **Billing:** View only (no modifications)
- **Reports:** Summary level analytics

### Admin
- **Scope:** ALL clients (read/write)
- **Clients:** Can manage all clients
- **Billing:** View only
- **Reports:** Summary level analytics

### Manager
- **Scope:** Assigned clients only
- **Clients:** Only clients assigned to them
- **Billing:** No access
- **Reports:** Standard reports for assigned clients

### Employee
- **Scope:** Assigned clients only
- **Clients:** Only clients assigned to them
- **Billing:** No access
- **Reports:** Basic reports for assigned clients

### Client
- **Scope:** Own data only
- **Can see:** Only their own information
- **Billing:** Own invoices only

### Prospect
- **Scope:** Own data only
- **Can see:** Limited to onboarding resources

---

## 🚀 DEPLOYMENT CHECKLIST

### Phase 1: Setup (Complete ✅)
- [x] Create roleConfig.js with all roles
- [x] Create usePermissions hook
- [x] Create PermissionGate components
- [x] Create ProtectedRoute components
- [x] Create RoleBadge components
- [x] Update AuthContext with role support

### Phase 2: Integration (Next Steps)
- [ ] Update navigation (navConfig.js) with permission requirements
- [ ] Add role badges to user profile displays
- [ ] Protect all routes with appropriate role requirements
- [ ] Add PermissionGate to sensitive UI elements
- [ ] Test each role thoroughly

### Phase 3: User Setup
- [ ] Create Laurie's account
- [ ] Add her UID to SPECIAL_ROLE_ASSIGNMENTS
- [ ] Create test client account
- [ ] Create test prospect account
- [ ] Verify each role works correctly

### Phase 4: Production
- [ ] Document role assignment process for team
- [ ] Create admin panel for role management
- [ ] Set up role change notifications
- [ ] Monitor role-based access logs

---

## 🧪 TESTING

### Test Each Role:

1. **Master Admin:**
   - Can access ALL hubs
   - Can see revenue details
   - Can manage all users
   - Can impersonate users

2. **Office Manager (Laurie):**
   - Can access client management
   - Can see billing (view only)
   - Can manage communications
   - Cannot modify payments
   - Cannot see detailed revenue

3. **Client:**
   - Can only access portal
   - Can see own credit reports
   - Can pay own invoices
   - Cannot see other clients

4. **Prospect:**
   - Can access onboarding
   - Can view public resources
   - Cannot see billing
   - Cannot see credit reports

### Test Scenarios:

```javascript
// Test permission checking
console.log(can('clients.create'));  // Should match role permissions

// Test route protection
// Try accessing /admin as client - should see access denied

// Test data scope
// Client should only see their own data

// Test special assignments
// Laurie should have officeManager role after UID assignment
```

---

## 📝 NEXT STEPS

1. **Update Navigation**
   - Add permission requirements to nav items
   - Hide/show based on user role

2. **Create Admin Panel**
   - User management interface
   - Role assignment UI
   - Permission viewer

3. **Add Audit Logging**
   - Log role changes
   - Log permission checks
   - Track access attempts

4. **Client Portal Customization**
   - Build dedicated client dashboard
   - Progress tracking interface
   - Document upload for clients

5. **Prospect Onboarding**
   - Create onboarding wizard
   - Trial period management
   - Conversion to client workflow

---

## 🎉 CONGRATULATIONS!

Your role-based access control system is complete and ready to use!

**What You Have:**
✅ 10 distinct user roles
✅ 100+ granular permissions
✅ Special role for Laurie (Office Manager)
✅ Client & prospect portal support
✅ Easy-to-use hooks and components
✅ Protected routes
✅ Role badges and indicators
✅ Data scope control
✅ Billing visibility levels

**Start using it today:**
1. Import `usePermissions` in your components
2. Wrap sensitive UI with `<PermissionGate>`
3. Protect routes with `<ProtectedRoute>`
4. Assign roles to users
5. Test thoroughly!

Need help? Check the examples above or review the source files.
