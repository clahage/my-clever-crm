// AI Data Processor for MyAIFrontDesk webhooks
// Extracts, formats, and scores incoming call data

function extractCallerName(transcript = "", phoneNumber = "") {
  if (!transcript) return phoneNumber || "Not Provided";

  // 1. Direct patterns
  const directPatterns = [
    /my name is ([A-Za-z .'-]+)/i,
    /this is ([A-Za-z .'-]+)/i,
    /I'm ([A-Za-z .'-]+)/i,
    /I am ([A-Za-z .'-]+)/i,
    /calling from [A-Za-z .'-]+, my name is ([A-Za-z .'-]+)/i
  ];

  // 1. Find all 'user@' responses, capture everything until next assistant@/system@ or end of line
  const userPattern = /user@\s*([^\n\r]*)/gi;
  let userMatches = [];
  let m;
  while ((m = userPattern.exec(transcript)) !== null) {
    let name = m[1].trim();
    // Remove trailing period
    if (name.endsWith('.')) name = name.slice(0, -1).trim();
    // If starts with 'My name is', extract after that
    const myNameIs = name.match(/my name is (.+)/i);
    if (myNameIs) name = myNameIs[1].trim();
    // Only accept if not too long and not empty
    if (name && name.length > 1 && name.length < 50) userMatches.push(name);
  }
  if (userMatches.length > 0) return userMatches[0];

  // 2. Intake Form pattern: find 'May I ask for your full name' then next user@ response
  const intakeIdx = transcript.toLowerCase().indexOf('may i ask for your full name');
  if (intakeIdx !== -1) {
    const afterIntake = transcript.slice(intakeIdx);
    const intakeUserMatch = afterIntake.match(/user@\s*([^\n\r]*)/i);
    if (intakeUserMatch) {
      let name = intakeUserMatch[1].trim();
      if (name.endsWith('.')) name = name.slice(0, -1).trim();
      if (name && name.length > 1 && name.length < 50) return name;
    }
  }

  // 3. Direct patterns (fallback)
  for (const pattern of directPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      let name = match[1].trim();
      if (name.endsWith('.')) name = name.slice(0, -1).trim();
      if (name && name.length > 1 && name.length < 50) return name;
    }
  }

  // 4. Fallback: return phone number if provided
  if (phoneNumber && phoneNumber.length > 3) return phoneNumber;
  return "Not Provided";
}

function extractPainPoints(transcript = "") {
  const painKeywords = ["problem", "issue", "concern", "struggle", "difficulty", "challenge", "frustrated", "can't", "unable", "need help", "blocked", "stuck", "error", "fail", "complain"];
  const found = [];
  for (const keyword of painKeywords) {
    if (transcript.toLowerCase().includes(keyword)) found.push(keyword);
  }
  return found.length ? found : [];
}

function extractUrgency(transcript = "") {
  const urgencyWords = ["urgent", "immediately", "asap", "right away", "now", "soon", "priority", "critical", "emergency"];
  for (const word of urgencyWords) {
    if (transcript.toLowerCase().includes(word)) return "high";
  }
  return "medium";
}

function extractBudget(transcript = "") {
  const match = transcript.match(/\$([0-9,.]+)/);
  if (match) return match[0];
  const range = transcript.match(/([0-9]+)\s*to\s*([0-9]+)/);
  if (range) return `${range[1]} to ${range[2]}`;
  return null;
}

function extractTimeline(transcript = "") {
  const patterns = [
    /need (?:help|service|work) (?:by|before|in) ([A-Za-z0-9 ,]+)/i,
    /start (?:by|before|in) ([A-Za-z0-9 ,]+)/i,
    /available (?:by|before|in) ([A-Za-z0-9 ,]+)/i
  ];
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

function calculateLeadScore({ duration = 0, sentiment = {}, painPoints = [], urgencyLevel = "medium", texts_sent = [] }) {
  let score = 1;
  // Duration: up to 3 points
  if (duration > 180) score += 3;
  else if (duration > 90) score += 2;
  else if (duration > 45) score += 1;
  // Sentiment positivity: up to 2 points
  if (sentiment.positive >= 60) score += 2;
  else if (sentiment.positive >= 40) score += 1;
  // Pain points: up to 2 points
  if (painPoints.length >= 2) score += 2;
  else if (painPoints.length === 1) score += 1;
  // Urgency: up to 1 point
  if (urgencyLevel === "high") score += 1;
  // Engagement: up to 1 point
  if (texts_sent && texts_sent.length > 0) score += 1;
  return Math.min(score, 10);
}

function estimateConversionProbability({ leadScore = 1, sentiment = {}, urgencyLevel = "medium" }) {
  let base = leadScore * 10;
  if (sentiment.positive >= 60) base += 10;
  if (urgencyLevel === "high") base += 10;
  return Math.max(0, Math.min(base, 100));
}

function processAICallData(webhookData) {
  const {
    username = "",
    caller = "",
    timestamp = "",
    transcript = "",
    sentiment = {},
    duration = 0,
    satisfaction = null,
    summary = "",
    texts_sent = []
  } = webhookData;

  const callerName = extractCallerName(transcript);
  const painPoints = extractPainPoints(transcript);
  const urgencyLevel = extractUrgency(transcript);
  const budget = extractBudget(transcript);
  const timeline = extractTimeline(transcript);
  const leadScore = calculateLeadScore({ duration, sentiment, painPoints, urgencyLevel, texts_sent });
  const conversionProbability = estimateConversionProbability({ leadScore, sentiment, urgencyLevel });
  const processedAt = new Date().toISOString();

  return {
    ...webhookData,
    callerName,
    painPoints,
    urgencyLevel,
    budget,
    timeline,
    leadScore,
    conversionProbability,
    processedAt
  };
}

export { processAICallData };
