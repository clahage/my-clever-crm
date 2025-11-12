# My Clever CRM - Deployment Plan for myclevercrm.com

**Target Domain**: myclevercrm.com
**Project**: My Clever CRM
**Environment**: Production
**Last Updated**: November 11, 2025

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Third-Party Service Configuration](#third-party-service-configuration)
4. [Database Setup](#database-setup)
5. [Build & Deploy](#build--deploy)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Plan](#rollback-plan)

---

## Pre-Deployment Checklist

### ✅ Code Readiness

- [x] All hub routes added and tested
- [x] Critical bugs fixed
- [x] Code organized and clean
- [x] Changes committed to repository
- [ ] All tests passing (run `npm test`)
- [ ] Build successful (run `npm run build`)
- [ ] No console errors in development

### 📋 Accounts & Services Needed

Before deployment, ensure you have accounts for:

- [ ] **Firebase** (already have - for database & auth)
- [ ] **Stripe** (for payments) - https://stripe.com
- [ ] **IDIQ** (for credit reports) - Contact IDIQ sales
- [ ] **OpenAI** (for AI features) - https://platform.openai.com
- [ ] **Twilio** (for SMS) - https://www.twilio.com
- [ ] **SendGrid** (for email) - https://sendgrid.com
- [ ] **Domain Registrar** (for myclevercrm.com) - if not already owned
- [ ] **Hosting Provider** (Firebase Hosting, Vercel, or Netlify recommended)

### 🔑 API Keys to Obtain

Create a secure document (use password manager) to store:

```
FIREBASE (Already have)
- API Key
- Auth Domain
- Project ID
- Storage Bucket
- Messaging Sender ID
- App ID

STRIPE
- Public Key (pk_live_...)
- Secret Key (sk_live_...)
- Webhook Secret (whsec_...)

IDIQ
- API Key
- Account ID

OPENAI
- API Key (sk-...)

TWILIO
- Account SID (AC...)
- Auth Token
- Phone Number

SENDGRID
- API Key (SG....)
```

---

## Environment Setup

### Step 1: Clone Repository (If Deploying to New Server)

```bash
git clone https://github.com/[your-username]/my-clever-crm.git
cd my-clever-crm
git checkout claude/organize-enhance-crm-complete-011CV1PMCcoA7EjYJfegz2Yt
```

### Step 2: Install Dependencies

```bash
npm install
```

**Expected Time**: 2-5 minutes

### Step 3: Create Production Environment File

Create `.env.production` file in root directory:

```bash
# Create production environment file
touch .env.production
```

Add the following (replace with your actual keys):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Stripe (Payment Processing)
VITE_STRIPE_PUBLIC_KEY=pk_live_your_public_key
VITE_STRIPE_SECRET_KEY=sk_live_your_secret_key

# IDIQ (Credit Monitoring)
VITE_IDIQ_API_KEY=your_idiq_api_key
VITE_IDIQ_ACCOUNT_ID=your_idiq_account_id

# OpenAI (AI Features)
VITE_OPENAI_API_KEY=sk-your_openai_key

# Twilio (SMS)
VITE_TWILIO_ACCOUNT_SID=ACyour_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_PHONE_NUMBER=+1234567890

# SendGrid (Email)
VITE_SENDGRID_API_KEY=SG.your_sendgrid_key

# Application
VITE_APP_URL=https://myclevercrm.com
VITE_APP_NAME=My Clever CRM
VITE_APP_ENV=production
```

**🔒 SECURITY WARNING**:
- NEVER commit `.env.production` to git
- Add to `.gitignore` if not already there
- Store securely in password manager
- Use environment variables in hosting platform

### Step 4: Verify .gitignore

Ensure `.gitignore` includes:

```
# Environment variables
.env
.env.local
.env.production
.env.development

# API Keys
*.key
*.pem
```

---

## Third-Party Service Configuration

### 1. Firebase Setup

**Already Configured** - Verify settings:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Verify Authentication methods enabled:
   - Email/Password ✅
   - Google (optional)
4. Verify Firestore Database is created
5. Check Storage bucket exists
6. Review Security Rules

**Firestore Security Rules** (Update if needed):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Admins can access everything
    match /{document=**} {
      allow read, write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'masterAdmin';
    }

    // Add more specific rules as needed
  }
}
```

---

### 2. Stripe Setup (Payment Processing)

**Step-by-Step**:

1. **Create Stripe Account**
   - Go to https://stripe.com
   - Sign up for business account
   - Complete business verification

2. **Get API Keys**
   - Dashboard → Developers → API Keys
   - Copy "Publishable key" (pk_live_...)
   - Copy "Secret key" (sk_live_...) - Click "Reveal live key token"
   - Add to `.env.production`

3. **Set Up Webhooks**
   - Dashboard → Developers → Webhooks
   - Click "+ Add endpoint"
   - URL: `https://myclevercrm.com/api/stripe-webhook`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy "Signing secret" (whsec_...)
   - Add to environment variables

4. **Test Mode First**
   - Use test keys (pk_test_..., sk_test_...) initially
   - Test with card: 4242 4242 4242 4242
   - Verify payments work
   - Then switch to live keys

5. **Configure in CRM**
   - Log in as admin
   - Go to Payment Integration Hub
   - Enter Stripe keys
   - Test connection
   - Enable live mode

---

### 3. IDIQ Setup (Credit Monitoring)

**Step-by-Step**:

1. **Contact IDIQ**
   - Website: [IDIQ Contact Info]
   - Request business account for credit monitoring
   - Provide business details and use case

2. **Receive Credentials**
   - API Key
   - Account ID
   - Sandbox/Test credentials (for testing)

3. **Test in Sandbox**
   - Add sandbox credentials to `.env.development`
   - Test credit report pulls
   - Verify 3-bureau access
   - Test enrollment process

4. **Production Setup**
   - Add production credentials to `.env.production`
   - Configure in CRM:
     - Credit Reports Hub → Settings
     - Enter API credentials
     - Test connection
     - Pull test report

---

### 4. OpenAI Setup (AI Features)

**Step-by-Step**:

1. **Create OpenAI Account**
   - Go to https://platform.openai.com
   - Sign up for account
   - Verify email

2. **Add Payment Method**
   - Billing → Payment methods
   - Add credit card
   - Set monthly budget limit (recommended: $100/month to start)

3. **Get API Key**
   - API Keys → "+ Create new secret key"
   - Name it "My Clever CRM Production"
   - Copy key (starts with sk-...)
   - **IMPORTANT**: You can only see this once!
   - Add to `.env.production`

4. **Configure Usage Limits**
   - Settings → Limits
   - Set hard limit: $100/month (adjust as needed)
   - Set email alerts at $50 and $80

5. **Test AI Features**
   - Log into CRM
   - Go to AI Hub
   - Test "Generate Dispute Letter"
   - Verify functionality
   - Monitor usage in OpenAI dashboard

**Cost Estimates**:
- GPT-4: ~$0.03 per dispute letter
- GPT-3.5-Turbo: ~$0.002 per dispute letter
- Expected monthly cost: $20-50 for moderate usage

---

### 5. Twilio Setup (SMS)

**Step-by-Step**:

1. **Create Twilio Account**
   - Go to https://www.twilio.com
   - Sign up and verify
   - Complete identity verification

2. **Get Phone Number**
   - Console → Phone Numbers → Buy a number
   - Choose number with SMS capability
   - $1-$15/month depending on features

3. **Get Credentials**
   - Console → Account → Settings
   - Copy "Account SID" (AC...)
   - Copy "Auth Token"
   - Add to `.env.production`

4. **Configure Messaging**
   - Console → Messaging → Services
   - Create new messaging service
   - Add your phone number to service
   - Configure opt-out keywords (STOP, UNSUBSCRIBE)

5. **Test SMS**
   - Log into CRM
   - Go to Communications Hub
   - Send test SMS to your phone
   - Verify receipt

**Cost Estimates**:
- Outbound SMS: $0.0075 per message (US)
- Phone number: ~$1/month
- Expected monthly cost: $10-50 depending on volume

---

### 6. SendGrid Setup (Email)

**Step-by-Step**:

1. **Create SendGrid Account**
   - Go to https://sendgrid.com
   - Sign up for account
   - Free tier: 100 emails/day
   - Paid: Start at $19.95/month for 50k emails

2. **Verify Domain**
   - Settings → Sender Authentication
   - Authenticate Your Domain
   - Follow DNS setup instructions
   - Add DNS records to your domain
   - Verify (takes 24-48 hours)

3. **Create API Key**
   - Settings → API Keys
   - Create API Key
   - Name: "My Clever CRM Production"
   - Permissions: Full Access
   - Copy key (starts with SG.)
   - Add to `.env.production`

4. **Set Up Templates**
   - Email API → Dynamic Templates
   - Create templates for:
     - Welcome email
     - Password reset
     - Invoice
     - Dispute update
     - Monthly report

5. **Configure in CRM**
   - Settings Hub → Email
   - Select "SendGrid" as provider
   - Enter API key
   - Set from email (must be verified)
   - Test email sending

---

## Database Setup

### Firebase Firestore (Already Created)

**Verify Collections Exist**:

```
users/
├── {userId}/
    ├── profile data
    ├── role
    └── permissions

clients/
├── {clientId}/
    ├── personal info
    ├── credit data
    └── documents

disputes/
├── {disputeId}/
    ├── client reference
    ├── items
    └── status

[... and more collections]
```

**If Collections Don't Exist**:

1. They'll be created automatically on first use
2. Or run initialization script:
   ```bash
   npm run init-db
   ```
   (if script exists)

**Create Admin User**:

Manual method (Firebase Console):
1. Go to Firebase Console
2. Authentication → Users
3. Add user
4. Email: your@email.com
5. Password: [secure password]
6. Go to Firestore
7. Find user in `users` collection
8. Edit document
9. Add field: `role: "masterAdmin"`

---

## Build & Deploy

### Option 1: Deploy to Firebase Hosting (Recommended)

**Advantages**:
- Integrated with Firebase backend
- Free SSL certificate
- Global CDN
- Easy setup
- Custom domain support

**Steps**:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**
   ```bash
   firebase init hosting
   ```

   Answers:
   - Use existing project? **Yes**
   - Select your Firebase project
   - Public directory? **dist**
   - Configure as SPA? **Yes**
   - Set up GitHub Actions? **No** (for now)
   - Overwrite index.html? **No**

4. **Build Production Bundle**
   ```bash
   npm run build
   ```

   This creates optimized files in `/dist` folder.

   **Expected Output**:
   ```
   ✓ built in 45s
   dist/index.html                    13.2 kB
   dist/assets/index-abc123.css      150.3 kB
   dist/assets/index-xyz789.js     1,250.8 kB
   ```

5. **Test Build Locally**
   ```bash
   npm run preview
   ```

   Visit http://localhost:4173 and test functionality

6. **Deploy to Firebase**
   ```bash
   firebase deploy --only hosting
   ```

   **Expected Output**:
   ```
   ✔ Deploy complete!

   Project Console: https://console.firebase.google.com/project/your-project
   Hosting URL: https://your-project.web.app
   ```

7. **Set Up Custom Domain**

   a. Go to Firebase Console → Hosting → Add custom domain

   b. Enter: myclevercrm.com

   c. Follow instructions to add DNS records:

   **DNS Records to Add** (in your domain registrar):
   ```
   Type: A
   Name: @
   Value: [IP from Firebase]

   Type: A
   Name: @
   Value: [Second IP from Firebase]

   Type: CNAME
   Name: www
   Value: your-project.web.app
   ```

   d. Wait for DNS propagation (can take 24-48 hours)

   e. Firebase will auto-provision SSL certificate

   f. Once verified, your site will be live at https://myclevercrm.com

---

### Option 2: Deploy to Vercel

**Advantages**:
- Very fast deployment
- Excellent performance
- Automatic HTTPS
- GitHub integration

**Steps**:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

   First deploy creates preview. Then:

   ```bash
   vercel --prod
   ```

4. **Add Environment Variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add all variables from `.env.production`

5. **Add Custom Domain**
   - Settings → Domains
   - Add: myclevercrm.com
   - Follow DNS instructions

---

### Option 3: Deploy to Netlify

Similar process to Vercel. See Netlify documentation.

---

## Post-Deployment Verification

### Immediate Checks (Within 1 Hour)

**1. Site is Accessible**
- [ ] https://myclevercrm.com loads
- [ ] SSL certificate is valid (padlock icon)
- [ ] No mixed content warnings
- [ ] Redirects from http to https

**2. Authentication Works**
- [ ] Login page loads
- [ ] Can log in with admin account
- [ ] Registration works (test)
- [ ] Password reset works (test)
- [ ] Logout works

**3. All Hubs Load**
- [ ] Navigate to each of 41 hubs
- [ ] No 404 errors
- [ ] No console errors
- [ ] Page loads completely

**4. Database Connectivity**
- [ ] Can read data from Firestore
- [ ] Can write data to Firestore
- [ ] Real-time updates work

**5. Critical Workflows**
- [ ] Add new client
- [ ] Upload document
- [ ] Send email
- [ ] Create task
- [ ] View analytics

### Detailed Testing (Within 24 Hours)

**1. IDIQ Integration**
- [ ] Enroll test client
- [ ] Pull credit report
- [ ] View all 3 bureaus
- [ ] Data displays correctly

**2. AI Features**
- [ ] Generate dispute letter
- [ ] AI responds to prompts
- [ ] No API errors
- [ ] Usage tracked

**3. Payment Processing**
- [ ] Create test invoice
- [ ] Process test payment ($1)
- [ ] Verify in Stripe dashboard
- [ ] Refund processes correctly

**4. Communications**
- [ ] Send test email (verify receipt)
- [ ] Send test SMS (verify receipt)
- [ ] Templates load correctly
- [ ] Tracking works

**5. Reporting**
- [ ] Generate report
- [ ] Export to PDF
- [ ] Export to Excel
- [ ] Data is accurate

**6. Mobile Testing**
- [ ] Test on mobile browser
- [ ] Navigation works
- [ ] Forms are usable
- [ ] No horizontal scrolling

**7. Role-Based Access**
- [ ] Create test users for each role
- [ ] Verify access restrictions
- [ ] Test Client portal
- [ ] Test Affiliate portal

### Performance Checks

**1. Load Time**
- [ ] Homepage loads in <3 seconds
- [ ] Hubs load in <2 seconds
- [ ] No timeout errors

**2. Lighthouse Audit**
Run in Chrome DevTools:
```
- Performance: >80
- Accessibility: >90
- Best Practices: >90
- SEO: >80
```

**3. Error Monitoring**
- [ ] Set up error tracking (Sentry recommended)
- [ ] Monitor for errors in first 24 hours
- [ ] Fix any critical errors immediately

---

## Monitoring & Maintenance

### Daily (First Week)

- [ ] Check error logs
- [ ] Monitor user activity
- [ ] Verify all services running
- [ ] Check API usage/costs

### Weekly

- [ ] Review analytics
- [ ] Check performance metrics
- [ ] Verify backups
- [ ] Review support tickets

### Monthly

- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance optimization
- [ ] Cost analysis

---

## Troubleshooting

### Issue: Site Won't Load

**Symptoms**: "This site can't be reached"

**Solutions**:
1. Check DNS propagation: https://www.whatsmydns.net
2. Verify hosting is active (check hosting dashboard)
3. Check domain expiration
4. Review DNS records for typos
5. Clear browser cache
6. Try different browser/device

---

### Issue: White Screen / Blank Page

**Symptoms**: Page loads but shows white screen

**Solutions**:
1. Check browser console for errors (F12)
2. Verify all environment variables set
3. Check build completed successfully
4. Test local build: `npm run preview`
5. Check Firebase configuration
6. Review CSP headers if set

---

### Issue: Authentication Not Working

**Symptoms**: Can't log in or register

**Solutions**:
1. Verify Firebase Auth is enabled
2. Check environment variables (Firebase config)
3. Check browser console for errors
4. Verify email/password auth method enabled in Firebase
5. Check Firestore security rules
6. Clear browser cache and cookies

---

### Issue: IDIQ Reports Not Pulling

**Symptoms**: Error when pulling credit reports

**Solutions**:
1. Verify IDIQ credentials correct
2. Check API key has not expired
3. Verify client enrollment successful
4. Check IDIQ account status (billing)
5. Review error message in console
6. Contact IDIQ support

---

### Issue: Payments Failing

**Symptoms**: Payment processing errors

**Solutions**:
1. Verify using live Stripe keys (not test)
2. Check Stripe account status
3. Verify webhook configured
4. Test with Stripe test card first
5. Check console for specific error
6. Review Stripe dashboard for failed payments

---

### Issue: Emails Not Sending

**Symptoms**: Emails not delivered

**Solutions**:
1. Check SendGrid API key correct
2. Verify sender email is verified
3. Check email in spam/junk folder
4. Review SendGrid activity logs
5. Verify SendGrid account status (credits)
6. Check from email domain verified

---

### Issue: Slow Performance

**Symptoms**: Pages load slowly

**Solutions**:
1. Run Lighthouse audit
2. Check database query efficiency
3. Optimize images (compress, resize)
4. Enable caching
5. Review console for errors
6. Check network tab in DevTools
7. Consider CDN for static assets

---

## Rollback Plan

If deployment fails or critical issues arise:

### Quick Rollback (Firebase Hosting)

```bash
# View recent deployments
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:rollback
```

### Rollback (Vercel)

- Go to Vercel dashboard
- Deployments tab
- Find previous working deployment
- Click "..." → Promote to Production

### Database Rollback

**IMPORTANT**: Cannot easily rollback Firestore. Prevention is key:

1. **Before major changes**:
   - Export Firestore data
   - Use Firebase emulator for testing
   - Test on staging environment first

2. **Backup regularly**:
   ```bash
   gcloud firestore export gs://[BUCKET_NAME]
   ```

---

## Security Checklist

### Before Going Live

- [ ] All API keys stored securely (not in code)
- [ ] Environment variables not committed to git
- [ ] Firebase security rules configured
- [ ] HTTPS enforced (no HTTP)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (if applicable)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection enabled
- [ ] Authentication timeout configured
- [ ] Password policy enforced
- [ ] Sensitive data encrypted
- [ ] Audit logging enabled
- [ ] Regular backups scheduled

---

## Go-Live Timeline

### Week Before Launch

- [ ] Complete all third-party account setup
- [ ] Test everything in development
- [ ] Run security audit
- [ ] Performance optimization
- [ ] Create backups

### Day Before Launch

- [ ] Final testing
- [ ] Build production bundle
- [ ] Verify all environment variables
- [ ] Create admin user
- [ ] Prepare rollback plan

### Launch Day

**Morning**:
- [ ] Deploy to production
- [ ] Configure custom domain
- [ ] Verify site loads

**Afternoon**:
- [ ] Complete all post-deployment checks
- [ ] Test critical workflows
- [ ] Monitor errors

**Evening**:
- [ ] Final verification
- [ ] Document any issues
- [ ] Plan next day's tasks

### Week After Launch

- [ ] Daily monitoring
- [ ] User feedback collection
- [ ] Performance tracking
- [ ] Bug fixes as needed

---

## Support Plan

### During Launch Week

- Monitor closely
- Quick response to issues
- Daily status updates
- Hot fixes as needed

### Ongoing

- Weekly check-ins
- Monthly updates
- Quarterly reviews
- Feature enhancements

---

## Cost Estimates

### Monthly Hosting & Services

| Service | Estimated Cost |
|---------|---------------|
| Firebase Hosting | Free - $25 |
| Firebase Firestore | $5 - $50 |
| Firebase Storage | $5 - $20 |
| Stripe | 2.9% + $0.30 per transaction |
| IDIQ | $50 - $200 (varies) |
| OpenAI | $20 - $100 |
| Twilio SMS | $10 - $50 |
| SendGrid | Free - $20 |
| Domain | $15/year |
| **TOTAL** | **$100 - $500/month** |

*Costs scale with usage*

---

## Conclusion

This deployment plan provides a comprehensive guide to launching My Clever CRM to production at myclevercrm.com.

**Key Takeaways**:
1. Prepare all accounts and API keys first
2. Test thoroughly before deploying
3. Use environment variables for all sensitive data
4. Monitor closely after launch
5. Have a rollback plan ready

**Questions?**
- Refer to `docs/MASTER_ADMIN_GUIDE.md` for system usage
- Refer to `docs/PROJECT_ORGANIZATION_SUMMARY.md` for technical details
- Contact support for deployment assistance

---

**Good luck with your launch! 🚀**

---

**Document Version**: 1.0
**Last Updated**: November 11, 2025
**Next Review**: After successful deployment
