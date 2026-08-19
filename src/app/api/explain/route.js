import { NextResponse } from "next/server";

const HF_SPACE_URL = "https://skmuzakkir750-nemesys-ai.hf.space";
const SUBMIT_TIMEOUT_MS = 45_000; // generous for ZeroGPU cold starts
const RESULT_TIMEOUT_MS = 60_000; // generation can be slow on free tier

export async function POST(request) {
  const token = process.env.HF_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "AI explanation service not configured. Set HF_TOKEN in your environment." },
      { status: 501 }
    );
  }

  let finding;
  try {
    finding = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const prompt = buildPrompt(finding);

  try {
    // ── Step 1: submit the job ──────────────────────────────────────────
    const submitRes = await fetch(`${HF_SPACE_URL}/gradio_api/call/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // JSON.stringify handles any quotes / backslashes in code snippets
      body: JSON.stringify({
        data: [prompt, [], 300, 0.5, 0.9],
        //      msg   history max_new_tokens temperature top_p
      }),
      signal: AbortSignal.timeout(SUBMIT_TIMEOUT_MS),
    });

    if (!submitRes.ok) {
      const detail = await submitRes.text().catch(() => "");
      return NextResponse.json(
        { error: `AI service returned ${submitRes.status}${detail ? ": " + detail.slice(0, 200) : ""}` },
        { status: 502 }
      );
    }

    const submitData = await submitRes.json();
    const eventId = submitData?.event_id;
    if (!eventId) {
      return NextResponse.json(
        { error: "AI service did not return an event ID." },
        { status: 502 }
      );
    }

    // ── Step 2: read the SSE result ─────────────────────────────────────
    const resultRes = await fetch(
      `${HF_SPACE_URL}/gradio_api/call/chat/${eventId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(RESULT_TIMEOUT_MS),
      }
    );

    if (!resultRes.ok) {
      return NextResponse.json(
        { error: `AI result fetch failed with status ${resultRes.status}.` },
        { status: 502 }
      );
    }

    const sseText = await resultRes.text();
    const explanation = parseSSEResponse(sseText);

    if (!explanation) {
      return NextResponse.json(
        { error: "Failed to parse AI response — the model may not have returned usable output." },
        { status: 502 }
      );
    }

    return NextResponse.json({ explanation });
  } catch (err) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      return NextResponse.json(
        { error: "AI service timed out — the model may be warming up. Try again in a moment." },
        { status: 504 }
      );
    }
    console.error("[/api/explain]", err);
    return NextResponse.json(
      { error: "Failed to generate explanation: " + err.message },
      { status: 500 }
    );
  }
}

// ── Prompt builder ──────────────────────────────────────────────────────

function buildPrompt(finding) {
  const source = (finding.path || []).find((p) => p.type === "source");
  const sink =
    (finding.path || []).find((p) => p.type === "sink") ||
    (finding.path || []).at(-1);

  const lines = [
    `Explain this security vulnerability in plain terms: ${finding.vulnerability_type}.`,
  ];

  if (source) {
    lines.push(`Source: ${source.snippet} (line ${source.line} in ${source.file})`);
  }
  if (sink) {
    lines.push(`Sink: ${sink.snippet} (line ${sink.line} in ${sink.file})`);
  }

  lines.push(`Severity: ${finding.severity}`);
  lines.push("");
  lines.push("Why it's dangerous: Explain in 1-2 sentences why this specific flow is dangerous.");
  lines.push("How to fix it: Suggest the preferred remediation approach (e.g. parameterized queries, input validation).");

  return lines.join("\n");
}

// ── SSE parser ──────────────────────────────────────────────────────────

function parseSSEResponse(sseText) {
  // Gradio SSE: lines like "event: complete\ndata: [\"...\", ...]\n\n"
  // We want the payload from the last "data:" line.
  const lines = sseText.split("\n");
  let lastData = null;

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      lastData = line.slice(6);
    }
  }

  if (!lastData) return null;

  try {
    const parsed = JSON.parse(lastData);

    // Gradio ChatInterface returns [updated_textbox, chat_history]
    // The history is an array of messages: [{role: "user", content: ...}, {role: "assistant", content: ...}]
    const chatHistory = Array.isArray(parsed) && Array.isArray(parsed[1]) ? parsed[1] : null;
    
    if (chatHistory && chatHistory.length > 0) {
      // Find the last assistant message
      const lastAssistantMsg = [...chatHistory].reverse().find(msg => msg.role === "assistant");
      if (lastAssistantMsg && lastAssistantMsg.content) {
        const content = lastAssistantMsg.content;
        
        // Handle string content
        if (typeof content === "string") return content.trim();
        
        // Handle array of parts [{type: "text", text: "..."}]
        if (Array.isArray(content)) {
          return content
            .map(part => typeof part === "string" ? part : (part?.text || ""))
            .join("")
            .trim();
        }
      }
    }

    // Fallback parsing just in case it returns the raw string differently
    const content = Array.isArray(parsed) ? parsed[0] : parsed;
    if (typeof content === "string" && content.trim() !== "") return content.trim();
    if (Array.isArray(content)) {
      return content.map((part) => (typeof part === "string" ? part : part?.text || "")).join("").trim();
    }
    if (content && typeof content === "object" && content.text) {
      return content.text.trim();
    }

    return null;
  } catch {
    // If it's not valid JSON, treat the raw text as the response
    return lastData.trim() || null;
  }
}
