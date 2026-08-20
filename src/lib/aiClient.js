const SPACE_BASE_URL =
  process.env.HF_SPACE_URL || "https://skmuzakkir750-nemesys-ai.hf.space";
const HF_TOKEN = process.env.HF_TOKEN;

function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (HF_TOKEN) headers.Authorization = `Bearer ${HF_TOKEN}`;
  return headers;
}

function extractText(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => part.text || "")
      .join(" ")
      .trim();
  }
  return "";
}

/**
 * Calls the deployed Qwen1.5 Space's /chat endpoint using the two-step
 * submit-then-poll flow Gradio's queue API requires, and normalizes the
 * response back into plain text regardless of whether the Space returns
 * a bare string or the list-of-parts message format.
 */
export async function callChatModel(
  history,
  { maxNewTokens = 256, temperature = 0.7, topP = 0.9 } = {}
) {
  if (!HF_TOKEN) {
    console.warn(
      "[aiClient] HF_TOKEN is not set — requests to a private Space will fail."
    );
  }

  // The Space's /chat signature is (message, history, max_new_tokens,
  // temperature, top_p) — send everything except the latest message as
  // history, and the latest user message as `message`.
  const lastUserMessage = history[history.length - 1];
  const priorHistory = history
    .slice(0, -1)
    .map((m) => ({ role: m.role, content: m.content }));

  const postRes = await fetch(`${SPACE_BASE_URL}/gradio_api/call/chat`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      data: [lastUserMessage.content, priorHistory, maxNewTokens, temperature, topP],
    }),
  });
  if (!postRes.ok) {
    throw new Error(`Space request failed: ${postRes.status}`);
  }
  const { event_id } = await postRes.json();

  const getRes = await fetch(`${SPACE_BASE_URL}/gradio_api/call/chat/${event_id}`, {
    headers: authHeaders(),
  });
  const text = await getRes.text();

  // The SSE body can contain multiple `event:`/`data:` lines depending
  // on buffering/timing — take the last `data:` line rather than
  // assuming a single flat block.
  const dataLine = text
    .split("\n")
    .reverse()
    .find((line) => line.startsWith("data:"));
  if (!dataLine) {
    throw new Error("No data received from Space");
  }

  const [, updatedHistory] = JSON.parse(dataLine.replace(/^data:\s*/, ""));
  const lastEntry = updatedHistory[updatedHistory.length - 1];
  return extractText(lastEntry.content);
}

/**
 * Fire-and-forget title generation. Intentionally low-effort: a short
 * prompt, small max_new_tokens, low temperature for consistency. Any
 * failure here is swallowed by the caller — a missing auto-title is
 * cosmetic and never worth failing the user's actual message over.
 */
export async function generateTitle(userMessage, assistantReply) {
  const prompt = `Summarize the topic of this exchange in 4-6 words, no punctuation, no quotes:\nUser: ${userMessage}\nAssistant: ${assistantReply}`;
  const title = await callChatModel([{ role: "user", content: prompt }], {
    maxNewTokens: 20,
    temperature: 0.3,
    topP: 0.9,
  });
  return title.replace(/["'.]/g, "").trim().slice(0, 60) || null;
}
