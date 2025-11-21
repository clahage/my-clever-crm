import React from 'react';
import CreditScoreTracker from '../components/CreditScoreTracker.jsx';

// Demo data for showcase
const demoScoreHistory = [
  { date: '2025-01-01', experian: 580, equifax: 600, transunion: 590, notes: 'Initial score' },
  { date: '2025-03-01', experian: 620, equifax: 630, transunion: 625, notes: 'First round of disputes' },
  { date: '2025-06-01', experian: 670, equifax: 680, transunion: 675, notes: 'Major improvement' },
  { date: '2025-08-01', experian: 740, equifax: 750, transunion: 745, notes: 'Goal reached!' },
];

export default function CreditScores() {
  return (
    <div className="p-8">
      <CreditScoreTracker scoreHistory={demoScoreHistory} goal={750} />
    </div>
  );
}
