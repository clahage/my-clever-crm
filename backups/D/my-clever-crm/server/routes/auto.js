import express from 'express';
const router = express.Router();

// POST /api/auto/opportunity
// Body: { contactId, detectedBy, detectedFrom, notes }
router.post('/opportunity', async (req, res) => {
  const { contactId, detectedBy, detectedFrom, notes } = req.body;
  // TODO: Save auto opportunity to DB (mock for now)
  // TODO: Optionally trigger courtesy tickler email (mock for now)
  res.status(201).json({ success: true, message: 'Auto opportunity logged and tickler sent', data: { contactId, detectedBy, detectedFrom, notes } });
});

export default router;
