// User model for authentication and profile
export default {
  id: String, // unique user id
  name: String,
  email: String,
  passwordHash: String,
  role: String, // admin, analyst, client, affiliate, etc.
  phone: String,
  createdAt: Date,
  updatedAt: Date,
  // ...other fields as needed
};
