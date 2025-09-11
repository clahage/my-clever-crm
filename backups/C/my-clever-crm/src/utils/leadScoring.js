// Simple lead scoring utility
// You can later replace this with an AI/ML model or API
export function scoreLead(lead) {
  let score = 0;
  // Example rules
  if (lead.urgency === 'critical' || lead.urgency === 'high') score += 30;
  if (lead.status === 'New' || lead.status === 'Hot') score += 20;
  if (lead.source === 'Referral') score += 15;
  if (lead.email && lead.email.endsWith('.edu')) score += 10;
  if (lead.phone && lead.phone.startsWith('+1')) score += 5;
  if (lead.notes && lead.notes.length > 100) score += 5;
  // Age of lead (recent = higher score)
  if (lead.createdAt) {
    const now = new Date();
    const created = lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt);
    const daysOld = (now - created) / (1000 * 60 * 60 * 24);
    if (daysOld < 7) score += 10;
    else if (daysOld < 30) score += 5;
  }
  return score;
}
