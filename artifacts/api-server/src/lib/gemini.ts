/**
 * Direct Gemini API client using the user's own GEMINI_API_KEY.
 *
 * The Replit-managed Gemini AI integration requires an account upgrade the
 * user declined, so this calls Google's Generative Language API directly
 * with a user-supplied key rather than going through
 * `@workspace/integrations-gemini-ai`'s Replit-proxy credentials.
 */
export async function generateGeminiText(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini request failed (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Gemini returned an empty response");
  }
  return text;
}
