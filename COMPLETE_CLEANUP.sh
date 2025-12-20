#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# SPEEDYCRM - COMPLETE IDIQ SYSTEM CLEANUP
# ═══════════════════════════════════════════════════════════════════════════
# Eliminates: Confusion, Conflicts, Cussing! (The 3 C's)
#
# What this script does:
# 1. Deletes duplicate files
# 2. Deletes obsolete placeholder files
# 3. Checks for usage of questionable Cloud Functions
# 4. Compares ClientCreditReport files to find best version
# 5. Creates git commits for each phase
#
# Safety: Creates backup branch before any changes
# ═══════════════════════════════════════════════════════════════════════════

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}"
echo "═══════════════════════════════════════════════════════════════════════════"
echo "    🧹 SPEEDYCRM IDIQ CLEANUP SCRIPT"
echo "    Eliminating: Confusion, Conflicts, Cussing!"
echo "═══════════════════════════════════════════════════════════════════════════"
echo -e "${NC}"

# Navigate to project root
cd /c/my-clever-crm || { echo "Error: Cannot find project directory"; exit 1; }

# ═══════════════════════════════════════════════════════════════════════════
# CREATE BACKUP BRANCH
# ═══════════════════════════════════════════════════════════════════════════

BACKUP_BRANCH="backup-before-idiq-cleanup-$(date +%Y%m%d-%H%M%S)"
echo -e "${BLUE}📦 Creating backup branch: $BACKUP_BRANCH${NC}"
git checkout -b "$BACKUP_BRANCH"
git checkout main
echo -e "${GREEN}✅ Backup branch created${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 1: DELETE DUPLICATE FILES
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${PURPLE}"
echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 1: DELETE DUPLICATE FILES"
echo "═══════════════════════════════════════════════════════════════════════════"
echo -e "${NC}"

DELETED_COUNT=0

# Delete duplicate aiCreditReportParser.js from utils
if [ -f "src/utils/aiCreditReportParser.js" ]; then
  echo -e "${RED}❌ Deleting: src/utils/aiCreditReportParser.js${NC}"
  echo "   Reason: DUPLICATE (keeping /services/ version)"
  git rm src/utils/aiCreditReportParser.js
  echo -e "${GREEN}   ✅ Deleted${NC}"
  ((DELETED_COUNT++))
else
  echo -e "${YELLOW}   ⚠️  File not found: src/utils/aiCreditReportParser.js (already deleted?)${NC}"
fi

# Delete obsolete idiqProvider.js
if [ -f "src/utils/idiqProvider.js" ]; then
  echo -e "${RED}❌ Deleting: src/utils/idiqProvider.js${NC}"
  echo "   Reason: OBSOLETE PLACEHOLDER (using /services/idiqService.js instead)"
  git rm src/utils/idiqProvider.js
  echo -e "${GREEN}   ✅ Deleted${NC}"
  ((DELETED_COUNT++))
else
  echo -e "${YELLOW}   ⚠️  File not found: src/utils/idiqProvider.js (already deleted?)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Phase 1 Complete! Deleted $DELETED_COUNT files${NC}"
echo ""

# Commit Phase 1 if any files were deleted
if [ $DELETED_COUNT -gt 0 ]; then
  git add -A
  git commit -m "cleanup(phase1): Remove duplicate and obsolete IDIQ files

- Deleted src/utils/aiCreditReportParser.js (duplicate of /services/)
- Deleted src/utils/idiqProvider.js (obsolete placeholder)
- Keeping production-ready versions in /services/"
  echo -e "${GREEN}✅ Phase 1 committed to git${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 2: ANALYZE CLOUD FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${PURPLE}"
echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 2: ANALYZE CLOUD FUNCTIONS FOR REDUNDANCY"
echo "═══════════════════════════════════════════════════════════════════════════"
echo -e "${NC}"

echo "🔍 Searching for references to IDIQAutoEnrollment..."
IDIQ_AUTO_REFS=$(grep -r "IDIQAutoEnrollment" functions/ src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
echo "   Found $IDIQ_AUTO_REFS reference(s)"

echo "🔍 Searching for references to idiqEnrollmentService..."
IDIQ_SERVICE_REFS=$(grep -r "idiqEnrollmentService" functions/ src/ --include="*.js" --include="*.jsx" 2>/dev/null | wc -l)
echo "   Found $IDIQ_SERVICE_REFS reference(s)"

echo ""

CF_DELETED=0

# Check IDIQAutoEnrollment.js
if [ -f "functions/IDIQAutoEnrollment.js" ]; then
  if [ $IDIQ_AUTO_REFS -eq 0 ]; then
    echo -e "${RED}❌ Deleting: functions/IDIQAutoEnrollment.js${NC}"
    echo "   Reason: UNUSED (0 references found)"
    git rm functions/IDIQAutoEnrollment.js
    echo -e "${GREEN}   ✅ Deleted${NC}"
    ((CF_DELETED++))
  else
    echo -e "${YELLOW}⚠️  KEEPING: functions/IDIQAutoEnrollment.js${NC}"
    echo "   Reason: Found $IDIQ_AUTO_REFS reference(s) - appears to be in use"
  fi
else
  echo -e "${YELLOW}   ⚠️  File not found: functions/IDIQAutoEnrollment.js${NC}"
fi

# Check idiqEnrollmentService.js
if [ -f "functions/idiqEnrollmentService.js" ]; then
  if [ $IDIQ_SERVICE_REFS -eq 0 ]; then
    echo -e "${RED}❌ Deleting: functions/idiqEnrollmentService.js${NC}"
    echo "   Reason: UNUSED (0 references found)"
    git rm functions/idiqEnrollmentService.js
    echo -e "${GREEN}   ✅ Deleted${NC}"
    ((CF_DELETED++))
  else
    echo -e "${YELLOW}⚠️  KEEPING: functions/idiqEnrollmentService.js${NC}"
    echo "   Reason: Found $IDIQ_SERVICE_REFS reference(s) - appears to be in use"
  fi
else
  echo -e "${YELLOW}   ⚠️  File not found: functions/idiqEnrollmentService.js${NC}"
fi

echo ""
echo -e "${GREEN}✅ Phase 2 Complete! Deleted $CF_DELETED unused Cloud Functions${NC}"
echo ""

# Commit Phase 2 if any files were deleted
if [ $CF_DELETED -gt 0 ]; then
  git add -A
  git commit -m "cleanup(phase2): Remove unused IDIQ Cloud Functions

- Removed unused Cloud Functions with 0 references
- Keeping enrollIDIQ.js (main enrollment with AI fraud detection)
- Keeping idiqEnrollmentProcessor.js (queue processor + webhooks)"
  echo -e "${GREEN}✅ Phase 2 committed to git${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# PHASE 3: COMPARE CREDIT REPORT COMPONENTS
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${PURPLE}"
echo "═══════════════════════════════════════════════════════════════════════════"
echo "PHASE 3: COMPARE CREDIT REPORT COMPONENTS"
echo "═══════════════════════════════════════════════════════════════════════════"
echo -e "${NC}"

FILE1="src/components/credit/ClientCreditReport.jsx"
FILE2="src/components/ClientCreditReports.jsx"

if [ -f "$FILE1" ] && [ -f "$FILE2" ]; then
  LINES1=$(wc -l < "$FILE1")
  LINES2=$(wc -l < "$FILE2")
  
  echo "📊 Comparing files:"
  echo "   File 1: $FILE1 ($LINES1 lines)"
  echo "   File 2: $FILE2 ($LINES2 lines)"
  echo ""
  
  # Check imports in File2 to see if it has bad imports
  BAD_IMPORTS=$(grep -c "from.*firebaseConfig\|from.*idiqProvider\|from.*openaiConfig" "$FILE2" || true)
  
  if [ $LINES1 -gt $LINES2 ]; then
    echo -e "${GREEN}🏆 WINNER: ClientCreditReport.jsx (more complete)${NC}"
    KEEP_FILE="$FILE1"
    DELETE_FILE="$FILE2"
  elif [ $LINES2 -gt $LINES1 ]; then
    if [ $BAD_IMPORTS -gt 0 ]; then
      echo -e "${YELLOW}⚠️  ClientCreditReports.jsx is larger BUT has obsolete imports${NC}"
      echo "   Recommendation: Keep ClientCreditReport.jsx (clean imports)"
      KEEP_FILE="$FILE1"
      DELETE_FILE="$FILE2"
    else
      echo -e "${GREEN}🏆 WINNER: ClientCreditReports.jsx (more complete)${NC}"
      KEEP_FILE="$FILE2"
      DELETE_FILE="$FILE1"
    fi
  else
    echo -e "${YELLOW}⚠️  Files are equal size - keeping ClientCreditReport.jsx (better location)${NC}"
    KEEP_FILE="$FILE1"
    DELETE_FILE="$FILE2"
  fi
  
  echo ""
  echo -e "${GREEN}✅ KEEPING: $KEEP_FILE${NC}"
  echo -e "${RED}❌ DELETING: $DELETE_FILE${NC}"
  
  read -p "Delete $DELETE_FILE? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git rm "$DELETE_FILE"
    echo -e "${GREEN}   ✅ Deleted${NC}"
    
    git add -A
    git commit -m "cleanup(phase3): Remove duplicate ClientCreditReports component

- Deleted duplicate credit report component
- Keeping most advanced version: $KEEP_FILE"
    echo -e "${GREEN}✅ Phase 3 committed to git${NC}"
  else
    echo -e "${YELLOW}   Skipped deletion (user choice)${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  One or both files not found - manual review needed${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${PURPLE}"
echo "═══════════════════════════════════════════════════════════════════════════"
echo "✅ CLEANUP COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════════"
echo -e "${NC}"

echo ""
echo -e "${GREEN}🎉 Summary:${NC}"
echo "   • Deleted $DELETED_COUNT duplicate/obsolete files"
echo "   • Deleted $CF_DELETED unused Cloud Functions"
echo "   • Compared and resolved credit report components"
echo ""
echo -e "${BLUE}📦 Backup:${NC}"
echo "   • Backup branch: $BACKUP_BRANCH"
echo "   • To rollback: git checkout $BACKUP_BRANCH"
echo ""
echo -e "${YELLOW}⚠️  Next Steps:${NC}"
echo "   1. Test the build: npm run dev"
echo "   2. Fix any import errors if they occur"
echo "   3. Deploy to production when ready"
echo ""
echo -e "${GREEN}No more Confusion, Conflicts, or Cussing! 🚀${NC}"
echo ""
