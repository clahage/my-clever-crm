// functions/openaiProxy.js
// Firebase HTTPS function to proxy OpenAI API requests securely

const functions = require('firebase-functions');
const fetch = require('node-fetch');

// Store your OpenAI API key in Firebase environment config, not in code!
const { param } = require('firebase-functions/params');
const OPENAI_API_KEY = param('OPENAI_API_KEY').value();

exports.openaiProxy = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { endpoint = 'chat/completions', ...body } = req.body;
    const url = `https://api.openai.com/v1/${endpoint}`;

    const openaiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await openaiRes.json();
    res.status(openaiRes.status).json(data);
  } catch (error) {
    console.error('OpenAI proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});
