import express from 'express';
const router = express.Router();

// POST /api/notifications/request
// Body: { userId, clientId, type: 'call'|'email'|'response', message }
router.post('/request', async (req, res) => {
  const { userId, clientId, type, message } = req.body;
  // TODO: Save notification to DB (mock for now)
  // Log timeline event (mock for now)
  res.status(201).json({ success: true, message: 'Request logged', data: { userId, clientId, type, message } });
});

export default router;
