import express from 'express';
const router = express.Router();

// POST /api/contacts/add
// Body: { name, email, phone, company, title, type, services, mutualConnections, associations, notes }
router.post('/add', async (req, res) => {
  const { name, email, phone, company, title, type, services, mutualConnections, associations, notes } = req.body;
  // TODO: Save contact to DB (mock for now)
  res.status(201).json({ success: true, message: 'Contact added', data: { name, email, phone, company, title, type, services, mutualConnections, associations, notes } });
});

export default router;
