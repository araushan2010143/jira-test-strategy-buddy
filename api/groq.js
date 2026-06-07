export const config = { runtime: 'edge' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const { groqApiKey: bodyKey, groqModel: bodyModel, messages } = body;

  // Prefer values sent from UI; fall back to server-side env vars
  const groqApiKey = bodyKey   || globalThis.process?.env?.GROQ_API_KEY;
  const model      = bodyModel || globalThis.process?.env?.GROQ_MODEL || 'openai/gpt-oss-120b';

  if (!groqApiKey || !messages) {
    return new Response(JSON.stringify({ error: 'Missing groqApiKey or messages' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return new Response(JSON.stringify({
        error: data.error?.message || `GROQ returned ${groqRes.status}`,
        status: groqRes.status,
      }), {
        status: groqRes.status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to reach GROQ API' }), {
      status: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
}
