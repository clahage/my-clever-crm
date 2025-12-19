#!/bin/bash


# 1. Show git status
git status

# 2. Stage all changes
git add .

# 3. Install/update dependencies
npm install

# 4. Commit with a message (edit as needed)
git commit -m "Chore: Save, build, and deploy latest changes"

# 5. Push to main branch
git push origin main

# 6. Build the project
npm run build

# 7. Deploy locally (optional, comment out if not needed)
# firebase emulators:start --only hosting

# 8. Deploy to live Firebase Hosting
firebase deploy --only hosting

echo "✅ All done! Changes are live."


My saved phrase for Copilot:

Run all commands to stage, commit, push, install dependencies, build, and deploy locally and to live Firebase hosting for myclevercrm.com. Use a summary commit message.






BETTER COMMANDS


STEP-BY-STEP SAVE & DEPLOY PROCESS


STEP 1: Open Your Terminal 💻
Open Command Prompt or PowerShell in your project folder:

Navigate to: C:\my-clever-crm
Or right-click the folder → "Open in Terminal"


STEP 2: Git Commands 
bash# Check what files changed

a. git status

# Add all changes
b. git add .

# Commit with a descriptive message
c. git commit -m "🔧 Fix/Debug/replace/Test etc...: A brief or detailed message describe what stage or work you did with quotes as are here"

# Push to main branch
d. git push origin main

STEP 3: Test Locally First 🧪
bash# Start local dev server     npm run dev
npm run dev
Then open: http://localhost:5177/client-portal


Check that:

✅ Client Portal loads without errors
✅ All tabs work (Dashboard, Scores, Disputes, etc.)
✅ No console errors
✅ Navigation shows properly


STEP 4: Deploy to Production 🚀
Only after local testing works, deploy to https://myclevercrm.com:
bash# Build production version
npm run build

# Deploy to Firebase
firebase deploy --only hosting
Wait for deployment to complete (usually 1-2 minutes).

⚠️ IMPORTANT NOTES:

Always test locally first before deploying to production
If you see any errors during local testing, STOP and let me know before deploying
The git commit message I provided describes what was fixed (you can modify it if you want)


🔍 VERIFICATION CHECKLIST:
After deployment, check:

 https://myclevercrm.com/client-portal loads
 All tabs display content
 No JavaScript errors in browser console (F12)
 Navigation works smoothly