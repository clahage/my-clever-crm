const functions = require('firebase-functions');
const pdfParse = require('pdf-parse');

// Simple ping test function
exports.ping = functions.https.onRequest((req, res) => {
  res.send('pong');
});

// PDF parsing function
exports.parsePDF = functions.https.onRequest(async (req, res) => {
  try {
    // Expect PDF as base64 string in req.body.pdfBase64
    if (!req.body || !req.body.pdfBase64) {
      return res.status(400).send('Missing pdfBase64 in request body');
    }
    const pdfBuffer = Buffer.from(req.body.pdfBase64, 'base64');
    const data = await pdfParse(pdfBuffer);
    res.json({ text: data.text });
  } catch (error) {
    res.status(500).send(error.toString());
  }
});