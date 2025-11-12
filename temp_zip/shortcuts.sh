#!/bin/bash
# SpeedyCRM Project Shortcuts
# Usage: source shortcuts.sh (or . shortcuts.sh)

# Project navigation
alias speedycrm='cd "/c/SCR Project/my-clever-crm"'
alias speedyfunc='cd "/c/SCR Project/my-clever-crm/functions"'
alias speedysrc='cd "/c/SCR Project/my-clever-crm/src"'

# Firebase shortcuts
alias fb-deploy='firebase deploy --only functions'
alias fb-logs='firebase functions:log'
alias fb-config='firebase functions:config:get'
alias fb-use='firebase use my-clever-crm'
alias fb-login='firebase login --reauth'

# Git shortcuts
alias gs='git status'
alias ga='git add .'
alias gc='git commit -m'
alias gp='git push origin main'
alias gl='git pull'

# Quick commit (usage: qcommit "your message")
qcommit() {
    git add . && git commit -m "$1" && git push origin main
}

# Firebase function deployment with specific function
fb-deploy-func() {
    firebase deploy --only functions:$1
}

echo "SpeedyCRM shortcuts loaded!"
echo "Available commands:"
echo "  speedycrm, speedyfunc, speedysrc"
echo "  fb-deploy, fb-logs, fb-config, fb-use, fb-login"
echo "  gs, ga, gc, gp, gl"
echo "  qcommit 'message', fb-deploy-func functionName"