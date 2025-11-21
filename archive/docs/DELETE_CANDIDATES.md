# DELETE CANDIDATES - Review Before Deleting

**Created:** 2025-11-18
**Purpose:** Files identified during production cleanup that may be candidates for deletion

---

## 1. TEMP_ZIP FOLDERS (High Priority)

These appear to be backup/archive folders that are duplicating the entire src structure:

```
c:\my-clever-crm\temp_zip\
c:\my-clever-crm\temp_zip\temp_zip\
```

**Recommendation:** These folders contain ~450MB+ of duplicate source code. Review contents and delete if confirmed as backups.

---

## 2. DUPLICATE/REDUNDANT PAGES

### Dashboard Duplicates
The following dashboards may be redundant:

| File | Lines | Status | Recommendation |
|------|-------|--------|----------------|
| src/pages/Dashboard.jsx | 464 | CLEAN | KEEP - Simple executive overview |
| src/pages/SmartDashboard.jsx | 4,856 | CLEANED | KEEP - Power user dashboard |
| src/pages/hubs/DashboardHub.jsx | 2,878 | CLEAN | KEEP - Ultimate command center |

**Note:** All three serve different purposes and should be kept.

---

## 3. UNUSED NAVIGATION.JSX

**File:** `src/components/Navigation.jsx`

**Status:** Modified but NOT USED by the app
- App uses `src/layout/navConfig.js` and `src/layout/ProtectedLayout.jsx` instead
- This file was updated to 12 hubs but the app doesn't reference it

**Recommendation:**
- Option A: Delete (app doesn't use it)
- Option B: Keep for reference/future use

---

## 4. OLD COMPONENT FILES TO REVIEW

### AddClientForm Duplicate
```
src/components/IDIQ/AddClientForm.jsx
```
- May be duplicate of UltimateContactForm
- Uses older "Add Client" terminology
- Review if still needed

### Potential Unused Files
These should be verified if they're still used:

```
src/pages/ClientList.jsx          - May be replaced by Contacts.jsx
src/pages/ClientIntake.jsx        - Standalone page, may redirect to Contacts
```

---

## 5. BUILD/CACHE FILES

These should not be committed but can be cleaned:

```
.firebase/hosting.ZGlzdA.cache    - Firebase hosting cache
build-errors.txt                  - Old build error log
```

---

## 6. DOCUMENTATION FILES TO REVIEW

```
INTEGRATION_SUMMARY_UltimateClientForm.md  - Outdated (file renamed)
audit/nav-inventory.md                      - May be outdated
scripts/navInventory.mjs                    - May be outdated
```

---

## ACTION REQUIRED

1. **Review temp_zip folders** - Confirm they are backups before deleting
2. **Decide on Navigation.jsx** - Delete or keep for reference
3. **Test AddClientForm.jsx** - Check if IDIQ enrollment uses it
4. **Clean build artifacts** - Remove old build logs

---

## DO NOT DELETE

The following files should NOT be deleted:

- `src/components/UltimateContactForm.jsx` - Main contact form (renamed)
- `src/pages/SmartDashboard.jsx` - Main dashboard
- `src/pages/hubs/*` - All hub pages are in use
- `src/layout/navConfig.js` - Actual navigation config
- `CLAUDE_CODE_TASK.md` - Project documentation
- `URGENT_FIXES_REQUIRED.md` - Fix documentation

---

**Note:** This file was generated during production cleanup. User should review and approve deletions.
