// Notification model
export default {
  id: String,
  userId: String,
  clientId: String,
  type: String, // call, email, response, alert, etc.
  message: String,
  status: String, // pending, sent, read, etc.
  createdAt: Date,
  updatedAt: Date
};
