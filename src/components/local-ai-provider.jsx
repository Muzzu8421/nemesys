"use client"
// src/components/local-ai-provider.jsx
//
// Enrichment strategy, in priority order:
//
//   1. Ollama (localhost:11434) — if the user has it running, we get real
//      generative explanations at native speed, no browser inference tax.
//   2. Deterministic templates — always available, 0ms latency, covers
//      every user regardless of what's installed. This is the *default*
//      render, not a last-resort fallback — findings should never sit
//      unexplained waiting on a model.
//   3. BYOK (Groq / OpenAI / Anthropic) — opt-in upgrade for users who
//      want richer explanations and don't mind a cloud call using their
//      own key.
//
// Deliberately NOT included: any in-browser model (WebLLM, Transformers.js
// WASM/WebGPU). On weak/shared-memory iGPUs (e.g. Vega 3) WebGPU is prone
// to driver crashes, and the WASM fallback is 5-10x slower than native
// inference even on strong hardware — neither gives a usable result here.

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { getTemplate, getStepNarrative } from "@/core/ai/templates";

const LocalAiContext = createContext(null);

const OLLAMA_BASE_URL = "http://localhost:11434";
const OLLAMA_PROBE_TIMEOUT_MS = 1500;
const OLLAMA_MODEL = "qwen2.5:1.5b"; // small + fast; swap via settings if desired

const BYOK_STORAGE_KEY = "nemesys:byok"; // { provider, apiKey } — session-only, see note below

export function LocalAiProvider({ children }) {
  // 'checking' | 'ollama' | 'templates' | 'byok'
  const [source, setSource] = useState("checking");
  const [ollamaError, setOllamaError] = useState(null);
  const [byokConfig, setByokConfig] = useState(null); // { provider, apiKey } | null
  const probedRef = useRef(false);

  // Probe for a local Ollama instance once on mount. Non-blocking — the
  // dashboard renders findings via templates immediately regardless of
  // outcome; this just upgrades the source if it succeeds.
  useEffect(() => {
    if (probedRef.current) return;
    probedRef.current = true;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OLLAMA_PROBE_TIMEOUT_MS);

    fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Ollama responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const hasModel = data?.models?.some((m) => m.name?.startsWith(OLLAMA_MODEL.split(":")[0]));
        if (!hasModel) {
          setOllamaError(
            `Ollama is running but "${OLLAMA_MODEL}" isn't pulled. Run: ollama pull ${OLLAMA_MODEL}`
          );
          setSource("templates");
          return;
        }
        setSource("ollama");
      })
      .catch(() => {
        // Not running, CORS-blocked, or timed out — templates cover this silently.
        setSource("templates");
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const setByok = useCallback((provider, apiKey) => {
    if (!provider || !apiKey) {
      setByokConfig(null);
      sessionStorage.removeItem(BYOK_STORAGE_KEY);
      return;
    }
    // Session-only storage: an API key surviving in localStorage across
    // sessions on a shared/low-end machine is a bigger risk than the
    // inconvenience of re-entering it. Still visible to any XSS on the
    // page, so this is a "trusted user's own key," not a secrets vault.
    const config = { provider, apiKey };
    sessionStorage.setItem(BYOK_STORAGE_KEY, JSON.stringify(config));
    setByokConfig(config);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(BYOK_STORAGE_KEY);
    if (stored) {
      try {
        setByokConfig(JSON.parse(stored));
      } catch {
        sessionStorage.removeItem(BYOK_STORAGE_KEY);
      }
    }
  }, []);

  // Returns { text, source } for a given finding. Never throws — always
  // resolves to at least a template explanation.
  const explain = useCallback(
    async (finding, { preferByok = false } = {}) => {
      if (preferByok && byokConfig) {
        try {
          return { text: await explainViaByok(finding, byokConfig), source: "byok" };
        } catch (err) {
          console.warn("BYOK explanation failed, falling back to template:", err);
          return { text: getTemplate(finding), source: "templates" };
        }
      }

      if (source === "ollama") {
        try {
          return { text: await explainViaOllama(finding), source: "ollama" };
        } catch (err) {
          console.warn("Ollama call failed mid-session, falling back to template:", err);
          return { text: getTemplate(finding), source: "templates" };
        }
      }

      return { text: getTemplate(finding), source: "templates" };
    },
    [source, byokConfig]
  );

  // Per-step narration for the attack simulation view. Always resolves
  // instantly to the template narrative first; callers that want richer
  // prose can await the AI-enriched version separately and swap it in
  // without blocking the animation.
  const explainStep = useCallback(
    async (finding, index, { preferByok = false } = {}) => {
      const fallback = getStepNarrative(finding, index);
      if (!fallback) return null;

      const usingAi = preferByok ? !!byokConfig : source === "ollama";
      if (!usingAi) return fallback;

      const prompt = buildStepPrompt(finding, index, fallback);
      try {
        const text =
          preferByok && byokConfig
            ? await explainViaByok({ ...finding, _stepPrompt: prompt }, byokConfig)
            : await explainViaOllama({ ...finding, _stepPrompt: prompt });
        return { ...fallback, text: text || fallback.text };
      } catch (err) {
        console.warn(`Step ${index} AI enrichment failed, using template:`, err);
        return fallback;
      }
    },
    [source, byokConfig]
  );

  return (
    <LocalAiContext.Provider
      value={{ source, ollamaError, byokConfig, setByok, explain, explainStep }}
    >
      {children}
    </LocalAiContext.Provider>
  );
}

export function useLocalAi() {
  const ctx = useContext(LocalAiContext);
  if (!ctx) {
    throw new Error("useLocalAi must be used within a LocalAiProvider");
  }
  return ctx;
}

// --- Ollama ---------------------------------------------------------------

async function explainViaOllama(finding) {
  const prompt = buildPrompt(finding);
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { num_predict: 220 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama generate failed: ${res.status}`);
  const data = await res.json();
  return data.response?.trim();
}

// --- BYOK -------------------------------------------------------------------
// Note: calling provider APIs directly from the browser with a user-supplied
// key works for Groq/OpenAI (both allow browser CORS), but exposes the key
// in network tab and to any injected script. Fine for a "your key, your risk"
// power-user opt-in; if you want it hidden entirely, proxy through
// /api/scan/explain instead and never let the key touch the client.

async function explainViaByok(finding, { provider, apiKey }) {
  const prompt = buildPrompt(finding);

  if (provider === "groq") {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      }),
    });
    if (!res.ok) throw new Error(`Groq call failed: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim();
  }

  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI call failed: ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim();
  }

  if (provider === "anthropic") {
    // Anthropic's API does not allow direct browser calls (no CORS
    // allowance for arbitrary origins) — this must go through a thin
    // server proxy (e.g. /api/scan/explain) that attaches the header
    // and forwards the key server-side per request.
    const res = await fetch("/api/scan/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey, prompt }),
    });
    if (!res.ok) throw new Error(`Anthropic proxy call failed: ${res.status}`);
    const data = await res.json();
    return data.text?.trim();
  }

  throw new Error(`Unknown BYOK provider: ${provider}`);
}

// --- shared prompt ----------------------------------------------------------

function buildPrompt(finding) {
  if (finding._stepPrompt) return finding._stepPrompt;
  const path = finding.path || [];
  return [
    `Explain this ${finding.vulnerability_type} finding to a developer in 3-4 sentences.`,
    `Be specific about the actual risk, not generic.`,
    ``,
    `File: ${path[0]?.file || "unknown"}`,
    `Path: ${path.map((p) => `[${p.type}] ${p.line}: ${p.snippet}`).join(" -> ")}`,
  ].join("\n");
}

function buildStepPrompt(finding, index, fallback) {
  return [
    `You are narrating one step of a ${finding.vulnerability_type} attack, from the attacker's point of view.`,
    `Write ONE sentence, punchy and specific, present tense. No preamble.`,
    ``,
    `Step role: ${fallback.role} (source = entry point, hop = intermediate flow, sink = where it detonates)`,
    `Code at this step: ${fallback.snippet}`,
    `Line: ${fallback.line}`,
    `Template baseline (improve on this, don't just repeat it): "${fallback.text}"`,
  ].join("\n");
}
