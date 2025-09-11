export async function askAI({ prompt, model = "gpt-4.1-mini" }) {
  const resp = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 500
    })
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || "AI request failed");
  }
  const data = await resp.json();
  return data.text;
}
