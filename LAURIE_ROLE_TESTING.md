# Laurie's Office Manager Role - Testing Guide

**Date:** November 22, 2025  
**User:** Laurie  
**Email:** laurie@speedycreditrepair.com  
**UID:** zDwFaAbOl1aOcGCiDAX2WZdOiKv1  
**Role:** officeManager (Level 7.5)

---

## 🚀 What Changed

Laurie's role has been upgraded from `manager` to `officeManager` with enhanced permissions matching her actual operational scope.

### New Capabilities Added

1. **✅ Impersonation** - Can send emails on behalf of owner
2. **✅ Role Management** - Can assign roles to users (with restrictions)
3. **✅ Full Operational Access** - All client, communications, documents, tasks
4. **✅ Protected Deletions** - Cannot permanently delete users without approval
5. **✅ Financial Protection** - Can setup billing but not see detailed income stats

---

## 📋 Testing Checklist

### Phase 1: Login & Role Verification (5 min)

- [ ] Have Laurie log out completely
- [ ] Log back in at https://my-clever-crm.web.app
- [ ] Verify role shows as "Office Manager" (not "Manager")
- [ ] Check navigation menu - should see all hubs except owner-only sections

### Phase 2: Client Operations (10 min)

- [ ] **Clients Hub** - View all clients
- [ ] Create a new test client
- [ ] Edit existing client details
- [ ] Add notes to client
- [ ] Export client list
- [ ] Verify can see ALL clients (not just assigned ones)

### Phase 3: Communications (10 min)

- [ ] **Email** - Send test email to yourself
- [ ] **Email Impersonation** - Look for "Send as" option to send as owner
- [ ] **SMS** - Send test SMS
- [ ] **Templates** - Create/edit email template
- [ ] **Campaigns** - View and manage campaigns

### Phase 4: Role Management (15 min)

- [ ] Navigate to User Roles page
- [ ] Select a test user (contact role)
- [ ] Attempt to change role to "User" - **Should SUCCEED**
- [ ] Attempt to change role to "Manager" - **Should SUCCEED**
- [ ] Attempt to change role to "Admin" - **Should SUCCEED**
- [ ] Attempt to change role to "Office Manager" - **Should FAIL** (protected)
- [ ] Attempt to change role to "Master Admin" - **Should FAIL** (protected)
- [ ] Verify owner receives notification of role change

### Phase 5: User Deletion (5 min)

- [ ] Try to delete a test contact user
- [ ] Should see "Request Deletion Approval" instead of direct delete
- [ ] Submit deletion request
- [ ] Verify owner receives notification email
- [ ] Confirm cannot delete admin/officeManager/masterAdmin users at all

### Phase 6: Billing Access (10 min)

- [ ] Navigate to Billing Hub
- [ ] Create new invoice - **Should SUCCEED**
- [ ] View invoice - **Should SUCCEED**
- [ ] View receipts - **Should SUCCEED**
- [ ] Try to process payment directly - **Should FAIL** (view only)
- [ ] Navigate to Revenue Hub
- [ ] Should see summary totals - **Should SUCCEED**
- [ ] Should NOT see detailed income breakdowns - **Should FAIL**

### Phase 7: Documents & Tasks (10 min)

- [ ] Upload document
- [ ] Edit document
- [ ] Share document with client
- [ ] Delete document
- [ ] Create task
- [ ] Assign task to team member
- [ ] Mark task complete
- [ ] View calendar

### Phase 8: Credit Operations (10 min)

- [ ] View client credit report
- [ ] Create dispute letter
- [ ] Enroll client in IDIQ monitoring
- [ ] View dispute tracking
- [ ] Update dispute status

---

## ✅ Expected Permissions Summary

### FULL ACCESS (Can Do Everything)
- ✅ All client management (view, create, edit, notes, export)
- ✅ All communications (email, SMS, campaigns, templates)
- ✅ All documents (view, upload, edit, delete, share)
- ✅ All tasks and calendar
- ✅ All credit operations (reports, disputes, IDIQ, bureau communication)
- ✅ Team viewing and task assignment
- ✅ Settings (general, templates, notifications)

### LIMITED ACCESS (Can View/Setup, Not Process)
- ⚠️ Billing: Can create/view invoices (cannot process payments)
- ⚠️ Analytics: Summary level only (no detailed breakdowns)
- ⚠️ Revenue: Can see totals (cannot see detailed income stats)

### RESTRICTED ACCESS (With Safeguards)
- 🔒 Role Management: Can assign roles (cannot modify masterAdmin or officeManager)
- 🔒 User Deletion: Must request approval (cannot delete directly)
- 🔒 Cannot access security settings
- 🔒 Cannot see detailed financial analytics

### SPECIAL CAPABILITIES
- 🎭 **Impersonation**: Can send emails on behalf of owner
- 👥 **Role Assignment**: Can change user roles (with restrictions)
- 🌐 **All Data Access**: Can see all clients and operations
- 📧 **Owner Notifications**: Owner receives alerts for sensitive actions

---

## 🚨 What Should NOT Work

1. ❌ Cannot modify owner (masterAdmin) role
2. ❌ Cannot modify own (officeManager) role
3. ❌ Cannot delete admin, officeManager, or masterAdmin users
4. ❌ Cannot see detailed revenue breakdowns
5. ❌ Cannot process payments directly
6. ❌ Cannot access security settings
7. ❌ Cannot permanently delete users without approval

---

## 🔧 Technical Details

### Role Configuration
```javascript
officeManager: {
  level: 7.5,
  canImpersonate: true,
  canManageRoles: true,
  canDeleteUsers: false,
  canAccessAllData: true,
  billingAccess: 'view',
  revenueVisibility: 'summary',
  roleManagementRestrictions: {
    cannotModifyRoles: ['masterAdmin', 'officeManager'],
    cannotDeleteRoles: ['masterAdmin', 'officeManager', 'admin'],
    requiresApprovalFor: ['delete'],
    notificationEmail: 'owner@speedycreditrepair.com'
  }
}
```

### Helper Functions Available
- `canManageRole(managerRole, targetRole)` - Check if can change a user's role
- `canDeleteUserWithRole(managerRole, targetUserRole)` - Check if can delete user
- `requiresApproval(managerRole, action)` - Check if action needs approval
- `getNotificationEmail(managerRole)` - Get notification email for sensitive actions

---

## 📞 Support

If any test fails or behavior is unexpected:
1. Note which specific test failed
2. Screenshot any error messages
3. Contact owner with details

**Expected Completion Time:** ~60-75 minutes for full testing

---

## ✨ Next Steps (Future Implementation)

These features are configured but need UI implementation:

1. **Deletion Approval Workflow**
   - UI for deletion requests
   - Request tracking in Firestore
   - Owner approval/rejection interface
   - Audit log for all deletion requests

2. **Role Change Notifications**
   - Email notification when Laurie changes user roles
   - Dashboard notification for owner
   - Detailed audit trail

3. **Impersonation UI**
   - "Send as Owner" dropdown in email composer
   - Clear indication when impersonating
   - Audit trail of impersonated actions

4. **Advanced Analytics Restrictions**
   - Hide detailed income stats from Revenue Hub
   - Show only summary totals
   - Implement role-based chart filtering

---

**Status:** ✅ DEPLOYED TO PRODUCTION  
**URL:** https://my-clever-crm.web.app  
**Deploy Date:** November 22, 2025
