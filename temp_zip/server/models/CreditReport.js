// Credit Report model
export default {
  id: String,
  clientId: String, // link to Client
  bureau: String, // Experian, Equifax, TransUnion
  reportType: String, // FICO, Vantage, Auto, Mortgage, etc.
  version: String, // e.g., 8, 9, etc.
  fileId: String, // link to uploaded file
  parsedData: Object, // JSON of parsed report
  analyzedData: Object, // AI analysis results
  comparedTo: String, // id of previous report
  comparisonResults: Object, // diff/summary
  createdAt: Date,
  updatedAt: Date
};
