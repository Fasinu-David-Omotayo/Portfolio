// A server error (a timeout, a crash before any response body is sent,
// a cold-start hiccup on a serverless function) can result in a response
// that isn't valid JSON, or has no body at all. Calling res.json()
// directly on that throws a cryptic browser error - "Unexpected end of
// JSON input" - that gives no clue what actually happened.
//
// This wraps that safely: on success, returns the parsed JSON as normal.
// On failure, returns a fallback object with a genuinely useful message
// instead of letting the raw parse error reach the user.
export async function safeJson(res) {
  const text = await res.text();
  if (!text) {
    return { error: `The server sent back an empty response (status ${res.status}). This is usually a temporary server error - try again in a moment.` };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { error: `The server sent back an unexpected response (status ${res.status}). Try again, and if it keeps happening, check the Vercel deployment logs.` };
  }
}
