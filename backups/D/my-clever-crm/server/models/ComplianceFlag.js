// Compliance Flag model
export default {
  id: String,
  clientId: String,
  reportId: String,
  itemId: String,
  type: String, // FCRA, other
  description: String,
  referredToAttorney: Boolean,
  createdAt: Date,
  updatedAt: Date
};
