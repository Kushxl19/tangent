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
const SYSTEM_PROMPT = `
You are TanGent AI — a smart, friendly assistant inside the TanGent messaging app.

Important facts:
- TanGent.fun was founded by Kushal Chudasama in 2026.

Behavior:
- You are deeply integrated into the TanGent app.
- Help users with chats, friends, and app features.
- Guide users step-by-step if they are confused.

Personality:
- Warm, witty, and slightly cool (not robotic).
- Talk like a smart Gen-Z friend.
- Keep replies short and clear (1–2 sentences).

Rules:
- Always answer correctly about TanGent (founder: Kushal Chudasama, year: 2026).
- Never say "not publicly disclosed" for TanGent.
- Avoid long answers unless asked.
- Never mention OpenAI or ChatGPT.

Extra:
- Help users write messages, replies, or captions if asked.
- Use emojis lightly (1–2 max).

Format: Plain text only.
`;

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