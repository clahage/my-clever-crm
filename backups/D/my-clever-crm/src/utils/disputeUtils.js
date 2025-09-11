// Helper functions for dispute management

export function formatDisputeData(dispute) {
  return {
    ...dispute,
    dateCreated: dispute.dateCreated ? new Date(dispute.dateCreated).toLocaleDateString() : '',
    dateUpdated: dispute.dateUpdated ? new Date(dispute.dateUpdated).toLocaleDateString() : '',
    status: dispute.status || 'New',
    priority: dispute.priority || 'Normal',
  };
}

export function calculateSuccessRate(disputes) {
  if (!disputes || disputes.length === 0) return 0;
  const resolved = disputes.filter(d => d.status === 'Resolved').length;
  return Math.round((resolved / disputes.length) * 100);
}

export function generateTimelineEvents(dispute) {
  if (!dispute.timeline) return [];
  return dispute.timeline.map(event => ({
    ...event,
    date: event.date ? new Date(event.date).toLocaleDateString() : '',
  }));
}

export function validateDisputeData(data) {
  const requiredFields = ['clientId', 'clientName', 'bureau', 'disputeType', 'status', 'dateCreated', 'description'];
  for (const field of requiredFields) {
    if (!data[field]) return false;
  }
  return true;
}

export const disputeStatusColors = {
  'New': 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  'Letter Sent': 'bg-purple-100 text-purple-700',
  'Response Received': 'bg-green-100 text-green-700',
  'Investigating': 'bg-orange-100 text-orange-700',
  'Resolved': 'bg-green-200 text-green-800',
  'Escalated': 'bg-red-100 text-red-700',
};
