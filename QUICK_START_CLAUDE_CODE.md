# 🚀 QUICK START FOR CLAUDE CODE

## READ THESE FILES IN ORDER:

1. **PRODUCTION_CLEANUP_STATUS.md** - See what's already done (5 min read)
2. **CLAUDE_CODE_PROMPT.md** - Your mission brief (2 min read)
3. **CLAUDE_CODE_TASK.md** - Complete specifications (15 min read)

## YOUR TOP PRIORITIES:

### 🔥 PRIORITY 1: Critical Workflow Testing (MOST IMPORTANT)
Test these 3 workflows completely end-to-end:

**A. IDIQ → Dispute Workflow**
```
1. Create test prospect in system
2. Enroll in IDIQ (idiqService.js should work)
3. Pull credit report from IDIQ API
4. Open Dispute Hub
5. Verify negative items appear
6. Generate dispute letters with AI
7. Send via fax to bureaus (Telnyx)
8. Verify tracking updates
9. Check client portal shows disputes
```

**B. Email Campaign Workflow**
```
1. Open Communications Hub
2. Create campaign "Test Campaign"
3. Select audience (all contacts)
4. Design email (use template or create)
5. Add personalization tokens
6. Launch campaign
7. Monitor real-time stats (opens, clicks)
8. Verify automated follow-ups trigger
9. Export campaign results
```

**C. Multi-Channel Communication Test**
```
1. Send test email (SendGrid integration)
2. Send test fax (Telnyx integration)
3. Send test SMS (if configured)
4. Check unified inbox
5. Verify tracking data
```

### 🔥 PRIORITY 2: Remaining Sample Data Cleanup
Search for and remove any remaining fake data:
```powershell
Get-ChildItem -Path src/pages -Include *.jsx,*.js -Recurse | Select-String -Pattern "(John|Jane) (Smith|Doe)|Sarah (Johnson|Martinez)|555-\d{4}|test@test|mockData|sampleData" | Select-Object Path, LineNumber
```

Fix all files found.

### 🔥 PRIORITY 3: Critical Fixes
- [ ] Rename UltimateClientForm → UltimateContactForm
- [ ] Fix Reports Hub case-insensitive permissions
- [ ] Ensure all imports resolve correctly

### 🔥 PRIORITY 4: Build & Deploy
```powershell
cd c:/my-clever-crm
npm run build          # Must succeed with 0 errors
git add -A
git commit -m "Complete: Critical workflow testing, remaining cleanup, production ready"
git push origin main
firebase deploy
```

## ENVIRONMENT VARIABLES NEEDED

Verify these are configured (or create mock services):
```
VITE_SENDGRID_API_KEY - Email (SendGrid)
VITE_TELNYX_API_KEY - Fax (Telnyx)
VITE_IDIQ_API_ENDPOINT - Credit reports
VITE_IDIQ_PARTNER_ID - IDIQ partner ID
VITE_OPENAI_API_KEY - AI features
```

## YOUR DELIVERABLES

When complete, provide:

1. **Executive Summary** (2-3 paragraphs)
2. **Task Completion Summary** with ✅/⚠️ status
3. **Test Checklist** - Step-by-step instructions for user to verify each workflow
4. **Configuration Guide** - API setup instructions
5. **Known Issues** - Anything requiring external resources

## SUCCESS = ALL 3 WORKFLOWS WORK

The user's business depends on:
1. ✅ Dispute processing from IDIQ reports
2. ✅ Email/fax/SMS communication
3. ✅ Email campaign creation and tracking

If these 3 work end-to-end, you're 80% successful. Everything else is secondary.

## TIME ESTIMATE

- Reading documents: 20 minutes
- Workflow testing: 60-90 minutes
- Sample data cleanup: 30 minutes
- Critical fixes: 30 minutes
- Build & deploy: 15 minutes
- Documentation: 30 minutes

**Total: 3-4 hours for complete execution**

## BEGIN NOW

1. Read PRODUCTION_CLEANUP_STATUS.md
2. Focus on testing the 3 critical workflows
3. Fix any issues you encounter
4. Complete remaining cleanup
5. Build and deploy
6. Document everything

**You have full authority. Execute with confidence.** 🚀
