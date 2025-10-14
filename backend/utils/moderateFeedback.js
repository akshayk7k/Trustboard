const axios = require("axios");

/*
 Lightweight moderation pipeline (Streamlined for Gemini Only)

 Order of checks (fast to slow):
 1) Rule-based (local): quick bad-words and simple spam patterns.
 2) Google Gemini AI (if configured).

 Environment variables:
 - GEMINI_API_KEY (Required for AI moderation)
 - MODERATION_TIMEOUT_MS (optional, default 2000ms)
*/

// Relying on the .env file is best, but keeping the constant for the fallback logic
const GEMINI_API_KEY_DEMO = "AIzaSyB1g7jR90hT_BxZtNsXRuIixA2QRjPSaF0";

// Create an HTTP client with a tight timeout so external calls don't hang.
const HTTP_TIMEOUT_MS = Number(process.env.MODERATION_TIMEOUT_MS || 5000);
const http = axios.create({ timeout: HTTP_TIMEOUT_MS });

// =========================================================================
//                   GOOGLE GEMINI MODERATION FUNCTION (FIXED)
// =========================================================================

/**
 * Analyzes text for safety and moderation using the Google Gemini API.
 */
async function geminiModeration(text) {
  // Use the key from the environment, falling back to the hardcoded demo key
  const API_KEY = process.env.GEMINI_API_KEY || GEMINI_API_KEY_DEMO;
  if (!API_KEY) throw new Error("Gemini API key not configured");

  // The prompt explicitly asks the model to return ONLY JSON.
  const prompt = `
    Analyze the following user message for safety, toxicity, and harmful content 
    (insults, hate speech, spam, etc.).
    Your response must ONLY be a valid JSON object with the following keys:
    {
      "flagged": true or false,
      "reason": "A concise explanation of why it is flagged, or 'Clean' if not flagged."
    }
    
    Message to analyze: """${text}"""
  `;

  // FIX 1: Use the API_KEY variable inside ${}
  // FIX 2: Use the stable gemini-2.5-flash model to avoid 404
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
  
  try {
    const response = await http.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      /* config block remains commented out to avoid the 400 error */
    });

    let rawJsonText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJsonText) {
      return { flagged: false, provider: "Google Gemini", reason: "Gemini response empty, treated as clean" };
    }

    // START OF FIX: Strip markdown wrappers before parsing
    const cleanedJsonText = rawJsonText
        .replace(/^```json\s*/, '') // Remove starting wrapper (e.g., ```json\n)
        .replace(/\s*```$/, '');    // Remove ending wrapper (e.g., \n```)
    // END OF FIX
    
    let result = {};
    try {
      // Safely parse the model output using the cleaned text
      result = JSON.parse(cleanedJsonText);
    } catch (e) {
      console.error("Gemini output parsing failed:", e.message);
      return { flagged: false, provider: "Google Gemini", reason: "Parsing error, treated as clean" };
    }

    return {
      flagged: !!result.flagged,
      provider: "Google Gemini",
      reason: result.reason || "Clean (No specific reason provided)",
    };

  } catch (error) {
    throw new Error(`Gemini Moderation Failed: Request failed with status code ${error.response?.status || 'N/A'}. ${error.message}`);
  }
}

// =========================================================================
//                   EXISTING RULE-BASED CHECK
// =========================================================================

function ruleBasedModeration(text) {
  // Simple bad-words and spam check
  const badWords = [
    "spam", "scam", "hate", "abuse", "threat", "violence",
    "die", "stupid", "idiot", "moron", "loser", "ugly",
    "fat", "racist",
  ];

  const suspiciousPatterns = [
    /(.)\1{5,}/g, // 6+ repeated characters
    /[A-Z]{15,}/g, // 15+ consecutive uppercase letters
    /\b\d{10,}\b/g, // very long numbers
    /(.{1,3})\1{4,}/g, // short chunk repeated 5+ times
  ];

  const lowerText = text.toLowerCase();

  const containsBadWords = badWords.some((word) => lowerText.includes(word));
  const containsSuspicious = suspiciousPatterns.some((pattern) => pattern.test(text));
  const tooLong = text.length > 2000;
  const hasSpam = /(.)\1{8,}/.test(text); 

  const flagged = containsBadWords || containsSuspicious || tooLong || hasSpam;

  return {
    flagged,
    provider: "Rule-based Filter",
    reason: flagged ? "Content flagged by automated rules" : "Clean",
    details: {
      badWords: containsBadWords,
      suspicious: containsSuspicious,
      tooLong,
      spam: hasSpam,
    },
  };
}

// =========================================================================
//                   MAIN MODERATION PIPELINE
// =========================================================================

/**
 * Main entry: runs the moderation pipeline (Rules -> Gemini).
 */
async function moderateFeedback(text) {
  if (!text || text.trim().length === 0) {
    return { flagged: false, reason: "Empty text", provider: "validation" };
  }

  // 1) Fast local check first to avoid external calls on obvious cases.
  const ruleResult = ruleBasedModeration(text);
  if (ruleResult.flagged) return ruleResult;

  // 2) Check for Gemini availability
  const hasGemini = !!(process.env.GEMINI_API_KEY || GEMINI_API_KEY_DEMO);
  
  if (!hasGemini) {
    return { flagged: false, reason: "Clean", provider: "Rule-based only" };
  }

  // 3) Try the Gemini AI provider.
  try {
    const geminiResult = await geminiModeration(text);
    if (geminiResult.flagged) return geminiResult;
  } catch (e) {
    console.warn(`Moderation provider failed (geminiModeration): ${e.message}`);
    
    return { 
        flagged: false, 
        reason: "Clean (AI check failed)", 
        provider: "Gemini Failure Fallback" 
    };
  }

  // If all checks pass, the text is considered clean.
  return { flagged: false, reason: "Clean", provider: "All Checks Passed" };
}

module.exports = moderateFeedback;