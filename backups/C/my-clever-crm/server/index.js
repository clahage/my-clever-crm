// Entry point for the backend server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notificationsRouter from './routes/notifications.js';
import timelineRouter from './routes/timeline.js';
import reportsRouter from './routes/reports.js';
import affiliatesRouter from './routes/affiliates.js';
import backlinksRouter from './routes/backlinks.js';
import contactsRouter from './routes/contacts.js';
import realestateRouter from './routes/realestate.js';
import autoRouter from './routes/auto.js';
import parsepdfRouter from './routes/parsepdf.js';

dotenv.config();


const app = express();
app.use(express.json());
// Enable CORS for all origins (development)
app.use(cors());

app.use('/api/notifications', notificationsRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/affiliates', affiliatesRouter);
app.use('/api/backlinks', backlinksRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/realestate', realestateRouter);
app.use('/api/auto', autoRouter);
app.use('/api/parsepdf', parsepdfRouter);

app.get('/', (req, res) => {
  res.send('SCR Backend API is running.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
