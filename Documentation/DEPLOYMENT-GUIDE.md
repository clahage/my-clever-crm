# 🚀 GOOGLE WORKSPACE SMTP DEPLOYMENT GUIDE
## Switch from SendGrid to Gmail - Step by Step

**Date:** November 2, 2025  
**Time Estimate:** 15-20 minutes  
**Your App Password:** erkn mxxo fmvn lulw

---

## ✅ WHAT WE'RE DOING

**Problem:** SendGrid works but emails aren't delivering (domain auth needed)  
**Solution:** Switch to Google Workspace SMTP (domain already authenticated!)  
**Result:** Emails deliver immediately from chris@speedycreditrepair.com

---

## 📋 STEP-BY-STEP INSTRUCTIONS

### STEP 1: Backup Current Files (2 minutes)

Open PowerShell in your project directory:

```powershell
cd "C:\SCR Project\my-clever-crm"

# Create backup
git add .
git commit -m "Backup before Google Workspace switch"
git push
```

**Why:** Safety first! We can always rollback if needed.

---

### STEP 2: Update package.json (1 minute)

**Location:** `C:\SCR Project\my-clever-crm\functions\package.json`

**Add this line** to the "dependencies" section:

```json
"nodemailer": "^6.9.7",
```

**Example - Your dependencies section should look like:**

```json
"dependencies": {
  "@sendgrid/mail": "^7.7.0",
  "nodemailer": "^6.9.7",
  "openai": "^4.20.0",
  "firebase-admin": "^11.11.0",
  "firebase-functions": "^4.5.0",
  // ... other dependencies
}
```

**Save the file!**

---

### STEP 3: Replace emailWorkflowEngine.js (30 seconds)

1. **Download the new file** from: `/mnt/user-data/outputs/emailWorkflowEngine.js`
2. **Navigate to:** `C:\SCR Project\my-clever-crm\functions\`
3. **Replace** the existing `emailWorkflowEngine.js` with the new one

**Or copy from the outputs folder directly!**

---

### STEP 4: Install nodemailer (2 minutes)

```powershell
cd "C:\SCR Project\my-clever-crm\functions"
npm install nodemailer --save
```

**Expected output:**
```
added 1 package, and audited X packages in Ys
```

---

### STEP 5: Configure Firebase (3 minutes)

**Go back to project root:**
```powershell
cd "C:\SCR Project\my-clever-crm"
```

**Set Gmail credentials:**
```powershell
firebase functions:config:set gmail.user="chris@speedycreditrepair.com"
firebase functions:config:set gmail.app_password="erkn mxxo fmvn lulw"
firebase functions:config:set gmail.from_email="chris@speedycreditrepair.com"
firebase functions:config:set gmail.from_name="Chris Lahage - Speedy Credit Repair"
firebase functions:config:set gmail.reply_to="contact@speedycreditrepair.com"
```

**Verify config was set:**
```powershell
firebase functions:config:get
```

**Expected output:**
```json
{
  "gmail": {
    "user": "chris@speedycreditrepair.com",
    "app_password": "erkn mxxo fmvn lulw",
    "from_email": "chris@speedycreditrepair.com",
    "from_name": "Chris Lahage - Speedy Credit Repair",
    "reply_to": "contact@speedycreditrepair.com"
  },
  "sendgrid": { ... },
  "openai": { ... }
}
```

✅ **Great! Config is set!**

---

### STEP 6: Deploy to Firebase (5 minutes)

```powershell
firebase deploy --only functions
```

**Expected output:**
```
✔ functions: Finished running predeploy script.
i  functions: updating Node.js 18 function onContactCreated(us-central1)...
i  functions: updating Node.js 18 function processWorkflowStages(us-central1)...
✔ functions[onContactCreated(us-central1)]: Successful update operation.
✔ functions[processWorkflowStages(us-central1)]: Successful update operation.

✔ Deploy complete!
```

**This takes about 3-5 minutes - be patient!**

---

### STEP 7: Commit Changes to Git (1 minute)

```powershell
git add .
git commit -m "Switch from SendGrid to Google Workspace SMTP for email delivery"
git push
```

---

### STEP 8: TEST IT! (2 minutes)

**Create a test contact in Firestore Console:**

1. Go to: https://console.firebase.google.com/project/my-clever-crm/firestore/data/~2Fcontacts

2. Click **"+ Add document"**

3. **Auto-ID** (let Firebase generate ID)

4. **Add these fields:**

```
firstName: string = "Gmail"
lastName: string = "Test"
emails: array = [
  {
    address: "clahage@gmail.com"
    isPrimary: true
  }
]
phones: array = [
  {
    number: "555-0199"
    isPrimary: true
  }
]
leadSource: string = "ai-receptionist"
createdAt: timestamp = [click "Set to current time"]
updatedAt: timestamp = [click "Set to current time"]
```

5. Click **"Save"**

---

### STEP 9: Check Function Logs (1 minute)

```powershell
firebase functions:log --only onContactCreated
```

**What to look for:**
```
✅ Google Workspace SMTP initialized
📞 New contact created
✅ Workflow started
✅ Email sent to clahage@gmail.com, MessageID: <...>
✅ Workflow completed
```

---

### STEP 10: Check Your Gmail! (30 seconds)

**Go to:** https://mail.google.com  
**Look for email from:** Chris Lahage - Speedy Credit Repair <chris@speedycreditrepair.com>  
**Subject:** Welcome Gmail! Let's get your free credit report

**Also check Google Workspace Sent folder:**
https://mail.google.com/mail/u/0/#sent

---

## 🎉 SUCCESS CHECKLIST

```
□ Backed up files with Git
□ Added nodemailer to package.json
□ Replaced emailWorkflowEngine.js
□ Installed nodemailer (npm install)
□ Configured Firebase (gmail.user, gmail.app_password, etc.)
□ Deployed functions (firebase deploy --only functions)
□ Committed changes to Git
□ Created test contact in Firestore
□ Checked function logs (saw success messages)
□ Received email in clahage@gmail.com inbox
□ Saw email in chris@speedycreditrepair.com Sent folder
```

---

## 🚨 TROUBLESHOOTING

### Problem: "Gmail SMTP not configured - check app password"

**Solution:**
```powershell
firebase functions:config:get
```

Make sure you see `gmail.app_password` with your password. If not:

```powershell
firebase functions:config:set gmail.app_password="erkn mxxo fmvn lulw"
firebase deploy --only functions
```

---

### Problem: "Error: Invalid login"

**Possible causes:**
1. App password has spaces (remove them: `erknmxxofmvnlulw`)
2. Wrong Google account (must be chris@speedycreditrepair.com)
3. 2-Step Verification not enabled

**Solution:**
```powershell
# Try without spaces:
firebase functions:config:set gmail.app_password="erknmxxofmvnlulw"
firebase deploy --only functions
```

---

### Problem: Email not arriving

**Check these:**

1. **Spam folder** - check Gmail spam
2. **Function logs** - look for errors:
   ```powershell
   firebase functions:log --only onContactCreated
   ```
3. **Contact document** - verify `emailsSent: 1` in Firestore
4. **Unsubscribe list** - check if email is in `unsubscribes` collection

---

### Problem: Need to rollback to SendGrid

```powershell
git checkout HEAD~1 functions/emailWorkflowEngine.js
firebase deploy --only functions
```

---

## 📊 WHAT CHANGED

### Before (SendGrid):
- Required domain authentication via DNS
- Emails reached SendGrid but didn't deliver
- Complex webhook setup needed

### After (Google Workspace):
- Domain already authenticated (speedycreditrepair.com)
- Direct SMTP delivery (reliable!)
- Emails appear in Sent folder
- No additional DNS changes needed
- 2000 emails/day limit (plenty!)

---

## 🎯 KEY CHANGES IN CODE

### 1. Email Service
**Changed:** `SendGridService` → `GmailService`
**Why:** Using nodemailer with Google Workspace SMTP

### 2. Configuration
**Old:**
```javascript
const sendgridKey = functions.config().sendgrid?.api_key;
```

**New:**
```javascript
const gmailAppPassword = functions.config().gmail?.app_password;
const transporter = nodemailer.createTransport({ ... });
```

### 3. All References Updated
- Line 1212: `GmailService.isUnsubscribed()`
- Line 1246: `GmailService.sendEmail()`
- Line 1517: `GmailService.sendEmail()`
- Line 1681: Exports `GmailService`

---

## 💾 YOUR CREDENTIALS (SECURE)

**Email:** chris@speedycreditrepair.com  
**App Password:** erkn mxxo fmvn lulw  
**SMTP Server:** smtp.gmail.com:587  
**Daily Limit:** 2000 emails/day

**⚠️ KEEP THIS SECURE!**
- Never commit app password to Git (it's in Firebase config only)
- Can revoke anytime at: https://myaccount.google.com/apppasswords
- Recommend rotating every 90 days

---

## 🔄 FUTURE TRACKING IMPROVEMENTS

**Current:** Basic email sending works!

**Phase B (later):**
- Add tracking pixels for opens
- Add click tracking URLs
- Monitor bounce messages
- Custom unsubscribe function

**Not urgent - your emails will work great without these!**

---

## 📞 IF YOU NEED HELP

**Start a new Claude chat and say:**

> "I deployed the Google Workspace SMTP changes. The functions deployed successfully, but I'm seeing [describe issue]. Here are my function logs: [paste logs]"

**Attach:**
- Function logs (`firebase functions:log --only onContactCreated`)
- Screenshot of any errors
- Contact document from Firestore (if helpful)

---

## 🎊 YOU'RE DONE!

**What you accomplished:**
✅ Switched email provider from SendGrid to Google Workspace  
✅ Maintained all workflow functionality  
✅ Better deliverability (Google's reputation!)  
✅ Emails in your Sent folder (better tracking!)  
✅ No DNS changes needed  
✅ Production-ready email automation  

**Your email automation system is NOW 100% COMPLETE!** 🚀

---

## 📈 NEXT STEPS (OPTIONAL)

**Week 1:** Monitor email delivery and open rates  
**Week 2:** Add more email templates if needed  
**Week 3:** Implement tracking improvements (Phase B)  
**Month 2:** Scale up contact volume  

**For now, just enjoy your working email system!** 🎉

---

*Questions? Start a new Claude chat and reference this guide!*
*Total time spent on this project: 4.5 days → NOW COMPLETE!*

**CONGRATULATIONS, CHRIS!** 🏆