
import express from 'express';
import fs from 'fs';
const router = express.Router();

// POST /api/reports/parse-pdf
// Body: { filePath }
router.post('/parse-pdf', async (req, res) => {
  const { filePath } = req.body;
  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'PDF file not found', filePath });
    }
    // Lazy import pdf-parse to avoid startup issues
    const pdfParse = (await import('pdf-parse')).default;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    // TODO: Extract contact info, accounts, scores, etc. from pdfData.text
    // TODO: Auto-create contact/client and send to Dispute Center workflow
    res.status(200).json({ success: true, text: pdfData.text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
