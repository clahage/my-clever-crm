import express from 'express';
const router = express.Router();

// POST /api/realestate/add
// Body: { name, type, company, contactInfo, services, commissionRate, notes }
router.post('/add', async (req, res) => {
  const { name, type, company, contactInfo, services, commissionRate, notes } = req.body;
  // TODO: Save real estate/mortgage partner to DB (mock for now)
  res.status(201).json({ success: true, message: 'Real estate/mortgage partner added', data: { name, type, company, contactInfo, services, commissionRate, notes } });
});

// POST /api/realestate/referral
// Body: { partnerId, clientId, referralType, notes }
router.post('/referral', async (req, res) => {
  const { partnerId, clientId, referralType, notes } = req.body;
  // TODO: Log referral and track commission (mock for now)
  res.status(201).json({ success: true, message: 'Referral tracked', data: { partnerId, clientId, referralType, notes } });
});

export default router;
