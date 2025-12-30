# 📅 CAL.COM CONSULTATION BOOKING SETUP GUIDE

## 🎯 OVERVIEW
Complete setup guide for Christopher's strategic consultation calls using Cal.com with Stripe payment integration.

---

## 📋 STEP 1: CREATE CAL.COM ACCOUNT

1. Go to: https://cal.com
2. Sign up with: **chris@speedycreditrepair.com**
3. Complete profile:
   - Name: Chris Lahage
   - Company: Speedy Credit Repair
   - Time Zone: Pacific (Los Angeles)
   - Profile Photo: Upload professional headshot

---

## 💳 STEP 2: CONNECT STRIPE

1. In Cal.com → **Settings** → **Payments**
2. Click **Connect Stripe**
3. Use your existing Stripe account OR create new:
   - Business name: Speedy Credit Repair Inc
   - Tax ID: Your EIN
   - Bank account: Your business account

4. **Enable payment collection** for all event types

---

## 📞 STEP 3: CREATE EVENT TYPES

### **Event Type 1: Quick Q&A (15 minutes)**

**Settings:**
- Event name: `Credit Repair Quick Q&A - 15 Minutes`
- Duration: `15 minutes`
- Location: `Zoom` (Cal.com auto-generates)
- Price: Variable by plan (see pricing below)
- Description:
  ```
  Quick 15-minute consultation to answer your urgent credit repair questions.
  
  Perfect for:
  • Quick strategy questions
  • Letter review
  • Score optimization tips
  • Next steps guidance
  
  ✅ Zoom link sent immediately after payment
  ✅ Recording provided (with permission)
  ✅ Follow-up notes via email
  ```

**Pricing Tiers:**
```javascript
DIY Plan: $25
Professional Plan: FREE (1 per month)
VIP Plan: FREE (2 per month)
Public/Non-Client: $49
```

**Cal.com Configuration:**
- Minimum notice: `2 hours`
- Buffer before: `5 minutes`
- Buffer after: `5 minutes`
- Max bookings per day: `10`

---

### **Event Type 2: Strategy Session (30 minutes)**

**Settings:**
- Event name: `Credit Strategy Session - 30 Minutes`
- Duration: `30 minutes`
- Location: `Zoom`
- Price: Variable by plan
- Description:
  ```
  In-depth 30-minute strategy session to optimize your credit repair plan.
  
  What we'll cover:
  • Detailed credit report analysis
  • Custom dispute strategy
  • Timeline & expectations
  • Credit building roadmap
  • Action plan for next 90 days
  
  ✅ Zoom link sent immediately
  ✅ Call recording provided
  ✅ Written action plan emailed within 24 hours
  ```

**Pricing Tiers:**
```javascript
DIY Plan: $75
Professional Plan: $50
VIP Plan: FREE (1 per month)
Public/Non-Client: $99
```

**Cal.com Configuration:**
- Minimum notice: `4 hours`
- Buffer before: `10 minutes`
- Buffer after: `10 minutes`
- Max bookings per day: `6`

---

### **Event Type 3: Deep Dive Consultation (60 minutes)**

**Settings:**
- Event name: `Deep Dive Credit Consultation - 60 Minutes`
- Duration: `60 minutes`
- Location: `Zoom`
- Price: Variable by plan
- Description:
  ```
  Comprehensive 60-minute deep dive into your complete credit situation.
  
  Includes:
  • Full credit report review (all 3 bureaus)
  • Custom dispute letter creation
  • Debt settlement negotiation strategy
  • Credit building 12-month roadmap
  • Score projection modeling
  • Unlimited follow-up questions (7 days)
  
  ✅ Zoom link sent immediately
  ✅ Call recording + transcript
  ✅ Written strategy document (15-20 pages)
  ✅ Custom dispute letters
  ```

**Pricing Tiers:**
```javascript
DIY Plan: $150
Professional Plan: $99
VIP Plan: FREE (1 per quarter)
Public/Non-Client: $199
```

**Cal.com Configuration:**
- Minimum notice: `24 hours`
- Buffer before: `15 minutes`
- Buffer after: `15 minutes`
- Max bookings per day: `3`

---

## 🔗 STEP 4: EMBED ON WEBSITE

### **Option A: Direct Link (Easiest)**

Add to your website navigation:
```html
<a href="https://cal.com/speedycreditrepair">
  Book Free Consultation
</a>
```

### **Option B: Embedded Widget**

Add to `speedycreditrepair.com/consultations.php`:
```html
<!-- Cal.com Embed Code -->
<iframe 
  src="https://cal.com/speedycreditrepair/quick-qa?embed=true" 
  width="100%" 
  height="600px" 
  frameborder="0">
</iframe>

<!-- Cal.com Embed Script -->
<script type="text/javascript">
(function (C, A, L) { 
  let p = function (a, ar) { 
    a.q.push(ar); 
  }; 
  let d = C.document; 
  C.Cal = C.Cal || function () { 
    let cal = C.Cal; 
    let ar = arguments; 
    if (!cal.loaded) { 
      cal.ns = {}; 
      cal.q = cal.q || []; 
      d.head.appendChild(d.createElement("script")).src = A; 
      cal.loaded = true; 
    } 
    if (ar[0] === L) { 
      const api = function () { 
        p(api, arguments); 
      }; 
      const namespace = ar[1]; 
      api.q = api.q || []; 
      typeof namespace === "string" ? (cal.ns[namespace] = api) && p(api, ar) : p(cal, ar); 
      return; 
    } 
    p(cal, ar); 
  }; 
})(window, "https://app.cal.com/embed/embed.js", "init");

Cal("init", {origin:"https://cal.com"});
</script>
```

---

## 🎥 STEP 5: ZOOM AUTO-CONFIGURATION

Cal.com automatically creates Zoom meetings when using Zoom as location.

**Setup:**
1. Cal.com → **Apps** → **Zoom**
2. Click **Connect**
3. Authorize Cal.com to create Zoom meetings
4. ✅ Done! Zoom links auto-generated and sent

**Zoom Settings to Configure:**
- Auto-record: `Yes (cloud recording)`
- Waiting room: `No` (clients join directly)
- Join before host: `No`
- Mute on entry: `Yes`

---

## 📧 STEP 6: EMAIL NOTIFICATIONS

Cal.com sends automatic emails. Customize templates:

### **Booking Confirmation Email:**
```
Subject: Your {event_name} is Confirmed! 🎉

Hi {attendee_name},

Thanks for booking a consultation with Speedy Credit Repair!

📅 Date: {event_date}
⏰ Time: {event_time} Pacific
📹 Zoom Link: {zoom_link}
💰 Paid: ${amount}

Before our call:
1. Have your credit reports ready
2. Write down your top 3 questions
3. Join 2 minutes early to test audio/video

Looking forward to helping you!

Chris Lahage
Speedy Credit Repair
chris@speedycreditrepair.com
1-888-724-7344
```

### **Reminder Email (24 hours before):**
```
Subject: Reminder: Your consultation is tomorrow!

Hi {attendee_name},

Quick reminder about your call tomorrow:

📅 {event_date} at {event_time}
📹 Zoom: {zoom_link}

See you tomorrow!
Chris
```

### **Post-Call Follow-Up (Automatic via Zapier):**
Setup automation:
- Trigger: Cal.com booking completed
- Action: Send email with:
  - Recording link
  - Call notes
  - Action items
  - Upsell offer (if DIY → Professional upgrade)

---

## 💰 STEP 7: TIERED PRICING SETUP

Cal.com doesn't natively support "FREE for plan X" but you can:

### **Method 1: Coupon Codes (Recommended)**

Create Stripe coupons:
- `DIY-15MIN-FREE`: 100% off for DIY clients
- `PRO-30MIN-FREE`: 100% off for Professional clients  
- `VIP-60MIN-FREE`: 100% off for VIP clients

**Send to clients:**
```
"Book your free consultation using code: PRO-30MIN-FREE"
```

### **Method 2: Private Event Links**

Create separate Cal.com events:
- `cal.com/speedycreditrepair/quick-qa` - $49 (public)
- `cal.com/speedycreditrepair/quick-qa-diy` - $25 (DIY only)
- `cal.com/speedycreditrepair/quick-qa-free` - $0 (VIP only)

Share private links only with eligible clients.

---

## 📊 STEP 8: TRACKING & ANALYTICS

### **Cal.com Built-in Analytics:**
- Dashboard → **Insights**
- See: Bookings, revenue, no-shows, popular times

### **Google Analytics Integration:**
1. Cal.com → **Settings** → **Developer**
2. Add Google Analytics ID: `G-XXXXXXXXXX`
3. Track: Page views, booking conversions, revenue

### **Webhook to Firebase (Advanced):**

Send booking data to your CRM:
```javascript
// Cal.com webhook endpoint
Cal.com → Settings → Webhooks → Add webhook
URL: https://us-central1-your-project.cloudfunctions.net/calcomWebhook
Events: booking.created, booking.rescheduled, booking.cancelled

// Firebase function to handle
exports.calcomWebhook = functions.https.onRequest(async (req, res) => {
  const booking = req.body;
  
  await db.collection('consultations').add({
    clientEmail: booking.attendee.email,
    eventType: booking.event_type.title,
    scheduledTime: booking.start_time,
    amountPaid: booking.payment.amount,
    zoomLink: booking.location,
    status: 'scheduled',
    createdAt: serverTimestamp()
  });
  
  res.sendStatus(200);
});
```

---

## 🎯 STEP 9: UPSELL AUTOMATION

### **During Call Script:**
```
"I noticed you're on our DIY plan. Based on what we've discussed,
you have 8 items to dispute. That's a LOT to handle yourself.

Our Professional plan handles all of this for you - I do the 
disputes, negotiations, and follow-ups while you focus on your life.

Right now you're paying $39/month for DIY. Professional is $149/mo,
BUT since we're already talking, I can give you your first month for
just $99 - that's $50 off.

Want me to upgrade you right now while we're on the call?"
```

### **Post-Call Email (Automated):**
```
Subject: Thanks for our call! Here's your upgrade offer...

Hi {name},

Great talking to you today! As promised, here are your call notes
and action items: [LINK]

Based on our discussion, I think you'd benefit from upgrading to
our Professional plan. Here's why:

❌ DIY: You handle 8 disputes yourself = 10+ hours/month
✅ Professional: I handle everything = 0 hours for you

Special offer (expires in 48 hours):
Upgrade now and get $50 OFF your first month!
Use code: UPGRADE50

[UPGRADE NOW BUTTON]

Questions? Just reply to this email!

Chris
```

---

## 📱 STEP 10: MOBILE OPTIMIZATION

Cal.com is mobile-responsive, but optimize your booking page:

```html
<!-- Add to speedycreditrepair.com/consultations.php -->
<div style="max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1>Book Your Credit Strategy Call</h1>
  
  <!-- Cal.com Inline Embed -->
  <div data-cal-link="speedycreditrepair/quick-qa">
    <script type="text/javascript">
      (function (C, A, L) { /* Cal.com script */ })(window, "https://app.cal.com/embed/embed.js", "init");
      Cal("inline", {
        elementOrSelector:"[data-cal-link='speedycreditrepair/quick-qa']",
        calLink: "speedycreditrepair/quick-qa"
      });
    </script>
  </div>
</div>
```

---

## ✅ TESTING CHECKLIST

Before going live:

- [ ] Test booking with test Stripe card: `4242 4242 4242 4242`
- [ ] Verify Zoom link is sent immediately
- [ ] Check email notifications look good
- [ ] Test calendar sync (Google Calendar)
- [ ] Verify recording starts automatically
- [ ] Test coupon codes work correctly
- [ ] Confirm webhooks fire to Firebase
- [ ] Mobile responsive on iPhone/Android

---

## 💰 REVENUE PROJECTIONS

**Conservative Estimate (Month 1):**
- 10 DIY clients book 15-min @ $25 = $250
- 5 Professional clients book 30-min @ $50 = $250
- 3 public inquiries book 30-min @ $99 = $297
- **Total: $797/mo**

**Realistic Estimate (Month 3):**
- 30 DIY clients book 15-min @ $25 = $750
- 15 Professional clients book 30-min @ $50 = $750
- 10 public inquiries book various = $990
- 5 upsells to Professional @ $149 = $745
- **Total: $3,235/mo**

**Goal Estimate (Month 6):**
- 50 bookings/month avg @ $75 = $3,750
- 15 upsells/month @ $149 = $2,235
- **Total: $5,985/mo**

---

## 🚀 QUICK START SUMMARY

1. Create Cal.com account
2. Connect Stripe
3. Create 3 event types (15/30/60 min)
4. Connect Zoom
5. Embed on website
6. Create coupon codes for plan tiers
7. Test booking flow
8. Launch!

**Setup time: 2 hours**
**Revenue potential: $3,000-6,000/mo**

---

© 2025 Speedy Credit Repair Inc. | Internal Use Only