import express from 'express';
const router = express.Router();

// POST /api/affiliates/backlink
// Body: { affiliateId, clientId, url, context, notes }
router.post('/backlink', async (req, res) => {
  const { affiliateId, clientId, url, context, notes } = req.body;
  // TODO: Save backlink info to DB (mock for now)
  // TODO: Optionally trigger notification or reward
  res.status(201).json({ success: true, message: 'Backlink submitted', data: { affiliateId, clientId, url, context, notes } });
});

export default router;
