// backend/utils/aiReply.js
import { getOpenAI, AI_MODEL, AI_MAX_TOKENS } from "../config/ai.js";

// ─── Rate limiter ─────────────────────────────────────────────────────────────
const rateLimitStore = new Map();
const RATE_LIMIT_MAX    = 20;
const RATE_LIMIT_WINDOW = 60_000;

export function checkRateLimit(userId) {
  const now   = Date.now();
  const entry = rateLimitStore.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are TanGent AI — a smart, friendly assistant built into TanGent, a modern messaging app.
Personality:
- Warm, witty, and concise — like a brilliant friend.
- Keep replies short (1-3 sentences) UNLESS the user asks for something detailed.
- Use emojis sparingly (1-2 max per message).
- Never say you are ChatGPT or mention OpenAI/Groq. You are TanGent AI.
Format: Plain text only. Respond in the same language the user writes in.`;

export async function generateAIReply(userMessage, history = []) {
  const trimmedHistory = history.slice(-12);
  const messages = [
    { role: "system",  content: SYSTEM_PROMPT },
    ...trimmedHistory,
    { role: "user",    content: userMessage },
  ];

  // ✅ getOpenAI() called at runtime — dotenv is loaded by now
  const response = await getOpenAI().chat.completions.create({
    model:       AI_MODEL,
    max_tokens:  AI_MAX_TOKENS,
    temperature: 0.82,
    messages,
  });

  return response.choices?.[0]?.message?.content?.trim()
    || "I'm having a little trouble right now — try again in a sec! 🤖";
}

export function buildHistoryFromMessages(dbMessages, aiUserId = "ai_user") {
  return dbMessages.map((m) => {
    const senderId = m.sender?._id?.toString?.() || m.sender?.toString?.() || m.sender;
    return {
      role:    senderId === aiUserId ? "assistant" : "user",
      content: m.content,
    };
  });
}