import express from 'express';
const router = express.Router();

// POST /api/timeline/event
// Body: { clientId, type, description, relatedId, createdBy }
router.post('/event', async (req, res) => {
  const { clientId, type, description, relatedId, createdBy } = req.body;
  // TODO: Save timeline event to DB (mock for now)
  res.status(201).json({ success: true, message: 'Timeline event logged', data: { clientId, type, description, relatedId, createdBy } });
});

export default router;
