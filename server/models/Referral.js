// Referral model
export default {
  id: String,
  clientId: String,
  affiliateId: String,
  status: String, // pending, contacted, deal, etc.
  commissionDue: Number,
  commissionPaid: Boolean,
  followUp: Boolean,
  notes: String,
  createdAt: Date,
  updatedAt: Date
};
