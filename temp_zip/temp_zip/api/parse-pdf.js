const pdf = require('pdf-parse');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { pdfBase64 } = req.body;
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const data = await pdf(pdfBuffer);
    
    const scorePattern = /(?:FICO|Score|Equifax|Experian|TransUnion)[:\s]+(\d{3})/gi;
    const scores = [...data.text.matchAll(scorePattern)].map(match => ({
      score: match[1],
      context: match[0]  
    }));
    
    res.status(200).json({ 
      success: true,
      text: data.text,
      scores: scores,
      pages: data.numpages
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
