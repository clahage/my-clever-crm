#!/bin/bash
# ============================================================================
# SpeedyCRM Hub Audit Script
# ============================================================================
# Run from project root: bash hub-audit.sh
# Scans ALL hub files for placeholder tabs, static data, unwired features
# ============================================================================

echo "============================================================"
echo "  SpeedyCRM Hub Audit - Checking All Hubs for Placeholders"
echo "============================================================"
echo ""

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
TOTAL_HUBS=0
TOTAL_ISSUES=0
TOTAL_TABS=0

# Find all hub files
echo "Finding all Hub files..."
echo ""

HUB_FILES=$(find src -name "*Hub*.jsx" -o -name "*Hub*.tsx" 2>/dev/null | sort)

if [ -z "$HUB_FILES" ]; then
  echo -e "${RED}No Hub files found!${NC}"
  exit 1
fi

for file in $HUB_FILES; do
  TOTAL_HUBS=$((TOTAL_HUBS + 1))
  LINES=$(wc -l < "$file")
  FILE_ISSUES=0
  
  echo "============================================================"
  echo -e "${CYAN}HUB: $file${NC} ($LINES lines)"
  echo "============================================================"
  
  # Count tabs
  TAB_COUNT=$(grep -c '<Tab ' "$file" 2>/dev/null || echo 0)
  TAB_RENDER_COUNT=$(grep -c 'activeTab ===' "$file" 2>/dev/null || echo 0)
  TOTAL_TABS=$((TOTAL_TABS + TAB_COUNT))
  
  echo "  Tabs declared: $TAB_COUNT"
  echo "  Tab renders: $TAB_RENDER_COUNT"
  
  if [ "$TAB_COUNT" -gt 0 ] && [ "$TAB_RENDER_COUNT" -lt "$TAB_COUNT" ]; then
    echo -e "  ${RED}⚠️  MISMATCH: $TAB_COUNT tabs declared but only $TAB_RENDER_COUNT rendered!${NC}"
    FILE_ISSUES=$((FILE_ISSUES + 1))
  fi

  # Check for static/mock data arrays (hardcoded objects that look like fake data)
  STATIC_ARRAYS=$(grep -n "const.*=.*\[" "$file" 2>/dev/null | grep -i "data\|items\|list\|mock\|sample\|test\|fake\|demo" | head -5)
  if [ -n "$STATIC_ARRAYS" ]; then
    echo -e "  ${YELLOW}⚠️  Possible static data arrays:${NC}"
    echo "$STATIC_ARRAYS" | while read line; do echo "     $line"; done
    FILE_ISSUES=$((FILE_ISSUES + 1))
  fi
  
  # Check for "Coming Soon" / "Placeholder" / "TODO" / "implement later"
  PLACEHOLDERS=$(grep -ni "coming soon\|placeholder\|todo\b\|fixme\|implement later\|not yet\|stub\|will be implemented\|TBD\b\|work in progress\|WIP\b" "$file" 2>/dev/null | head -10)
  if [ -n "$PLACEHOLDERS" ]; then
    echo -e "  ${RED}🔴 PLACEHOLDER/TODO content found:${NC}"
    echo "$PLACEHOLDERS" | while read line; do echo "     $line"; done
    FILE_ISSUES=$((FILE_ISSUES + 1))
  fi
  
  # Check for hardcoded fake values visible to users
  FAKE_VALUES=$(grep -n "John Doe\|Jane Doe\|test@\|example@\|555-\|Lorem\|ipsum\|fake\|Sample Client\|Test User\|demo@\|foo@\|bar@" "$file" 2>/dev/null | grep -v "//\|placeholder=" | head -5)
  if [ -n "$FAKE_VALUES" ]; then
    echo -e "  ${RED}🔴 FAKE DATA found (visible to users):${NC}"
    echo "$FAKE_VALUES" | while read line; do echo "     $line"; done
    FILE_ISSUES=$((FILE_ISSUES + 1))
  fi

  # Check for Firebase integration
  HAS_FIREBASE=$(grep -c "collection\|getDocs\|onSnapshot\|addDoc\|updateDoc\|setDoc" "$file" 2>/dev/null || echo 0)
  HAS_USEEFFECT=$(grep -c "useEffect" "$file" 2>/dev/null || echo 0)
  
  if [ "$HAS_FIREBASE" -eq 0 ]; then
    echo -e "  ${YELLOW}⚠️  NO Firebase integration (0 Firestore calls)${NC}"
    FILE_ISSUES=$((FILE_ISSUES + 1))
  else
    echo -e "  ${GREEN}✅ Firebase: $HAS_FIREBASE Firestore operations${NC}"
  fi
  
  # Check for empty render functions (stub tabs)
  EMPTY_RENDERS=$(grep -n "render.*Tab.*=.*() =>" "$file" 2>/dev/null | while read line; do
    LINE_NUM=$(echo "$line" | cut -d: -f1)
    # Check if the function body is very short (< 20 lines)
    NEXT_FUNC=$(awk "NR>$LINE_NUM && /render.*Tab|const.*Tab|function.*Tab/{print NR; exit}" "$file" 2>/dev/null)
    if [ -n "$NEXT_FUNC" ]; then
      BODY_SIZE=$((NEXT_FUNC - LINE_NUM))
      if [ "$BODY_SIZE" -lt 15 ]; then
        echo "     Line $LINE_NUM: ~${BODY_SIZE} lines (possibly placeholder)"
      fi
    fi
  done)
  if [ -n "$EMPTY_RENDERS" ]; then
    echo -e "  ${YELLOW}⚠️  Possibly stub/placeholder tab renders:${NC}"
    echo "$EMPTY_RENDERS"
    FILE_ISSUES=$((FILE_ISSUES + 1))
  fi

  # Check for short tab render functions (under 20 lines suggests placeholder)
  # Look for function components used as tabs that are very short
  STUB_COMPONENTS=$(grep -n "^function.*Tab\|^const.*Tab.*=" "$file" 2>/dev/null | head -20)
  
  # Check for hardcoded numbers that look like mock stats
  MOCK_STATS=$(grep -n "value.*['\"].*[0-9][0-9][0-9].*['\"]\|{.*['\"].*\$[0-9].*['\"]" "$file" 2>/dev/null | grep -v "//\|color\|size\|width\|height\|max\|min\|sx=\|px\|rem\|em\|zIndex\|duration\|delay\|elevation\|fontSize\|spacing\|timeout" | head -5)
  if [ -n "$MOCK_STATS" ]; then
    echo -e "  ${YELLOW}⚠️  Possibly hardcoded stat values (should come from Firebase):${NC}"
    echo "$MOCK_STATS" | while read line; do echo "     $line"; done
    FILE_ISSUES=$((FILE_ISSUES + 1))
  fi
  
  # Check for useState with hardcoded initial data (not empty)
  HARDCODED_STATE=$(grep -n "useState(\[{" "$file" 2>/dev/null | head -5)
  if [ -n "$HARDCODED_STATE" ]; then
    echo -e "  ${RED}🔴 useState initialized with hardcoded objects (likely mock data):${NC}"
    echo "$HARDCODED_STATE" | while read line; do echo "     $line"; done
    FILE_ISSUES=$((FILE_ISSUES + 1))
  fi
  
  # Check for empty state messages (good practice)
  EMPTY_STATES=$(grep -c "No.*yet\|No.*found\|empty\|Get started\|No data\|will appear\|Create.*first" "$file" 2>/dev/null || echo 0)
  if [ "$EMPTY_STATES" -gt 0 ]; then
    echo -e "  ${GREEN}✅ Empty states: $EMPTY_STATES clean empty-state messages${NC}"
  fi

  # Auth import check
  AUTH_IMPORT=$(grep -c "useAuth\|AuthContext" "$file" 2>/dev/null || echo 0)
  if [ "$AUTH_IMPORT" -eq 0 ]; then
    echo -e "  ${YELLOW}⚠️  No auth import (may not need it, but check)${NC}"
  fi
  
  # Check auth import path
  BAD_AUTH=$(grep "authContext\|@/authcontext\|from.*authContext" "$file" 2>/dev/null | grep -iv "AuthContext" | head -3)
  if [ -n "$BAD_AUTH" ]; then
    echo -e "  ${RED}🔴 Wrong auth import path (should be @/contexts/AuthContext):${NC}"
    echo "$BAD_AUTH" | while read line; do echo "     $line"; done
    FILE_ISSUES=$((FILE_ISSUES + 1))
  fi

  # Summary for this hub
  if [ "$FILE_ISSUES" -eq 0 ]; then
    echo -e "  ${GREEN}✅ CLEAN - No issues found${NC}"
  else
    echo -e "  ${RED}Found $FILE_ISSUES potential issue(s)${NC}"
    TOTAL_ISSUES=$((TOTAL_ISSUES + FILE_ISSUES))
  fi
  echo ""
done

# ============================================================
# FINAL SUMMARY
# ============================================================
echo "============================================================"
echo "  FINAL SUMMARY"
echo "============================================================"
echo ""
echo "  Total Hubs scanned: $TOTAL_HUBS"
echo "  Total Tabs found: $TOTAL_TABS"
echo "  Total Issues: $TOTAL_ISSUES"
echo ""

if [ "$TOTAL_ISSUES" -eq 0 ]; then
  echo -e "  ${GREEN}🎉 ALL HUBS CLEAN - Ready for production!${NC}"
else
  echo -e "  ${YELLOW}⚠️  $TOTAL_ISSUES issues found - review above for details${NC}"
fi

echo ""
echo "============================================================"
echo "  Tip: Paste this output to Claude for analysis & fixes"
echo "============================================================"