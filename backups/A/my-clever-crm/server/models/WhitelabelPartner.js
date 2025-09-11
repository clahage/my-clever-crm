// Whitelabel Partner model
export default {
  id: String,
  name: String,
  contactInfo: Object,
  accountType: String, // e.g., whitelabel, reseller, etc.
  commissionRate: Number,
  referredBy: String, // affiliate or SCR
  clients: Array, // array of client ids
  createdAt: Date,
  updatedAt: Date
};
