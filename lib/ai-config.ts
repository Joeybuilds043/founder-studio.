import "server-only";

export function getAIConfig() {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();

  if (provider === "gemini") {
    return {
      provider,
      apiKey: process.env.GEMINI_API_KEY || "",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
    };
  }

  if (provider === "openai") {
    return {
      provider,
      apiKey: process.env.OPENAI_API_KEY || "",
      baseURL: "https://api.openai.com/v1/",
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }

  throw new Error("Unsupported AI_PROVIDER. Use gemini or openai.");
}
