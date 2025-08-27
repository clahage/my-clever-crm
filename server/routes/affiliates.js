import express from 'express';
const router = express.Router();

// POST /api/affiliates/register
// Body: { name, type, contactInfo, commissionRate, referredBy }
router.post('/register', async (req, res) => {
  const { name, type, contactInfo, commissionRate, referredBy } = req.body;
  // TODO: Save affiliate to DB (mock for now)
  res.status(201).json({ success: true, message: 'Affiliate registered', data: { name, type, contactInfo, commissionRate, referredBy } });
});

// POST /api/affiliates/track
// Body: { affiliateId, clientId, referralType, notes }
router.post('/track', async (req, res) => {
  const { affiliateId, clientId, referralType, notes } = req.body;
  // TODO: Log referral and track commission (mock for now)
  res.status(201).json({ success: true, message: 'Referral tracked', data: { affiliateId, clientId, referralType, notes } });
});

export default router;
