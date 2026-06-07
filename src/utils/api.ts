import type { Settings, JiraTicket, GeneratedStrategy } from '../types';
import { parseJiraDescription } from './adfParser';

const BASE = import.meta.env.DEV ? '' : '';

export async function fetchJiraTicket(settings: Settings, ticketId: string): Promise<JiraTicket> {
  const res = await fetch(`${BASE}/api/jira`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jiraBaseUrl: settings.jiraBaseUrl,
      jiraEmail: settings.jiraEmail,
      jiraToken: settings.jiraToken,
      ticketId,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `JIRA error: ${res.status}`);
  return data as JiraTicket;
}

function buildRicePotPrompt(ticket: JiraTicket): string {
  const description = parseJiraDescription(ticket.fields.description);
  const labels = ticket.fields.labels?.join(', ') || 'None';
  const components = ticket.fields.components?.map(c => c.name).join(', ') || 'None';
  const priority = ticket.fields.priority?.name || 'Not specified';
  const issueType = ticket.fields.issuetype?.name || 'Story';

  // RICE-POT Prompt Structure
  return `
**ROLE:** You are a Senior QA Engineering Lead with 15+ years of experience designing enterprise-grade test strategies for software products. You are meticulous, risk-aware, and always align testing efforts with business objectives.

**INSTRUCTIONS:**
1. Analyze the provided JIRA ticket data below.
2. Generate a comprehensive, professional Test Strategy document structured across exactly 8 sections.
3. Derive all test scenarios from the actual ticket content — do NOT fabricate unrelated features.
4. Ensure every array has at least 3 specific, actionable items.
5. The schedule phases must reflect realistic QA phases: Functional, Integration, Regression, UAT, Performance, Security, Compatibility.
6. Return ONLY a valid JSON object matching the exact schema — no markdown, no preamble, no explanation.

**CONTEXT — JIRA Ticket Data:**
- Ticket ID: ${ticket.key}
- Issue Type: ${issueType}
- Priority: ${priority}
- Summary: ${ticket.fields.summary}
- Status: ${ticket.fields.status?.name || 'Open'}
- Labels: ${labels}
- Components: ${components}
- Description:
${description}

**EXAMPLE FORMAT (from enterprise ecommerce test strategy):**
- Objective: "Test end-to-end functionality, usability and performance to ensure business and technical requirements are met"
- Scope inScope: ["All customer workflows - search, browse, add to cart, checkout", "Account registration and management"]
- Focus Areas: ["Functional correctness of flows", "Performance - load, stress and scalability", "Security - vulnerabilities, encryption"]
- Approach: ["Black box and white box testing techniques", "Load testing with JMeter for 1000+ concurrent users", "Security testing for OWASP Top 10"]
- Deliverables: ["Functional test cases and reports", "Automation regression suite", "Security vulnerabilities report"]

**PARAMETERS:**
- Enterprise-grade quality, production-ready language
- Specific to this ticket's domain and technical context
- Proportional depth: simple tickets get concise strategies, complex tickets get comprehensive ones
- Risk items must be specific, not generic ("Delay in environment setup", "Missing acceptance criteria for edge cases")
- teamSize should be realistic (e.g., "3-5 QA Engineers"), duration realistic (e.g., "3-4 weeks")

**OUTPUT — Return ONLY this JSON structure (no other text):**
{
  "ticketId": "${ticket.key}",
  "ticketSummary": "${ticket.fields.summary.replace(/"/g, '\\"')}",
  "generatedAt": "${new Date().toISOString()}",
  "strategy": {
    "objective": "string — one clear sentence stating the testing goal for this specific ticket",
    "scope": {
      "inScope": ["string", "string", "string"],
      "outOfScope": ["string", "string"]
    },
    "focusAreas": ["string", "string", "string", "string"],
    "approach": ["string", "string", "string", "string"],
    "deliverables": ["string", "string", "string", "string"],
    "teamAndSchedule": {
      "teamSize": "string",
      "duration": "string",
      "schedule": [
        { "phase": "string", "activities": "string" }
      ]
    },
    "entryExitCriteria": {
      "entryCriteria": ["string", "string"],
      "exitCriteria": ["string", "string"]
    },
    "risks": ["string", "string", "string"]
  }
}

**TONE:** Technical, precise, enterprise-grade. No fluff. No preamble. Pure JSON only.
`.trim();
}

export async function generateTestStrategy(
  settings: Settings,
  ticket: JiraTicket
): Promise<GeneratedStrategy> {
  const prompt = buildRicePotPrompt(ticket);

  const res = await fetch(`${BASE}/api/groq`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      groqApiKey: settings.groqApiKey,
      groqModel: settings.groqModel,
      messages: [
        {
          role: 'system',
          content: 'You are an expert QA Engineering Lead. You generate structured test strategy documents in valid JSON format only. Never include markdown, explanations, or text outside the JSON object.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `GROQ error: ${res.status}`);

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('GROQ returned empty response');

  try {
    const parsed = JSON.parse(content);
    if (!parsed.strategy) throw new Error('Response missing strategy field');
    return parsed as GeneratedStrategy;
  } catch {
    // Retry: try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.strategy) return parsed as GeneratedStrategy;
    }
    throw new Error('GROQ returned invalid JSON. Please try again.');
  }
}
