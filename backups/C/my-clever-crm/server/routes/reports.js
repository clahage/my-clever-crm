import express from 'express';
const router = express.Router();

// POST /api/reports/upload
// Body: { clientId, bureau, reportType, version, fileId }
router.post('/upload', async (req, res) => {
  const { clientId, bureau, reportType, version, fileId } = req.body;
  // TODO: Save report metadata to DB (mock for now)
  // TODO: Trigger AI analysis (mock for now)
  res.status(201).json({ success: true, message: 'Report uploaded and analysis started', data: { clientId, bureau, reportType, version, fileId } });
});

export default router;
