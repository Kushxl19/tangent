// backend/config/ai.js
import OpenAI from "openai";

export const AI_USER_ID = "ai_user";
export const AI_MODEL = "llama-3.3-70b-versatile";
export const AI_MAX_TOKENS = 350;
export const AI_REPLY_DELAY_MIN = 800;
export const AI_REPLY_DELAY_MAX = 1800;

export const delay = (ms) => new Promise((r) => setTimeout(r, ms));
export const randomDelay = () =>
  delay(Math.floor(Math.random() * (AI_REPLY_DELAY_MAX - AI_REPLY_DELAY_MIN) + AI_REPLY_DELAY_MIN));

// ✅ Lazy init — client is created on first USE, not at import time
// This ensures dotenv.config() has already run before we read the key
let _client = null;
export function getOpenAI() {
  if (!_client) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error("GROQ_API_KEY is not set in .env");
    _client = new OpenAI({
      apiKey:  key,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return _client;
}