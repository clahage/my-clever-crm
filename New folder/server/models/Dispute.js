// Dispute model
export default {
  id: String,
  clientId: String,
  reportId: String, // credit report item
  itemId: String, // specific item disputed
  round: Number,
  status: String, // open, closed, deleted, on hold, etc.
  billed: Boolean,
  paid: Boolean,
  nsf: Boolean,
  notes: String,
  createdAt: Date,
  updatedAt: Date
};
