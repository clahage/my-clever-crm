// Client model for credit repair clients
export default {
  id: String, // unique client id
  userId: String, // link to User
  status: String, // active, inactive, prospect, etc.
  targetScores: {
    fico8: Number,
    vantage: Number,
    auto: Number,
    mortgage: Number
  },
  currentScores: {
    fico8: Number,
    vantage: Number,
    auto: Number,
    mortgage: Number
  },
  timeline: Array, // array of timeline event ids
  files: Array, // array of file/document ids
  affiliateId: String, // if referred
  createdAt: Date,
  updatedAt: Date,
  // ...other fields as needed
};
