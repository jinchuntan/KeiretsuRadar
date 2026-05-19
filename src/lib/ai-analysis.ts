import { Supplier, WebSignal, IntelligenceBrief } from './types';

/**
 * Generate an AI-powered supplier risk brief using OpenAI or Anthropic.
 * Falls back to deterministic summary if no AI key is available.
 */
export async function generateSupplierRiskBrief(
  query: string,
  suppliers: Supplier[],
  signals: WebSignal[]
): Promise<IntelligenceBrief> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (openaiKey) {
    return generateWithOpenAI(query, suppliers, signals, openaiKey);
  }
  if (anthropicKey) {
    return generateWithAnthropic(query, suppliers, signals, anthropicKey);
  }
  return generateDeterministicBrief(query, suppliers, signals);
}

// ─── OpenAI Integration ─────────────────────────────────────────────────────

async function generateWithOpenAI(
  query: string,
  suppliers: Supplier[],
  signals: WebSignal[],
  apiKey: string
): Promise<IntelligenceBrief> {
  try {
    const prompt = buildPrompt(query, suppliers, signals);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an enterprise supply chain risk analyst. Return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return formatAIResponse(query, suppliers, signals, parsed);
  } catch (error) {
    console.error('OpenAI generation failed, using fallback:', error);
    return generateDeterministicBrief(query, suppliers, signals);
  }
}

// ─── Anthropic Integration ──────────────────────────────────────────────────

async function generateWithAnthropic(
  query: string,
  suppliers: Supplier[],
  signals: WebSignal[],
  apiKey: string
): Promise<IntelligenceBrief> {
  try {
    const prompt = buildPrompt(query, suppliers, signals);
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
        system: 'You are an enterprise supply chain risk analyst. Return valid JSON only, no markdown.',
      }),
    });

    if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
    const data = await response.json();
    const text = data.content[0].text;
    const parsed = JSON.parse(text);
    return formatAIResponse(query, suppliers, signals, parsed);
  } catch (error) {
    console.error('Anthropic generation failed, using fallback:', error);
    return generateDeterministicBrief(query, suppliers, signals);
  }
}

// ─── Prompt Builder ─────────────────────────────────────────────────────────

function buildPrompt(query: string, suppliers: Supplier[], signals: WebSignal[]): string {
  const supplierSummary = suppliers.map(s =>
    `- ${s.name} (${s.country}, ${s.industry}): Risk ${s.riskScore.overall}/100 [${s.riskScore.level}]`
  ).join('\n');

  const signalSummary = signals.slice(0, 20).map(s =>
    `- [${s.sentiment}] ${s.title}: ${s.summary}`
  ).join('\n');

  return `Analyze this supplier risk scan and produce a JSON intelligence brief.

Query: "${query}"

Suppliers:
${supplierSummary}

Key Signals (${signals.length} total):
${signalSummary}

Return JSON with these fields:
{
  "executiveSummary": "2-3 sentence executive summary",
  "topRisks": [{"title": "...", "description": "...", "severity": "high|medium|low", "supplier": "..."}],
  "topOpportunities": [{"title": "...", "description": "...", "supplier": "..."}],
  "recommendedActions": ["action1", "action2", ...],
  "monitoringFrequency": "recommendation string",
  "confidenceLevel": 0.0-1.0
}

Provide exactly 3 risks, 3 opportunities, and 4-6 actions.`;
}

// ─── Response Formatter ─────────────────────────────────────────────────────

function formatAIResponse(
  query: string,
  suppliers: Supplier[],
  signals: WebSignal[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsed: any
): IntelligenceBrief {
  return {
    id: `brief-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    query,
    executiveSummary: parsed.executiveSummary || '',
    topRisks: (parsed.topRisks || []).slice(0, 3),
    topOpportunities: (parsed.topOpportunities || []).slice(0, 3),
    recommendedActions: parsed.recommendedActions || [],
    monitoringFrequency: parsed.monitoringFrequency || 'Weekly',
    confidenceLevel: parsed.confidenceLevel || 0.75,
    supplierCount: suppliers.length,
    signalCount: signals.length,
  };
}

// ─── Deterministic Fallback ─────────────────────────────────────────────────

function generateDeterministicBrief(
  query: string,
  suppliers: Supplier[],
  signals: WebSignal[]
): IntelligenceBrief {
  const highRisk = suppliers.filter(s => s.riskScore.level === 'high');
  const medRisk = suppliers.filter(s => s.riskScore.level === 'medium');
  const lowRisk = suppliers.filter(s => s.riskScore.level === 'low');
  const negSignals = signals.filter(s => s.sentiment === 'negative');
  const posSignals = signals.filter(s => s.sentiment === 'positive');

  const summary = `Analysis of ${suppliers.length} suppliers reveals ${highRisk.length} high-risk, ${medRisk.length} medium-risk, and ${lowRisk.length} low-risk entities. ${negSignals.length} negative signals and ${posSignals.length} positive signals detected across ${signals.length} total web data points.`;

  const risks = highRisk.slice(0, 3).map(s => {
    const topCat = s.riskScore.categories.sort((a, b) => b.score - a.score)[0];
    return {
      title: `${topCat.label} concern at ${s.name}`,
      description: s.riskScore.explanation,
      severity: s.riskScore.level,
      supplier: s.name,
    };
  });

  const opportunities = posSignals.slice(0, 3).map(s => {
    const supplier = suppliers.find(sup => sup.id === s.supplierId);
    return {
      title: s.title,
      description: s.summary,
      supplier: supplier?.name || 'Unknown',
    };
  });

  const actions = [
    ...highRisk.map(s => `Review contingency plans for ${s.name} (Risk: ${s.riskScore.overall}/100)`),
    ...medRisk.slice(0, 2).map(s => `Increase monitoring frequency for ${s.name}`),
    'Update supplier risk dashboard and brief stakeholders',
  ];

  return {
    id: `brief-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    query,
    executiveSummary: summary,
    topRisks: risks,
    topOpportunities: opportunities,
    recommendedActions: actions.slice(0, 6),
    monitoringFrequency: highRisk.length > 0
      ? 'Daily monitoring for high-risk suppliers. Weekly for others.'
      : 'Weekly monitoring recommended.',
    confidenceLevel: 0.72,
    supplierCount: suppliers.length,
    signalCount: signals.length,
  };
}
