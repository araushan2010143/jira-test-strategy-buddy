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

  const {
    jiraBaseUrl: bodyUrl,
    jiraEmail: bodyEmail,
    jiraToken: bodyToken,
    ticketId,
  } = body;

  // Prefer values sent from UI; fall back to server-side env vars
  const jiraEmail   = bodyEmail   || globalThis.process?.env?.JIRA_EMAIL;
  const jiraToken   = bodyToken   || globalThis.process?.env?.JIRA_TOKEN;
  const jiraBaseUrl = bodyUrl     || globalThis.process?.env?.JIRA_BASE_URL;

  if (!jiraBaseUrl || !jiraEmail || !jiraToken || !ticketId) {
    return new Response(JSON.stringify({ error: 'Missing required fields: jiraBaseUrl, jiraEmail, jiraToken, ticketId' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const base = jiraBaseUrl.replace(/\/$/, '');
  const credentials = btoa(`${jiraEmail}:${jiraToken}`);
  const url = `${base}/rest/api/3/issue/${ticketId}`;

  try {
    const jiraRes = await fetch(url, {
      headers: {
        Authorization: `Basic ${credentials}`,
        Accept: 'application/json',
      },
    });

    const data = await jiraRes.json();

    if (!jiraRes.ok) {
      return new Response(JSON.stringify({
        error: data.errorMessages?.[0] || data.message || `JIRA returned ${jiraRes.status}`,
        status: jiraRes.status,
      }), {
        status: jiraRes.status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Failed to reach JIRA' }), {
      status: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
}
