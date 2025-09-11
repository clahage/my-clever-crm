// Real Estate & Mortgage Partner model
export default {
  id: String,
  name: String,
  type: String, // realtor, mortgage broker, lender, rapid rescore provider, etc.
  company: String,
  contactInfo: Object,
  services: [String],
  commissionRate: Number,
  referralClients: [String], // array of client ids
  mutualReferrals: [String], // array of partner ids
  notes: String,
  createdAt: Date,
  updatedAt: Date
};
