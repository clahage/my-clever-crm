// Affiliate Partner model
export default {
  id: String,
  name: String,
  type: String, // attorney, realtor, lender, etc.
  contactInfo: Object,
  commissionRate: Number,
  referrals: Array, // array of referral ids
  createdAt: Date,
  updatedAt: Date
};
