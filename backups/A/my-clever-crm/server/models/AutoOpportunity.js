// Auto Opportunity model
export default {
  id: String,
  contactId: String, // client or contact
  detectedBy: String, // user or AI
  detectedFrom: String, // conversation, form, etc.
  status: String, // new, contacted, referred, closed, etc.
  notes: String,
  createdAt: Date,
  updatedAt: Date
};
