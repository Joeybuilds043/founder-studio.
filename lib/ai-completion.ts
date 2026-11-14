import "server-only";

type ChatOptions = {
  apiKey: string;
  baseURL: string;
  model: string;
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" };
};

const OPENROUTER_FREE_FALLBACKS = [
  "nvidia/nemotron-3.5-lightning:free",
  "google/gemma-4-31b-it:free",
  "recursive/flint-v1.0:free"
];

function extractText(message: any): string {
  const content = message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content.map((part: any) => {
      if (typeof part === "string") return part;
      if (typeof part?.text === "string") return part.text;
      return "";
    }).filter(Boolean).join("\n").trim();
  }
  return "";
}

export async function completeChat(options: ChatOptions): Promise<{ text: string; model: string }> {
  const isOpenRouter = options.baseURL.includes("openrouter.ai");
  const models = [...new Set([
    options.model,
    ...(isOpenRouter ? OPENROUTER_FREE_FALLBACKS : [])
  ].filter(Boolean))];
  let lastFailure = "No model returned usable text.";

  for (const model of models) {
    try {
      const response = await fetch(`${options.baseURL}chat/completions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${options.apiKey}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(55000),
        body: JSON.stringify({
          model,
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 2500,
          ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
          messages: [
            { role: "system", content: options.system },
            { role: "user", content: options.user }
          ]
        })
      });
      const raw = await response.text();
      let payload: any = null;
      try { payload = raw ? JSON.parse(raw) : null; } catch {
        lastFailure = `${model}: invalid provider payload (HTTP ${response.status}).`;
        continue;
      }
      if (!response.ok) {
        const detail = typeof payload?.error?.message === "string" ? payload.error.message.slice(0, 240) : `HTTP ${response.status}`;
        lastFailure = `${model}: ${detail}`;
        if ([400, 401, 402, 403].includes(response.status)) {
          if ([401, 402, 403].includes(response.status)) break;
        }
        continue;
      }
      const choice = payload?.choices?.[0];
      const text = extractText(choice?.message);
      if (text) return { text, model };
      lastFailure = `${model}: empty content (finish reason: ${String(choice?.finish_reason || "unknown")}).`;
    } catch (error) {
      lastFailure = `${model}: ${error instanceof Error ? error.message : "request failed"}`;
    }
  }
  throw new Error(`No configured AI model returned text. Tried ${models.join(", ")}. Last issue: ${lastFailure}`);
}
