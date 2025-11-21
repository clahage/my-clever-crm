# Migration Plan

**Generated:** November 21, 2025
**Scope:** Step-by-step implementation guide for audit recommendations
**Status:** AWAITING USER APPROVAL - No changes until approved

---

## Pre-Migration Checklist

Before starting any migration:

- [ ] User has tested deployed AI workflow
- [ ] User has approved this migration plan
- [ ] Full backup of `/src/` directory created
- [ ] Git branch created for migration work
- [ ] Test environment available for verification

---

## Phase 0: Preparation (Day 1)

### 0.1 Create Backup & Branch

```bash
# Create timestamped backup
cp -r src/ src_backup_2025_11_21/

# Create feature branch
git checkout -b feature/codebase-consolidation-nov2025

# Create archive directory
mkdir -p archive/superseded/2025-11-21
```

### 0.2 Document Current State

```bash
# Count files by type
find src/pages -name "*.jsx" | wc -l
find src/pages/hubs -name "*.jsx" | wc -l
find src/components -name "*.jsx" | wc -l

# Save navigation config
cp src/layout/navConfig.js archive/navConfig_backup_2025_11_21.js
```

---

## Phase 1: Critical Fixes (Week 1)

### 1.1 Fix Calendar Hub (URGENT - Day 1-2)

**Problem:** CalendarSchedulingHub.jsx is 80 lines, Calendar.jsx has 6,000 lines of production code.

**Option A: Migrate Code to Hub**
```bash
# Step 1: Read both files to understand structure
# Step 2: Copy Calendar.jsx functionality into CalendarSchedulingHub.jsx
# Step 3: Update imports and exports
# Step 4: Test thoroughly
# Step 5: Archive Calendar.jsx
```

**Option B: Remove Redirect (Quick Fix)**
```javascript
// In App.jsx, change:
<Route path="calendar" element={<Navigate to="/calendar-hub" replace />} />

// To:
<Route path="calendar" element={<Calendar />} />
<Route path="calendar-hub" element={<Calendar />} />
```

**Recommended:** Option B for immediate fix, then migrate properly later.

### 1.2 Fix Navigation Duplicates (Day 2-3)

**Update navConfig.js paths:**

| Current Path | Change To | Reason |
|--------------|-----------|--------|
| /contacts | /clients-hub | Direct to hub |
| /emails | /comms-hub | Direct to hub |
| /reports | /reports-hub | Direct to hub |
| /analytics | /analytics-hub | Direct to hub |
| /tasks | /tasks-hub | Direct to hub |
| /calendar | /calendar-hub | Direct to hub |
| /settings | /settings-hub | Direct to hub |
| /support | /support-hub | Direct to hub |
| /documents | /documents-hub | Direct to hub |
| /affiliates | /affiliates-hub | Direct to hub |

**Steps:**
1. Update navigationItems array in navConfig.js
2. Update getMobileNavigation function to derive from main nav
3. Keep legacy redirects in App.jsx for bookmarks

### 1.3 Remove Sample Data (Day 3-5)

**Priority Order:**
1. `src/utils/initializeCollections.js` - Add DEV check
2. `src/pages/ProgressPortal.jsx` - Replace demo clients
3. `src/pages/Reports.jsx` - Connect to Firebase
4. `src/modern/ModernDashboard.jsx` - Real activity feed

**Pattern for each file:**
```javascript
// Before:
const demoClients = [{ name: "John Doe", ... }];

// After:
const [clients, setClients] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchClients = async () => {
    const snapshot = await getDocs(collection(db, 'contacts'));
    setClients(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };
  fetchClients();
}, []);
```

---

## Phase 2: Archive Redundant Files (Week 2)

### 2.1 Archive Tier 1 Pages (Day 6-7)

Files that are clearly superseded by hubs:

```bash
# Create archive with metadata
mkdir -p archive/superseded/2025-11-21

# Move files with git tracking
git mv src/pages/Documents.jsx archive/superseded/2025-11-21/
git mv src/pages/Emails.jsx archive/superseded/2025-11-21/
git mv src/pages/Reports.jsx archive/superseded/2025-11-21/
git mv src/pages/Settings.jsx archive/superseded/2025-11-21/

# Commit with clear message
git commit -m "Archive redundant pages - superseded by hub implementations

Archived files:
- Documents.jsx → DocumentsHub.jsx (hub has 10 tabs, AI features)
- Emails.jsx → CommunicationsHub.jsx (hub has SMS + 30 AI features)
- Reports.jsx → ReportsHub.jsx (hub has 8 report types, AI)
- Settings.jsx → SettingsHub.jsx (hub has full admin control)

All routes still redirect to hubs for backwards compatibility."
```

### 2.2 Create Archive README

```bash
# Create documentation for archived files
cat > archive/superseded/2025-11-21/README.md << 'EOF'
# Archived Files - November 21, 2025

## Why Archived
These files were superseded by hub implementations with superior functionality.

## Files

### Documents.jsx
- **Original:** 210 lines, placeholder with mock data
- **Replaced By:** DocumentsHub.jsx (1,232 lines)
- **Hub Features:** 10 tabs, AI generator, e-signature, compliance
- **Can Restore:** Yes - git checkout

### Emails.jsx
- **Original:** ~2,000 lines, basic email campaigns
- **Replaced By:** CommunicationsHub.jsx (2,308 lines)
- **Hub Features:** Email + SMS + 30 AI features + unified inbox
- **Can Restore:** Yes - git checkout

### Reports.jsx
- **Original:** 1,200 lines, hardcoded metrics
- **Replaced By:** ReportsHub.jsx (3,500 lines)
- **Hub Features:** 8 report types, AI summaries, custom builder
- **Can Restore:** Yes - git checkout

### Settings.jsx
- **Original:** 200 lines, basic user settings
- **Replaced By:** SettingsHub.jsx (1,511 lines)
- **Hub Features:** 8 tabs, user management, API keys, security
- **Can Restore:** Yes - git checkout

## Restoration
```bash
git checkout HEAD~1 -- src/pages/[filename].jsx
```
EOF
```

### 2.3 Review Tier 2 Pages (Day 8-10)

Before archiving, audit these for unique features:

| Page | Review For | Action |
|------|------------|--------|
| Contacts.jsx | Bulk merge, segmentation UI | Extract unique features |
| Tasks.jsx | AI priority algorithm | Migrate to TasksHub |
| Affiliates.jsx | Portal UX | Review against hub |

**For each file:**
1. Open both standalone and hub versions
2. Compare feature-by-feature
3. Note any unique functionality
4. Migrate unique features to hub
5. Then archive standalone

---

## Phase 3: Console.log Cleanup (Week 2)

### 3.1 Find All Console Statements

```bash
# Generate list
grep -rn "console.log" src/ --include="*.js" --include="*.jsx" > console_logs.txt

# Count by file
grep -c "console.log" src/**/*.{js,jsx} | grep -v ":0$"
```

### 3.2 Replace with Logger

**Create/Update Logger Utility:**
```javascript
// src/utils/log.js
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (module, message, data) => {
    if (isDev) console.log(`[${module}] ${message}`, data);
  },
  info: (module, message, data) => {
    console.info(`[${module}] ${message}`, data);
  },
  warn: (module, message, data) => {
    console.warn(`[${module}] ${message}`, data);
  },
  error: (module, message, error) => {
    console.error(`[${module}] ${message}`, error);
    // Could add error tracking service here
  }
};
```

**Replace in files:**
```javascript
// Before:
console.log('Debug:', data);

// After:
import { logger } from '@/utils/log';
logger.debug('ContactService', 'Fetched contacts', data);
```

---

## Phase 4: Navigation Consolidation (Week 3)

### 4.1 Update navConfig.js

**Step 1: Add Route Constants**
```javascript
// At top of navConfig.js
export const ROUTES = {
  DASHBOARD: '/smart-dashboard',
  HOME: '/home',
  CLIENTS: '/clients-hub',
  CREDIT: '/credit-hub',
  // ... all hub routes
};
```

**Step 2: Update navigationItems**
```javascript
// Replace hardcoded paths with constants
{
  id: 'clients-hub',
  title: 'Clients Hub',
  path: ROUTES.CLIENTS,  // Changed from '/clients-hub'
  // ...
}
```

**Step 3: Refactor getMobileNavigation**
```javascript
// Before: Hardcoded separate array
const roleSpecificItems = {
  masterAdmin: [
    { path: '/contacts', ... },  // Hardcoded
  ]
};

// After: Derive from main navigation
export function getMobileNavigation(userRole) {
  return navigationItems
    .filter(item => !item.isGroup)
    .filter(item => isVisible(item, userRole, true))
    .filter(item => !item.mobileHidden)
    .slice(0, 6);
}
```

### 4.2 Fix Affiliates Multiple Entries

**Problem:** `/affiliates` has 4 entries with different titles (Dashboard, Referrals, Earnings)

**Solution A: Tab Navigation**
```javascript
// In AffiliatesHub.jsx, read tab from URL
const searchParams = useSearchParams();
const activeTab = searchParams.get('tab') || 'dashboard';

// In navConfig.js
{ path: '/affiliates-hub?tab=dashboard', title: 'Dashboard' },
{ path: '/affiliates-hub?tab=referrals', title: 'Referrals' },
{ path: '/affiliates-hub?tab=earnings', title: 'Earnings' },
```

**Solution B: Single Entry**
```javascript
// Just one entry pointing to hub
{
  id: 'affiliates-hub',
  title: 'Affiliates Hub',
  path: '/affiliates-hub',
  description: 'Dashboard, Referrals, Earnings'
}
```

---

## Phase 5: Directory Restructuring (Week 4)

### 5.1 Create New Directory Structure

```bash
# Create new directories
mkdir -p src/pages/auth
mkdir -p src/pages/core
mkdir -p src/pages/admin
mkdir -p src/pages/client
mkdir -p src/pages/detail
```

### 5.2 Move Files

```bash
# Auth pages
git mv src/pages/Login.jsx src/pages/auth/
git mv src/pages/Register.jsx src/pages/auth/
git mv src/pages/ForgotPassword.jsx src/pages/auth/

# Core pages
git mv src/pages/SmartDashboard.jsx src/pages/core/
git mv src/pages/Home.jsx src/pages/core/

# Admin pages
git mv src/pages/Portal.jsx src/pages/admin/
git mv src/pages/SystemMap.jsx src/pages/admin/
git mv src/pages/AIReviewDashboard.jsx src/pages/admin/
```

### 5.3 Update Imports in App.jsx

```javascript
// Before:
const Login = lazy(() => import('@/pages/Login'));

// After:
const Login = lazy(() => import('@/pages/auth/Login'));
```

### 5.4 Update Path Aliases

```javascript
// vite.config.js or jsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/pages/*": ["src/pages/*"],
      "@/pages/auth/*": ["src/pages/auth/*"],
      "@/pages/hubs/*": ["src/pages/hubs/*"],
      // ...
    }
  }
}
```

---

## Testing Checklist

### After Each Phase

- [ ] Application builds without errors
- [ ] No console errors on page load
- [ ] All navigation items work
- [ ] All redirects function correctly
- [ ] Role-based access still works
- [ ] Mobile navigation works
- [ ] Dark mode still works
- [ ] Firebase queries succeed

### Smoke Test URLs

```
/smart-dashboard  - Dashboard loads
/clients-hub      - Clients hub loads
/credit-hub       - Credit hub loads
/comms-hub        - Communications hub loads
/calendar-hub     - Calendar hub loads (after fix)
/documents-hub    - Documents hub loads
/settings-hub     - Settings hub loads
/login            - Login page loads
/                 - Redirects to dashboard
/contacts         - Redirects to /clients-hub
```

---

## Rollback Procedures

### Quick Rollback (Per File)
```bash
git checkout HEAD~1 -- src/pages/[filename].jsx
```

### Full Phase Rollback
```bash
# Reset to pre-phase commit
git log --oneline -10
git reset --hard [commit-hash]
```

### Emergency Restore
```bash
# Use backup directory
cp -r src_backup_2025_11_21/* src/
```

---

## Timeline Summary

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 0 | Day 1 | Backup, branch, documentation |
| Phase 1 | Days 1-5 | Calendar fix, nav duplicates, sample data |
| Phase 2 | Days 6-10 | Archive redundant files |
| Phase 3 | Week 2 | Console.log cleanup |
| Phase 4 | Week 3 | Navigation consolidation |
| Phase 5 | Week 4 | Directory restructuring |

**Total Estimated Time:** 4 weeks (part-time)

---

## Post-Migration Tasks

1. **Update Documentation**
   - README.md with new structure
   - Component documentation
   - Navigation guide

2. **Monitor for Issues**
   - Watch 404 errors
   - Monitor error tracking
   - Check user feedback

3. **Clean Up**
   - Remove backup directory after 30 days
   - Remove legacy redirects after 6 months
   - Archive migration branch

---

**Report Generated By:** Claude Code Comprehensive Audit
**Status:** AWAITING USER APPROVAL - Implementation blocked until approved
