# SpeedyCRM Workflow Testing Checklist
## Complete End-to-End Testing Guide for Christopher

**Last Updated:** November 27, 2025
**Version:** 1.0.0

---

## Pre-Test Setup

### Environment Verification
- [ ] Dev server running (`npm run dev`)
- [ ] No console errors on page load
- [ ] Firebase connection working (check Network tab)
- [ ] User logged in with admin privileges
- [ ] Browser DevTools open for monitoring

### API Configuration
- [ ] Gmail SMTP credentials configured in `.env`
- [ ] OpenAI API key valid
- [ ] IDIQ Partner credentials (11981) confirmed with Jordan
- [ ] Telnyx API key configured (optional for initial testing)

### Firebase Functions
- [ ] All functions deployed (`firebase deploy --only functions`)
- [ ] Functions show "Healthy" in Firebase Console
- [ ] No deployment errors in logs

---

## Workflow Stage Tests

### Test 1: Contact Entry
**Access:** Navigate to `/workflow-orchestrator`

**Steps:**
1. [ ] Open Workflow Orchestrator
2. [ ] Fill in test contact:
   - First Name: Test
   - Last Name: User
   - Email: test@speedycreditrepair.com
   - Phone: (555) 123-4567
3. [ ] Click "Start Workflow"
4. [ ] Verify contact created in Firestore

**Expected Results:**
- [ ] Contact appears in `contacts` collection
- [ ] Status shows "new"
- [ ] Roles array includes "contact"
- [ ] Workflow execution record created
- [ ] Log shows "Contact created successfully"

**Firestore Verification:**
```
Collection: contacts
Document Fields:
- firstName: "Test"
- lastName: "User"
- email: "test@speedycreditrepair.com"
- status: "new"
- roles: ["contact"]
- workflowId: [workflow-id]
- createdAt: [timestamp]
```

---

### Test 2: Welcome Email
**Expected:** Email sent from welcome@speedycreditrepair.com

**Steps:**
1. [ ] Watch workflow progress to stage 2
2. [ ] Check execution logs for "Sending welcome email"
3. [ ] Verify `welcomeEmailSentAt` field added to contact

**Test Mode (Default):**
- [ ] Log shows "Test mode: Welcome email simulated"
- [ ] No actual email sent

**Real Email Mode (Enable in Settings):**
- [ ] Check inbox for welcome email
- [ ] Verify "From" address: welcome@speedycreditrepair.com
- [ ] Verify subject includes first name
- [ ] Verify portal link works

**Expected Results:**
- [ ] Contact updated with `welcomeEmailSentAt`
- [ ] Stage marked complete
- [ ] No errors in log

---

### Test 3: Lead Qualification
**Expected:** AI-calculated lead score 1-10

**Steps:**
1. [ ] Watch workflow progress to stage 3
2. [ ] Verify lead score calculated based on:
   - Valid email (+1)
   - Phone provided (+1)
   - SSN provided (+2)
   - Complete address (+1)

**Expected Results:**
- [ ] `leadScore` field: 5-10 (depending on data)
- [ ] `leadQualification`: "hot", "warm", or "cold"
- [ ] `leadFactors` array lists scoring reasons
- [ ] Status changes to "lead"
- [ ] Roles array includes "lead"

**Score Interpretation:**
- 7-10: Hot lead
- 5-6: Warm lead
- 1-4: Cold lead

---

### Test 4: IDIQ Credit Report Retrieval
**Expected:** Credit report data stored

**Test Mode (Default - Simulated):**
1. [ ] Watch workflow progress to stage 4
2. [ ] Verify simulated scores generated:
   - Experian: ~520-700
   - Equifax: ~520-700
   - TransUnion: ~520-700
3. [ ] Verify negative accounts array created
4. [ ] Log shows "Test mode: Using simulated credit data"

**Real IDIQ Mode (Requires Jordan's endpoint):**
1. [ ] Enable "Use Real IDIQ" in settings
2. [ ] Verify token endpoint responds
3. [ ] Verify credit data from IDIQ API

**Expected Results:**
- [ ] `idiqEnrollments` document created
- [ ] Contact updated with `idiqEnrollmentId`
- [ ] Contact updated with `creditScores` object
- [ ] Negative accounts stored

**Firestore Verification:**
```
Collection: idiqEnrollments
Document Fields:
- contactId: [contact-id]
- workflowId: [workflow-id]
- scores: { experian: xxx, equifax: xxx, transunion: xxx }
- negativeAccounts: [array]
- isSimulated: true/false
- retrievedAt: [timestamp]
```

---

### Test 5: AI Credit Analysis
**Expected:** OpenAI GPT-4 analysis

**Steps:**
1. [ ] Watch workflow progress to stage 5
2. [ ] Verify OpenAI API called (check logs)
3. [ ] Verify analysis summary generated

**Expected Results:**
- [ ] `aiReviewSummary`: Text summary of credit status
- [ ] `aiKeyIssues`: Array of identified problems
- [ ] `aiRiskLevel`: "high", "medium", or "low"
- [ ] `aiProjectedImprovement` object with timeline

**Sample Output:**
```
aiKeyIssues: [
  "Multiple collection accounts affecting score",
  "Late payment history on revolving accounts",
  "High credit utilization ratio"
]
```

---

### Test 6: Service Plan Recommendation
**Expected:** AI-recommended service plan

**Steps:**
1. [ ] Watch workflow progress to stage 6
2. [ ] Verify plan recommendation based on score/issues

**Plan Selection Logic:**
- Score < 500 OR >20 negatives: Premium ($299/mo)
- Score < 600 OR >10 negatives: Acceleration ($199/mo)
- Score < 680 OR >5 negatives: Standard ($149/mo)
- Few negatives: Pay-for-Delete ($149/removal)
- Minor issues: DIY ($99/mo)

**Expected Results:**
- [ ] `aiRecommendedPlans` array with plan ID
- [ ] `recommendedPlanReasoning` explains choice
- [ ] `estimatedMonthlyFee` set
- [ ] `estimatedSetupFee` set

---

### Test 7: Contract Generation
**Expected:** Service Agreement, POA, ACH created

**Steps:**
1. [ ] Watch workflow progress to stage 7
2. [ ] Verify contracts collection document created

**Expected Results:**
- [ ] `contracts` document created
- [ ] `contractId` added to contact
- [ ] `documents` object includes:
  - serviceAgreement: { status: "pending" }
  - powerOfAttorney: { status: "pending" }
  - achAuthorization: { status: "pending" }
- [ ] Status: "pending_signature"

---

### Test 8: E-Signature
**Expected:** Contract signed and client activated

**Test Mode (Auto-sign enabled):**
1. [ ] Enable "Skip Manual Stages" in settings
2. [ ] Contracts automatically signed

**Manual Mode:**
1. [ ] Workflow pauses at e-signature stage
2. [ ] Click "Advance to Next Stage" after signing

**Expected Results:**
- [ ] Contract status: "signed"
- [ ] `signedAt` timestamp added
- [ ] All documents status: "signed"

---

### Test 9: Client Activation
**Expected:** Contact becomes active client

**Steps:**
1. [ ] Watch workflow progress to stage 9
2. [ ] Verify contact updated

**Expected Results:**
- [ ] Status: "active"
- [ ] Roles includes "client"
- [ ] `activatedAt` timestamp
- [ ] `clientNumber` assigned (SCR-xxxxxxxx)
- [ ] Activation email sent (if enabled)

---

### Test 10: Dispute Letter Generation
**Expected:** Dispute letters created for all negative items

**Steps:**
1. [ ] Watch workflow progress to stage 10
2. [ ] Verify disputes collection created

**Expected Results:**
- [ ] `disputes` document created
- [ ] `disputeBatchId` added to contact
- [ ] Bureaus: ["experian", "equifax", "transunion"]
- [ ] Item count matches negative accounts

---

### Test 11: Fax Dispatch
**Expected:** Faxes sent to 3 credit bureaus

**Test Mode (Simulated):**
1. [ ] Watch workflow progress to stage 11
2. [ ] Verify fax logs created

**Real Fax Mode (Requires Telnyx):**
1. [ ] Enable "Send Real Faxes" in settings
2. [ ] Verify Telnyx API calls

**Expected Results:**
- [ ] `faxLogs` collection has 3 documents (one per bureau)
- [ ] Each log includes:
  - bureau: experian/equifax/transunion
  - faxNumber: Bureau fax number
  - status: "sent" or "simulated"
  - telnyxFaxId (if real)

**Bureau Fax Numbers:**
- Experian: +1-800-493-1058
- Equifax: +1-888-640-9580
- TransUnion: +1-800-916-7800

---

### Test 12: Workflow Completion
**Expected:** Workflow finalized, monthly updates scheduled

**Steps:**
1. [ ] Watch workflow progress to stage 12
2. [ ] Verify completion status

**Expected Results:**
- [ ] Workflow status: "completed"
- [ ] `completedAt` timestamp
- [ ] `duration` calculated (minutes)
- [ ] Contact `workflowStatus`: "completed"
- [ ] Contact `nextMonthlyUpdateAt`: 30 days from now
- [ ] Completion email sent (if enabled)

---

## Workflow Tester Dashboard

**Access:** Navigate to `/workflow-testing`

### Infrastructure Tests
- [ ] Firestore Connection - Read/write test
- [ ] Authentication - Auth check

### Workflow Tests
- [ ] Contact Creation - Create/verify/delete
- [ ] Welcome Email - Email template test
- [ ] Lead Scoring - Score calculation
- [ ] Contract Generation - Document creation
- [ ] Dispute Generation - Batch creation

### Integration Tests
- [ ] IDIQ API - Token endpoint
- [ ] OpenAI API - AI completion
- [ ] Telnyx API - Fax endpoint
- [ ] Email Sending - SMTP test

### Full E2E Test
- [ ] Run all stages in sequence
- [ ] All stages pass
- [ ] Total duration < 90 seconds

---

## Error Handling Tests

### Invalid Data Tests
- [ ] Missing first name - Should show error
- [ ] Missing email - Should show error
- [ ] Invalid email format - Should show error

### API Failure Tests
- [ ] OpenAI timeout - Should use fallback analysis
- [ ] IDIQ API error - Should use simulated data
- [ ] Email send failure - Should continue workflow

### Recovery Tests
- [ ] Pause workflow - Should save state
- [ ] Resume workflow - Should continue from pause
- [ ] Retry failed stage - Should attempt recovery

---

## Performance Benchmarks

### Target Durations
| Stage | Target | Max |
|-------|--------|-----|
| Contact Entry | 2s | 5s |
| Welcome Email | 5s | 15s |
| Lead Qualification | 3s | 10s |
| IDIQ Retrieval | 10s | 30s |
| AI Analysis | 15s | 45s |
| Service Recommendation | 5s | 15s |
| Contract Generation | 5s | 15s |
| E-Signature | N/A | N/A |
| Client Activation | 2s | 5s |
| Dispute Generation | 10s | 30s |
| Fax Dispatch | 10s | 30s |
| Workflow Complete | 2s | 5s |
| **TOTAL** | **70s** | **210s** |

---

## Post-Test Cleanup

### Test Data Removal
- [ ] Delete test contacts from Firestore
- [ ] Delete test workflow executions
- [ ] Delete test disputes
- [ ] Delete test contracts
- [ ] Delete test fax logs

### Settings Reset
- [ ] Disable "Skip Manual Stages"
- [ ] Disable "Send Real Emails" (unless production)
- [ ] Disable "Send Real Faxes" (unless production)

---

## Troubleshooting

### Common Issues

**"Cannot find module" Error**
- Run `npm install`
- Check import paths

**"Permission Denied" on Firestore**
- Check Firebase authentication
- Verify Firestore rules

**Email Not Sending**
- Check Gmail App Password
- Verify SMTP configuration
- Check spam folder

**IDIQ API Failing**
- Confirm credentials with Jordan
- Check token endpoint URL
- Verify partner ID (11981)

**OpenAI Timeout**
- Check API key validity
- Increase timeout value
- Monitor rate limits

---

## Sign-Off

**Tested By:** ___________________

**Date:** ___________________

**Environment:** [ ] Development [ ] Staging [ ] Production

**All Tests Passed:** [ ] Yes [ ] No (See notes)

**Notes:**
```


```

---

*This checklist is part of the SpeedyCRM workflow documentation. For support, contact support@speedycreditrepair.com*
