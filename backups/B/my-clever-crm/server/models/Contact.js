// Contact model for SCR and affiliates
export default {
  id: String,
  name: String,
  email: String,
  phone: String,
  company: String,
  title: String,
  type: String, // client, affiliate, vendor, partner, etc.
  services: [String], // list of services/goods offered
  mutualConnections: [String], // array of contact ids
  associations: [String], // array of SCR or other org ids
  notes: String,
  createdAt: Date,
  updatedAt: Date
};
