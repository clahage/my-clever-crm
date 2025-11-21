# PHASE 3: Intelligent Page Consolidation & Navigation Cleanup

**Priority:** HIGH  
**Estimated Time:** 4-6 hours  
**Breaking Changes:** NONE (redirects preserved)

---

## Problem Statement

The navigation sidebar (`src/layout/navConfig.js`) contains **60+ standalone menu items** alongside hub pages. Many standalone pages may have:
- **Superior features** that should be migrated TO hubs
- **Inferior/duplicate features** that should be replaced BY hub features  
- **Unique features** that justify remaining standalone
- **Missing features** that hubs need

**User Feedback:** "CODE was supposed to examine them to see if they might belong within existing or new Hubs, and to see if they were inferior/superior to existing files, merge, move, edit, enhance or delete them."

---

## Task Overview - INTELLIGENT ANALYSIS REQUIRED

**For EACH standalone page in navigation:**

1. ✅ **ANALYZE** the standalone page code (features, LOC, functionality)
2. ✅ **COMPARE** with corresponding hub page (if exists)
3. ✅ **DECIDE** one of these actions:
   - **MIGRATE TO HUB:** Standalone has superior features → Copy/merge into hub, then archive standalone
   - **ARCHIVE STANDALONE:** Hub has superior features → Archive standalone, add redirect
   - **ENHANCE HUB:** Both have unique features → Merge best of both into hub
   - **KEEP STANDALONE:** Truly unique functionality with no logical hub home
   - **CREATE NEW HUB:** Multiple related standalones could form a new hub

4. ✅ **DOCUMENT** decision with evidence (LOC, feature comparison, code quality)
5. ✅ **IMPLEMENT** the chosen action
6. ✅ **TEST** that functionality is preserved

---

## Analysis Methodology

### Step 1: Inventory All Pages

**Scan `src/layout/navConfig.js` and extract:**
- All standalone menu items (pages NOT in hubs)
- Current hub structure

**Create initial inventory:**
```
STANDALONE PAGES (60+):
- Emails.jsx
- SMS.jsx  
- Templates.jsx
- Documents.jsx
- Forms.jsx
- Learning Center.jsx
- Contacts.jsx
- Reports.jsx
... (list all)

EXISTING HUBS (20+):
- CommunicationsHub.jsx
- DocumentsHub.jsx
- LearningHub.jsx
- ClientsHub.jsx
- ReportsHub.jsx
... (list all)
```

---

### Step 2: Compare Each Standalone vs Hub

**For each standalone page, perform detailed analysis:**

#### Example: Emails.jsx vs CommunicationsHub.jsx

**Analysis Template:**
```markdown
## ANALYSIS: Emails.jsx vs CommunicationsHub.jsx

### Emails.jsx (Standalone)
- **Location:** src/pages/Emails.jsx
- **Size:** 2,000 lines
- **Features:**
  * Email composition with WYSIWYG editor
  * Contact selection autocomplete
  * Email templates integration
  * Send history with read receipts
  * Email analytics (open rate, click rate)
  * Attachment handling
  * Schedule send
  * A/B testing capability
  
### CommunicationsHub.jsx (Hub)
- **Location:** src/pages/hubs/CommunicationsHub.jsx
- **Size:** 2,308 lines
- **Email Tab Features:**
  * Basic email composition
  * Contact picker
  * Template dropdown
  * Send history
  * NO analytics
  * NO A/B testing
  * NO schedule send

### DECISION: ENHANCE HUB
**Rationale:** Emails.jsx has superior features (analytics, A/B testing, schedule send).
**Action:** 
1. Migrate advanced features from Emails.jsx → CommunicationsHub email tab
2. Archive Emails.jsx after migration
3. Add redirect /emails → /comms-hub

### CODE CHANGES REQUIRED:
- [ ] Copy EmailAnalytics component from Emails.jsx
- [ ] Copy ABTestingPanel from Emails.jsx
- [ ] Copy ScheduleSend logic from Emails.jsx
- [ ] Integrate into CommunicationsHub email tab
- [ ] Test all features work in hub
- [ ] Archive src/pages/Emails.jsx
- [ ] Add redirect in App.jsx
```

**Repeat this analysis for ALL 60+ standalone pages!**

---

### Step 3: Decision Matrix

**For each standalone page, use this decision tree:**

```
STANDALONE PAGE FOUND
   |
   ├─ Does logical hub exist? (YES/NO)
   |    |
   |    NO → CREATE_NEW_HUB or KEEP_STANDALONE
   |    |
   |    YES → Compare features
   |         |
   |         ├─ Standalone > Hub? → MIGRATE_TO_HUB
   |         ├─ Hub > Standalone? → ARCHIVE_STANDALONE  
   |         ├─ Both unique? → ENHANCE_HUB
   |         └─ Standalone unique? → KEEP_STANDALONE
```

---

## Example Analysis Workflows

### Example 1: Communications Category

**Standalone Pages Found:**
1. Emails.jsx (2,000 LOC)
2. SMS.jsx (1,500 LOC)
3. Templates.jsx (800 LOC)
4. Letters.jsx (1,200 LOC)
5. CallLogs.jsx (600 LOC)
6. Notifications.jsx (500 LOC)
7. DripCampaigns.jsx (2,000 LOC)

**Existing Hub:**
- CommunicationsHub.jsx (2,308 LOC)

**Analysis Process:**
```bash
# 1. Read CommunicationsHub.jsx
# 2. Identify what tabs/features it already has
# 3. For each standalone, compare:
#    - Feature completeness
#    - Code quality
#    - UI/UX design
#    - Firebase integration
#    - AI capabilities
```

**Possible Outcomes:**
- ✅ **Emails.jsx** → ENHANCE_HUB (has advanced analytics hub lacks)
- ✅ **SMS.jsx** → ARCHIVE_STANDALONE (hub SMS tab is superior)
- ✅ **Templates.jsx** → KEEP_STANDALONE (shared across multiple hubs)
- ✅ **DripCampaigns.jsx** → MIGRATE_TO_HUB (hub has basic version, standalone more advanced)

---

### Example 2: Documents Category

**Standalone Pages Found:**
1. Documents.jsx (210 LOC - basic CRUD)
2. Forms.jsx (3,000 LOC - form builder)
3. EContracts.jsx (2,500 LOC - contract management)
4. DocumentCenter.jsx (4,000 LOC - advanced doc management)

**Existing Hub:**
- DocumentsHub.jsx (1,232 LOC)

**Analysis:**
- Documents.jsx → ARCHIVE (already superseded in Phase 1)
- Forms.jsx → MIGRATE_TO_HUB (hub missing form builder)
- EContracts.jsx → ENHANCE_HUB (merge contract features)
- DocumentCenter.jsx → **COMPARE CAREFULLY** (might be superior to hub!)

**Critical Question:** Is DocumentCenter.jsx (4,000 LOC) actually BETTER than DocumentsHub.jsx (1,232 LOC)?

**Action:** Read both files, compare features, make evidence-based decision.

---

### Example 3: Learning Category

**Standalone Pages Found:**
1. LearningCenter.jsx (5,000 LOC - comprehensive)
2. TrainingLibrary.jsx (999 LOC)
3. LiveTrainingSessions.jsx (800 LOC)
4. CertificationSystem.jsx (1,200 LOC)

**Existing Hub:**
- LearningHub.jsx (unknown size)

**Analysis Required:**
- Does LearningHub.jsx already import these as tabs?
- Or are these truly separate standalone pages?
- Compare feature sets meticulously

**Possible Discovery:** LearningHub might already USE these files as lazy-loaded tabs! Don't archive if hub depends on them.

---

## Implementation Steps

### Step 1: Audit navConfig.js
```bash
# Count standalone menu items
grep -c "path: '/" src/layout/navConfig.js

# List all menu items
grep "path: '/" src/layout/navConfig.js | sort
```

**Output to deliverable:** List of all 60+ standalone items found.

---

### Step 2: Update navConfig.js

**For each standalone item:**

1. **Remove from root navigation**
2. **Keep hub entry** (e.g., "Communications Hub" stays)
3. **Document the change** in removal comments

**Example:**
```javascript
// REMOVED: Emails - now in Communications Hub (/comms-hub)
// REMOVED: SMS - now in Communications Hub (/comms-hub)
// REMOVED: Templates - now in Communications Hub (/comms-hub)

// Keep hub entry:
{
  title: 'Communications Hub',
  path: '/comms-hub',
  icon: MessageSquare
}
```

---

### Step 3: Add Redirects to App.jsx

**For EVERY removed standalone route, add redirect:**

```javascript
// Example redirects
<Route path="/emails" element={<Navigate to="/comms-hub" replace />} />
<Route path="/sms" element={<Navigate to="/comms-hub" replace />} />
<Route path="/templates" element={<Navigate to="/comms-hub" replace />} />
<Route path="/documents" element={<Navigate to="/documents-hub" replace />} />
<Route path="/forms" element={<Navigate to="/documents-hub" replace />} />
<Route path="/learning-center" element={<Navigate to="/learning-hub" replace />} />
<Route path="/credit-reports" element={<Navigate to="/credit-reports-hub" replace />} />
<Route path="/disputes" element={<Navigate to="/dispute-hub" replace />} />
<Route path="/settings" element={<Navigate to="/settings-hub" replace />} />
```

**Critical:** Every old URL must redirect to its new hub location!

---

### Step 4: Verify Hub Pages Have Required Tabs

**For each hub, verify it has tabs/sections for consolidated features.**

If missing, add tabs to hub page:

```javascript
// Example: CommunicationsHub.jsx
const tabs = [
  { id: 'emails', label: 'Emails', icon: Mail },
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'templates', label: 'Templates', icon: FileText },
  { id: 'letters', label: 'Letters', icon: Send },
  { id: 'call-logs', label: 'Call Logs', icon: Phone },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'campaigns', label: 'Drip Campaigns', icon: Zap }
];
```

**If a hub is missing functionality:**
- Add a tab with placeholder message: "This feature is being integrated. Use navigation to access [Old Page] temporarily."
- OR keep the standalone route active with a comment

---

### Step 5: Test Thoroughly

**Test every redirect:**
```bash
# Old URL → New hub
/emails → /comms-hub (should work)
/sms → /comms-hub (should work)
/documents → /documents-hub (should work)
/learning-center → /learning-hub (should work)
```

**Test navigation:**
- Sidebar should show ~15 hub items (not 60+ standalone items)
- All hub links work
- No 404 pages
- Mobile nav updated

---

## Deliverables - COMPREHENSIVE DOCUMENTATION REQUIRED

### 1. PHASE_3_ANALYSIS_REPORT.md

**For EVERY standalone page analyzed, document:**

```markdown
# Phase 3: Intelligent Page Consolidation Analysis

## Analysis Summary
- **Total standalone pages analyzed:** 62
- **Migrated to hubs:** 18
- **Archived (hub superior):** 23  
- **Enhanced hubs (merged features):** 12
- **Kept standalone (justified):** 9
- **New hubs created:** 0

---

## Detailed Analysis by Category

### Communication Pages

#### 1. Emails.jsx
**Location:** src/pages/Emails.jsx  
**Size:** 2,000 LOC  
**Hub Comparison:** CommunicationsHub.jsx (2,308 LOC)

**Features in Standalone:**
- ✅ WYSIWYG email editor (Quill integration)
- ✅ Email analytics dashboard (open rate, click rate)
- ✅ A/B testing panel
- ✅ Schedule send functionality
- ✅ Advanced contact autocomplete
- ✅ Read receipts tracking

**Features in Hub:**
- ✅ Basic email composition
- ✅ Contact picker
- ✅ Template dropdown
- ✅ Send history
- ❌ NO analytics
- ❌ NO A/B testing
- ❌ NO schedule send

**DECISION:** **ENHANCE_HUB**

**Rationale:** Standalone has 4 superior features (analytics, A/B testing, schedule, read receipts) that hub lacks.

**Action Taken:**
1. ✅ Copied EmailAnalyticsDashboard component (lines 245-389 from Emails.jsx)
2. ✅ Copied ABTestingPanel component (lines 445-567 from Emails.jsx)
3. ✅ Copied ScheduleSendModal component (lines 890-1023 from Emails.jsx)
4. ✅ Integrated into CommunicationsHub.jsx email tab
5. ✅ Tested: All features working in hub
6. ✅ Archived src/pages/Emails.jsx to archive/pages/superseded-standalone-pages/2025-11-21/
7. ✅ Added redirect: /emails → /comms-hub

**Code Changes:**
- `src/pages/hubs/CommunicationsHub.jsx` (+456 LOC)
- `archive/pages/superseded-standalone-pages/2025-11-21/Emails.jsx` (archived)
- `src/App.jsx` (added redirect)

**Commit:** `abc1234 - Enhance CommunicationsHub with email analytics from Emails.jsx`

---

#### 2. SMS.jsx
**Location:** src/pages/SMS.jsx  
**Size:** 1,500 LOC  
**Hub Comparison:** CommunicationsHub.jsx SMS tab

**Features in Standalone:**
- Basic SMS composition
- Contact selection
- Send history

**Features in Hub:**
- SMS composition with templates
- Bulk SMS sending
- SMS campaigns integration
- Delivery tracking
- Auto-reply rules

**DECISION:** **ARCHIVE_STANDALONE**

**Rationale:** Hub SMS tab is superior - has bulk sending, campaigns, auto-reply that standalone lacks.

**Action Taken:**
1. ✅ Verified hub has ALL standalone features + more
2. ✅ Archived src/pages/SMS.jsx to archive/pages/superseded-standalone-pages/2025-11-21/
3. ✅ Added redirect: /sms → /comms-hub

**Commit:** `abc1235 - Archive SMS.jsx, hub version superior`

---

(Continue for ALL 62 standalone pages...)
```

---

### 2. FEATURE_MIGRATION_LOG.md

**Track every feature migrated:**

```markdown
# Feature Migration Log - Phase 3

## Features Migrated TO Hubs

### CommunicationsHub.jsx
**From Emails.jsx:**
- Email Analytics Dashboard (245 LOC)
  * Open rate tracking
  * Click rate tracking
  * Bounce rate monitoring
  * Time-series charts
- A/B Testing Panel (122 LOC)
  * Subject line testing
  * Content testing
  * Auto-winner selection
- Schedule Send (133 LOC)
  * Date/time picker
  * Timezone handling
  * Recurring sends

**From CallLogs.jsx:**
- Call recording playback (67 LOC)
- Call transcription AI integration (89 LOC)

**Total added to CommunicationsHub:** +678 LOC

### DocumentsHub.jsx  
**From Forms.jsx:**
- Drag-drop form builder (1,200 LOC)
- Custom field types (23 types)
- Form analytics

**From EContracts.jsx:**
- E-signature integration (DocuSign API)
- Contract templates library
- Version control system

**Total added to DocumentsHub:** +2,400 LOC

... (continue for all hubs)
```

---

### 3. HUB_ENHANCEMENTS.md

**Document every hub improved:**

```markdown
# Hub Enhancement Summary

## CommunicationsHub.jsx
**Before:** 2,308 LOC, 6 tabs  
**After:** 2,986 LOC, 7 tabs

**Enhancements:**
1. ✅ Email tab: Added analytics, A/B testing, schedule send
2. ✅ Call Logs tab: Added recording playback, transcription
3. ✅ New tab: "Campaigns" (migrated from DripCampaigns.jsx)

**Testing:** ✅ All features verified working

## DocumentsHub.jsx
**Before:** 1,232 LOC, 4 tabs  
**After:** 3,632 LOC, 6 tabs

**Enhancements:**
1. ✅ Forms tab: Complete form builder migrated
2. ✅ Contracts tab: E-signature and templates added
3. ✅ New tab: "Document Center" (best features from DocumentCenter.jsx)

**Testing:** ✅ All features verified working

... (continue for all hubs)
```

---

### 4. STANDALONE_PAGES_KEPT.md

**Justify every standalone page NOT consolidated:**

```markdown
# Standalone Pages Retained - Justification

## Pages Kept (9 total)

### 1. Pipeline.jsx
**Reason:** Unique sales pipeline visualization with Kanban board  
**Size:** 3,500 LOC  
**Why not in SalesHub?** No SalesHub exists; Pipeline is primary sales tool  
**Nav Location:** Top-level "Sales Pipeline" menu item  
**Action:** Keep as-is, consider creating SalesHub in future

### 2. SmartDashboard.jsx  
**Reason:** Alternative dashboard with AI-powered insights  
**Size:** 4,200 LOC  
**Why not in DashboardHub?** This IS a complete dashboard replacement  
**Nav Location:** Top-level alternative to Home  
**Action:** Keep, users choose between Welcome Hub or Smart Dashboard

### 3. ClientPortal.jsx
**Reason:** Separate client-facing portal (different authentication)  
**Size:** 8,000 LOC  
**Why not in ClientsHub?** Public-facing portal vs admin CRM  
**Nav Location:** Separate subdomain (portal.myclevercrm.com)  
**Action:** Keep standalone

... (continue for all 9 kept pages)
```

---

### 5. NAVIGATION_FINAL_STRUCTURE.md

**Document the cleaned navigation:**

```markdown
# Final Navigation Structure

## Before Phase 3
**Total menu items:** 67
**Structure:** Cluttered mix of hubs and standalone pages

## After Phase 3  
**Total menu items:** 24
**Structure:** Clean hub-based organization

### Primary Navigation (9 items)
1. 🏠 Home (Welcome Hub)
2. 👥 Clients Hub
3. ✅ Tasks & Scheduling Hub
4. 📅 Calendar Hub
5. 📊 Analytics Hub
6. 📈 Sales Pipeline (standalone - justified)
7. 🤖 AI Hub
8. 📱 Smart Dashboard (alternative dashboard)
9. ⚙️ Settings Hub

### Business Hubs (6 items)
1. 💰 Revenue Hub
2. 📢 Marketing Hub
3. 🔗 Affiliates Hub
4. 💳 Billing Hub
5. 📞 Communications Hub
6. 📄 Documents Hub

### Credit Repair Hubs (3 items)
1. 💳 Credit Intelligence Hub
2. ⚖️ Dispute Hub
3. 📮 Bureau Communication Hub

### Support & Learning (4 items)
1. 🎓 Learning Hub
2. 📚 Resource Library Hub
3. 💬 Support Hub
4. 🔐 Compliance Hub

### Development (2 items - admin only)
1. 🛠️ Automation Hub
2. 📱 Mobile App Hub

**Total:** 24 organized items (down from 67)
```

---

## Critical Safety Rules

### 1. ANALYSIS BEFORE ACTION
- ❌ **NEVER** archive a page without reading it first
- ❌ **NEVER** assume hub is superior without comparing
- ✅ **ALWAYS** read both standalone AND hub files
- ✅ **ALWAYS** document features found in each
- ✅ **ALWAYS** justify decisions with evidence (LOC, features, code quality)

### 2. FEATURE PRESERVATION
- ✅ **ALWAYS** preserve superior features (migrate to hub)
- ✅ **ALWAYS** test migrated features work in hub
- ❌ **NEVER** lose functionality in consolidation
- ✅ If hub lacks space, enhance hub architecture (add tabs, sections)

### 3. DEPENDENCY CHECKING
- ✅ **ALWAYS** check if hub lazy-loads the standalone file (don't archive if so!)
- ✅ Example: TrainingHub.jsx might import TrainingLibrary.jsx as tab
- ✅ Search codebase for imports: `grep -r "TrainingLibrary" src/`
- ❌ **NEVER** archive a file that another component imports

### 4. INCREMENTAL COMMITS
- ✅ **ONE** page analysis per commit
- ✅ Commit message format: `"PHASE3: [ACTION] PageName.jsx - [reason]"`
- ✅ Examples:
  - `"PHASE3: ENHANCE_HUB Emails.jsx - migrated analytics to CommunicationsHub"`
  - `"PHASE3: ARCHIVE SMS.jsx - hub version superior, all features present"`
  - `"PHASE3: KEEP_STANDALONE Pipeline.jsx - unique sales tool, no logical hub"`

### 5. TESTING REQUIREMENTS
- ✅ **ALWAYS** run `npm run build` after changes
- ✅ **ALWAYS** test the affected routes in dev server
- ✅ **ALWAYS** verify redirects work
- ❌ **NEVER** commit broken code

### 6. DOCUMENTATION RIGOR
- ✅ **EVERY** decision must be in PHASE_3_ANALYSIS_REPORT.md
- ✅ **EVERY** feature migration must be in FEATURE_MIGRATION_LOG.md
- ✅ **EVERY** hub enhancement must be in HUB_ENHANCEMENTS.md
- ✅ **EVERY** kept standalone must be justified in STANDALONE_PAGES_KEPT.md

---

## Success Criteria (Updated)

✅ **All 60+ standalone pages analyzed with written evidence**  
✅ **Navigation reduced to ~20-25 logical items** (hubs + justified standalones)  
✅ **All superior features migrated to hubs**  
✅ **All old URLs redirect correctly**  
✅ **Zero functionality lost**  
✅ **Zero 404 errors**  
✅ **Build succeeds**  
✅ **All 5 deliverables created with complete analysis**  
✅ **Mobile navigation updated**  
✅ **Every decision justified with evidence**  

---

## Commit Strategy

```bash
# Commit 1
git commit -m "NAVIGATION: Consolidate communication items to Communications Hub (7 items)"

# Commit 2
git commit -m "NAVIGATION: Consolidate document items to Documents Hub (6 items)"

# Commit 3
git commit -m "NAVIGATION: Consolidate learning items to Learning Hub (9 items)"

# Continue for each hub...

# Final commit
git commit -m "NAVIGATION: Add all redirects and update mobile nav - cleanup complete"
```

---

## Expected Outcomes

### Quantitative Results
- **Navigation items:** 67 → ~24 (64% reduction)
- **Pages analyzed:** 60+
- **Pages migrated to hubs:** ~15-20
- **Pages archived (inferior):** ~20-25
- **Hubs enhanced:** ~10-12
- **Pages kept standalone (justified):** ~8-10
- **Features migrated:** Document every single one
- **LOC added to hubs:** ~5,000-10,000 (from standalone pages)
- **LOC archived:** ~15,000-20,000 (redundant code)

### Qualitative Results
- **User Experience:** Clean, logical, hub-based navigation
- **Maintainability:** Single source of truth for each feature category
- **Feature Completeness:** Hubs contain BEST features from all sources
- **Zero Regression:** All functionality preserved or enhanced
- **Documentation:** Complete audit trail of every decision

---

## Example Commit History

```bash
git log --oneline -20

e4f8d92 PHASE3: Complete - Final navigation structure (24 items, 5 deliverables)
d3e7c81 PHASE3: ENHANCE_HUB CertificationSystem.jsx - badges to LearningHub
c2d6b70 PHASE3: ARCHIVE OnboardingWizard.jsx - hub version superior
b1c5a60 PHASE3: KEEP_STANDALONE Pipeline.jsx - unique sales tool
a0b4950 PHASE3: ENHANCE_HUB Forms.jsx - form builder to DocumentsHub
9f38e40 PHASE3: ARCHIVE SMS.jsx - hub has superior features
8e27d30 PHASE3: ENHANCE_HUB Emails.jsx - analytics migrated to CommunicationsHub
7d16c20 PHASE3: Start - inventory all standalone pages
```

---

## Critical Warnings

⚠️ **DO NOT RUSH THIS TASK**

This is NOT about blindly removing navigation items. This is about:
1. **ANALYZING** 60+ pages carefully
2. **COMPARING** features methodically  
3. **MIGRATING** superior functionality
4. **PRESERVING** everything valuable
5. **DOCUMENTING** every decision with evidence

**Estimated time: 4-6 hours** (not 2-3) because ANALYSIS is required.

⚠️ **IF YOU FIND A STANDALONE PAGE WITH SUPERIOR FEATURES:**
- DO NOT archive it immediately
- MIGRATE those features to the hub first
- THEN archive after migration complete
- TEST the hub has all functionality

⚠️ **IF A HUB IMPORTS A STANDALONE FILE:**
- Example: `TrainingHub.jsx` imports `TrainingLibrary.jsx`
- DO NOT archive the imported file
- Hub DEPENDS on it
- Only remove from navigation if appropriate

---

## Notes

- This is **Phase 3** of the consolidation effort
- Phase 1: Fixed 10 critical issues ✅
- Phase 2: Archived 142 redundant files ✅
- Phase 3: **Intelligent page consolidation & navigation cleanup** (THIS TASK)

**This is a THINKING task, not a DELETE task.**

**Work methodically. Analyze deeply. Document thoroughly. Test completely.**

**Branch:** Continue on `claude/consolidate-pages-phase-two-01SR2Dm1qTPqzfb3uBvFDVfT`

**Estimated completion:** 4-6 hours (analysis-heavy)

---

## Questions?

If a standalone page has NO obvious hub:
1. Check if it's truly unique functionality
2. Consider if it should be a primary top-level item (like Pipeline/Sales)
3. Document decision in HUB_VERIFICATION.md
4. Keep standalone route if justified

**Default action:** When in doubt, consolidate to most logical hub.
