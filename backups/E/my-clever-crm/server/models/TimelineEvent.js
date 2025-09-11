// Timeline Event model
export default {
  id: String,
  clientId: String,
  type: String, // upload, dispute, note, call, email, etc.
  description: String,
  relatedId: String, // file, dispute, etc.
  createdBy: String, // user id
  createdAt: Date
};
