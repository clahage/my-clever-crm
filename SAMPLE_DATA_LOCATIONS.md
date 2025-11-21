# Sample Data & Placeholder Locations Report

**Created:** 2025-11-18
**Updated:** 2025-11-21 (Comprehensive Audit)
**Purpose:** Document locations of mock/sample data that should be replaced with Firebase queries
**Analysis Type:** RESEARCH ONLY - No code changes made

---

## Executive Summary

A comprehensive scan of the codebase identified **85+ instances** of sample/placeholder data across **45+ files**. These fall into distinct categories:

| Category | Count | Severity | Action |
|----------|-------|----------|--------|
| Hardcoded Demo Data | 25+ | CRITICAL | Remove/Replace |
| console.log Statements | 40+ | HIGH | Remove for Production |
| Mock API Functions | 8 | MEDIUM | Replace with Real APIs |
| Legitimate Placeholders | 15+ | LOW | Keep - Proper UX |
| Test File Data | 5 | NONE | Keep - Test isolation |

---

## PATTERN TO LOOK FOR

Files using these patterns contain sample data:

```javascript
// Mock data generators
generateMock*()
generateDemo*()
const mockData = [...]
const sampleData = [...]

// Fake names
'John Smith', 'Jane Doe', 'Sarah Martinez', 'Emily', 'Michael', etc.

// Static numbers
totalClients: 247
successRate: 78%
```

---

## CRITICAL ISSUES (Must Fix Before Production)

### 1. Hardcoded Demo Client Data

#### File: `src/pages/ProgressPortal.jsx` (Lines 6-9)
```javascript
// HARDCODED DEMO DATA - Should fetch from Firebase
const demoClients = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com" },
  { id: 4, name: "Sarah Williams", email: "sarah@example.com" }
];
```
**Impact:** Displays fake data instead of real client progress
**Fix:** Replace with Firebase query to `contacts` collection

---

#### File: `src/utils/initializeCollections.js` (Lines 17-45)
```javascript
// SAMPLE SEED DATA - Used during database initialization
email: 'sample@example.com',
phone: '555-0000',
name: 'Sample Contact'
```
**Impact:** Creates fake records in production database
**Fix:** Remove seed data or add environment check to only run in development

---

#### File: `src/Preview.jsx` (Lines 271, 283)
```javascript
// DEMO ACTIVITY FEED
"New contact added: John Doe"
"Credit report updated: Jane Smith"
```
**Impact:** Shows fake activity in preview mode
**Fix:** Either remove or clearly mark as "Demo Mode" with toggle

---

#### File: `src/modern/ModernDashboard.jsx` (Lines 40-41)
```javascript
// HARDCODED ACTIVITY FEED
"New lead added: John Doe"
"Dispute started for Jane Smith"
```
**Impact:** Shows fake activity on modern dashboard view
**Fix:** Replace with real activity from Firebase `activityLog` collection

---

#### File: `src/components/AICreditAnalyzer.jsx` (Line 114)
```javascript
const sampleReport = {
  name: 'John Doe',
  // ... mock credit report data
};
```
**Impact:** AI analyzer uses mock data when real data unavailable
**Fix:** Show proper empty state or "No data available" message

---

#### File: `src/pages/hubs/DocumentsHub.jsx` (Lines 588, 593)
```javascript
// MISSING DOCUMENTS LIST
{ client: "John Doe", missing: [...] },
{ client: "Jane Smith", missing: [...] }
```
**Impact:** Shows fake missing document alerts
**Fix:** Query actual client documents from Firebase

---

#### File: `src/pages/hubs/ComplianceHub.jsx` (Lines 603-702)
```javascript
// DEMO AUDIT TRAIL AND TRAINING DATA
auditTrail: [
  { action: "Policy Updated", user: "John Admin", ... },
  ...
]
```
**Impact:** Compliance reports show fake audit data
**Fix:** Replace with real audit log entries

---

#### File: `src/pages/hubs/LearningHub.jsx` (Lines 628-629)
```javascript
// HARDCODED TEAM MEMBERS
teamMembers: ["Alice", "Bob", "Charlie"]
```
**Impact:** Shows fake team in learning dashboard
**Fix:** Fetch actual team members from users collection

---

### 2. Fake Contact Information

#### File: `src/pages/Profile.jsx` (Line 14)
```javascript
phone: '+1 (555) 123-4567'  // Hardcoded demo phone
```
**Impact:** Default profile shows fake phone number
**Fix:** Show empty or prompt user to add phone

---

#### File: `src/pages/hubs/SettingsHub.jsx` (Line 334)
```javascript
companyPhone: '+1 (555) 123-4567'  // Hardcoded company phone
```
**Impact:** Settings show fake company phone
**Fix:** Load from company settings in Firebase or show "Not configured"

---

#### File: `src/pages/FullAgreement.jsx` (Line 3224)
```javascript
contactPhone: '(555) 123-4567'  // Contract template phone
```
**Impact:** Contracts show placeholder phone
**Fix:** Pull from company branding/settings configuration

---

### 3. Mock API Functions

#### File: `src/components/credit/IDIQEnrollment.jsx` (Lines 486, 516)
```javascript
const mockIDIQApiCall = async () => {
  // Returns fake enrollment response
  return { success: true, enrollmentId: 'MOCK-123' };
};
```
**Impact:** Could accidentally use mock instead of real IDIQ API
**Fix:** Remove mock or add clear environment flag

---

#### File: `src/components/credit/CreditReportWorkflow.jsx` (Lines 525-798)
```javascript
const mockIDIQPull = async () => { ... };
const extractTextFromPDF = async () => { /* Mock extraction */ };
```
**Impact:** Credit report workflow uses mock data
**Fix:** Ensure production uses real IDIQ API calls

---

#### File: `src/components/AICreditAnalyzer.jsx` (Lines 65-67)
```javascript
function generateMockCreditReport() {
  // Generates fake credit report for testing
}
```
**Impact:** Testing function could leak into production
**Fix:** Move to test file or add DEV-only flag

---

---

## HIGH PRIORITY (Remove Before Production)

### 4. Console.log Statements (40+ instances)

These should be removed or converted to proper logging:

| File | Line Count | Description |
|------|-----------|-------------|
| `src/services/aiCreditReportParser.js` | 8 | Debug logging throughout parser |
| `src/services/affiliateLinkService.js` | 7 | Affiliate tracking debug |
| `src/services/idiqService.js` | 8 | IDIQ API call logging |
| `src/contexts/AuthContext.jsx` | 4 | Auth state debug |
| `src/components/client-portal/ContractSigningPortal.jsx` | 12 | Contract signing debug |
| `src/components/ReviewsRatingsSystem.jsx` | 1 | Export data logging |

**Recommended Action:**
```javascript
// Replace console.log with proper logger
import { logger } from '@/utils/log';

// Instead of:
console.log('Debug:', data);

// Use:
logger.debug('IDIQ Service', 'API Response', data);
```

---

### 5. Hardcoded Mock Reports Data

#### File: `src/pages/Reports.jsx` (Multiple Lines)
```javascript
// HARDCODED METRICS - Should come from Firebase aggregation
const scoreImprovement = 47;
const revenueGrowth = 23.5;
const retentionRate = 89;
const churnRate = 11;
const successRate = 94;
```
**Impact:** Reports show fake performance data
**Fix:** Calculate from actual client/revenue data

---

#### File: `src/components/AdminNotificationCenter.jsx` (Lines 5, 24)
```javascript
const mockNotifications = [
  { id: 1, message: "New signup", type: "info" },
  // ... more mock notifications
];
```
**Impact:** Admin sees fake notifications
**Fix:** Load from Firebase notifications collection

---

---

## FILES WITH SAMPLE DATA (Updated Inventory)

### HIGH PRIORITY (Core Hubs)

| File | Status | Notes |
|------|--------|-------|
| `src/pages/SmartDashboard.jsx` | CLEANED | Widgets now use Firebase |
| `src/pages/hubs/DashboardHub.jsx` | CLEANED | Uses real Firebase data |
| `src/pages/hubs/MarketingHub.jsx` | HAS MOCKS | generateMockLeads(), generateMockCampaigns() |
| `src/pages/hubs/AIHub.jsx` | HAS MOCKS | Mock insights, analytics |
| `src/pages/hubs/ReportsHub.jsx` | HAS MOCKS | Mock report data |
| `src/pages/hubs/LearningHub.jsx` | HAS MOCKS | Mock courses, progress, team members (lines 628-629) |
| `src/pages/hubs/DocumentsHub.jsx` | HAS MOCKS | Fake client names (lines 588, 593) |
| `src/pages/hubs/ComplianceHub.jsx` | HAS MOCKS | Demo audit trail (lines 603-702) |

### MEDIUM PRIORITY (Secondary Hubs)

| File | Status | Notes |
|------|--------|-------|
| `src/pages/hubs/AffiliatesHub.jsx` | HAS MOCKS | Mock affiliate data |
| `src/pages/hubs/ReferralEngineHub.jsx` | HAS MOCKS | Mock referral stats |
| `src/pages/hubs/ReviewsReputationHub.jsx` | HAS MOCKS | Mock reviews |
| `src/pages/hubs/ContractManagementHub.jsx` | HAS MOCKS | Mock contracts |
| `src/pages/hubs/SettingsHub.jsx` | HAS MOCKS | Hardcoded phone (line 334) |

### LOWER PRIORITY (Standalone Pages)

| File | Status | Notes |
|------|--------|-------|
| `src/pages/Affiliates.jsx` | HAS MOCKS | Older page |
| `src/pages/ClientPortal.jsx` | HAS MOCKS | Client view |
| `src/pages/LearningCenter.jsx` | HAS MOCKS | Education data |
| `src/pages/DisputeLetters.jsx` | HAS MOCKS | Sample letters |
| `src/pages/Documents.jsx` | HAS MOCKS | Sample documents |
| `src/pages/Leads.jsx` | HAS MOCKS | Sample leads, decision makers (lines 868-869) |
| `src/pages/Letters.jsx` | HAS MOCKS | Sample letters (comment line 28) |
| `src/pages/Messages.jsx` | HAS MOCKS | Sample messages |
| `src/pages/Notifications.jsx` | HAS MOCKS | Sample notifications |
| `src/pages/ProgressPortal.jsx` | HAS MOCKS | Demo clients (lines 6-9) |
| `src/pages/Profile.jsx` | HAS MOCKS | Hardcoded phone (line 14) |
| `src/pages/Reports.jsx` | HAS MOCKS | Hardcoded metrics |

### COMPONENTS WITH SAMPLE DATA

| File | Status | Notes |
|------|--------|-------|
| `src/components/AICreditAnalyzer.jsx` | HAS MOCKS | Mock credit report (lines 65-67, 114) |
| `src/components/AdminNotificationCenter.jsx` | HAS MOCKS | mockNotifications (lines 5, 24) |
| `src/components/dispute/AIDisputeCoach.jsx` | HAS MOCKS | mockTutorials (lines 411-465) |
| `src/components/credit/IDIQEnrollment.jsx` | HAS MOCKS | mockIDIQApiCall (lines 486, 516) |
| `src/components/credit/CreditReportWorkflow.jsx` | HAS MOCKS | mockIDIQPull (lines 525-798) |
| `src/modern/ModernDashboard.jsx` | HAS MOCKS | Demo activity feed (lines 40-41) |
| `src/Preview.jsx` | HAS MOCKS | Demo activity (lines 271, 283) |

---

## LEGITIMATE PLACEHOLDERS (Keep)

### Template Preview Data
#### File: `src/components/dispute/DisputeTemplateManager.jsx` (Lines 523-555)
```javascript
const sampleData = {
  '{{fullName}}': 'John Doe',
  '{{email}}': 'john.doe@example.com',
  // ... template variables
};
```
**Verdict:** KEEP - Proper UX for template editing preview

### CSV Import Template Data
#### File: `src/pages/ImportCSV.jsx` (Lines 179-180)
```javascript
"John Doe,john@example.com,555-123-4567"
```
**Verdict:** KEEP - Essential for user guidance

### Form Input Placeholders
- `src/pages/Roles.jsx` line 1180: `placeholder="John Doe"`
- `src/components/UltimateContactForm.jsx` line 1274: `placeholder="(555) 555-5555"`
**Verdict:** KEEP - Standard UX pattern

### "Coming Soon" Features
| File | Line | Message |
|------|------|---------|
| `src/pages/Addendums.jsx` | 16 | "Coming soon!" |
| `src/pages/Certificates.jsx` | 16 | "Coming soon!" |
| `src/pages/ContactExport.jsx` | 16 | "Coming soon!" |
| `src/pages/hubs/BillingHub.jsx` | 679 | "This section is under development" |
**Verdict:** KEEP - Proper placeholder for unreleased features

---

## CLEANUP PATTERN

To clean a file, replace mock generators with Firebase queries:

### BEFORE (Mock Data)
```javascript
const generateMockLeads = () => {
  const leads = [];
  const names = ['John Smith', 'Jane Doe', ...];
  for (let i = 1; i <= 50; i++) {
    leads.push({
      id: `lead-${i}`,
      name: names[Math.floor(Math.random() * names.length)],
      ...
    });
  }
  return leads;
};

// In component
const [leads] = useState(generateMockLeads());
```

### AFTER (Firebase Data)
```javascript
const [leads, setLeads] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchLeads = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'leads'));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };
  fetchLeads();
}, []);

// Add empty state
{leads.length === 0 ? (
  <EmptyState message="No leads yet" />
) : (
  // Render leads
)}
```

---

## REMEDIATION PLAN

### Phase 1: Critical Fixes (Before Next Deployment)

| Priority | File | Action | Effort |
|----------|------|--------|--------|
| 1 | ProgressPortal.jsx | Replace demo clients with Firebase query | 2 hrs |
| 2 | initializeCollections.js | Add DEV-only check or remove seed data | 1 hr |
| 3 | Reports.jsx | Connect to real analytics data | 4 hrs |
| 4 | AICreditAnalyzer.jsx | Remove/flag mock report generator | 1 hr |
| 5 | ModernDashboard.jsx | Connect to real activity feed | 2 hrs |

### Phase 2: Console.log Cleanup (Week 1)

```bash
# Run this to find all console.log statements
grep -rn "console.log" src/ --include="*.js" --include="*.jsx" | wc -l
# Result: 40+ instances
```

**Action:** Create proper logging utility and replace all console.log calls

### Phase 3: Mock API Removal (Week 2)

1. Audit all mock API functions
2. Ensure production environment uses real APIs
3. Add environment checks where mocks are needed for development

### Phase 4: Documentation (Week 3)

1. Document legitimate sample data (template previews, CSV examples)
2. Add UI indicators for demo/preview modes
3. Create dev environment with sample data toggle

---

## FIREBASE COLLECTIONS REFERENCE

- `leads` - Lead management
- `campaigns` - Marketing campaigns
- `content` - Content marketing
- `affiliates` - Affiliate partners
- `referrals` - Referral tracking
- `reviews` - Customer reviews
- `courses` - Learning courses
- `progress` - Learning progress
- `contracts` - Contract management
- `reports` - Report data
- `contacts` - Client contacts
- `activityLog` - User activity feed
- `notifications` - System notifications
- `users` - Team members

---

## VALIDATION CHECKLIST

Before deploying, verify:

- [ ] No hardcoded "John Doe" or "Jane Smith" in production code
- [ ] No "example.com" emails visible to users
- [ ] No "555-" phone numbers in production data
- [ ] console.log statements removed or replaced
- [ ] Mock API functions flagged or removed
- [ ] Template preview data clearly marked as examples
- [ ] CSV templates documented as sample data
- [ ] All "Coming soon" features either implemented or hidden

---

## NOTES

- Each cleanup should be tested before committing
- Add loading states for all data fetching
- Add empty states for when data is empty
- Preserve all UI/styling - only change data source
- Follow patterns from SmartDashboard.jsx and DashboardHub.jsx

---

**Report Generated By:** Claude Code Comprehensive Audit
**Status:** ANALYSIS COMPLETE - Awaiting User Approval for Implementation
