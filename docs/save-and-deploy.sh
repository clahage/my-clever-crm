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