import { WebSignal, RiskScore, RiskLevel, RiskCategory, RiskCategoryType } from './types';

const RISK_CATEGORY_LABELS: Record<RiskCategoryType, string> = {
  financial: 'Financial Health',
  operational: 'Operational Stability',
  leadership: 'Leadership Changes',
  hiring: 'Hiring Momentum',
  regulatory: 'Regulatory & Compliance',
  reputation: 'Reputation & Sentiment',
  product_pricing: 'Product & Pricing',
  cyber: 'Cyber Exposure',
};

const RISK_WEIGHTS: Record<RiskCategoryType, number> = {
  financial: 0.20,
  leadership: 0.15,
  hiring: 0.15,
  regulatory: 0.15,
  reputation: 0.15,
  product_pricing: 0.10,
  operational: 0.05,
  cyber: 0.05,
};

function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function calculateCategoryScore(signals: WebSignal[], category: RiskCategoryType): { score: number; trend: 'up' | 'down' | 'stable' } {
  const catSignals = signals.filter(s => s.riskCategory === category);
  if (catSignals.length === 0) return { score: 0, trend: 'stable' };

  const negativeCount = catSignals.filter(s => s.sentiment === 'negative').length;
  const positiveCount = catSignals.filter(s => s.sentiment === 'positive').length;
  const totalCount = catSignals.length;

  const negativePct = negativeCount / totalCount;
  const avgConfidence = catSignals.reduce((sum, s) => sum + s.confidence, 0) / totalCount;

  const rawScore = negativePct * 100 * avgConfidence;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (negativeCount > positiveCount + 1) trend = 'up';
  else if (positiveCount > negativeCount + 1) trend = 'down';

  return { score, trend };
}

function generateExplanation(categories: RiskCategory[], overallScore: number): string {
  const highRisk = categories.filter(c => c.score >= 60).sort((a, b) => b.score - a.score);
  const level = getRiskLevel(overallScore);

  if (highRisk.length === 0) {
    return `Overall risk is ${level}. No significant risk signals detected across monitored categories.`;
  }

  const topCats = highRisk.slice(0, 2).map(c => c.label.toLowerCase()).join(' and ');
  return `Elevated risk detected in ${topCats}. ${highRisk.length} categor${highRisk.length === 1 ? 'y' : 'ies'} showing concerning signal patterns. Recommend increased monitoring.`;
}

export function calculateRiskScore(signals: WebSignal[]): RiskScore {
  const allCategories: RiskCategoryType[] = ['financial', 'operational', 'leadership', 'hiring', 'regulatory', 'reputation', 'product_pricing', 'cyber'];

  const categories: RiskCategory[] = allCategories.map(cat => {
    const { score, trend } = calculateCategoryScore(signals, cat);
    const catSignals = signals.filter(s => s.riskCategory === cat);
    return {
      category: cat,
      score,
      label: RISK_CATEGORY_LABELS[cat],
      signals: catSignals.length,
      trend,
    };
  });

  // Source confidence factor
  const avgConfidence = signals.length > 0
    ? signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length
    : 0.5;

  let weightedScore = 0;
  for (const cat of categories) {
    const weight = RISK_WEIGHTS[cat.category] || 0.05;
    weightedScore += cat.score * weight;
  }
  // Apply source confidence (10% weight)
  weightedScore = weightedScore * 0.9 + (1 - avgConfidence) * 100 * 0.1;

  const overall = Math.min(100, Math.max(0, Math.round(weightedScore)));
  const level = getRiskLevel(overall);
  const explanation = generateExplanation(categories, overall);

  return {
    overall,
    level,
    categories,
    explanation,
    lastCalculated: new Date().toISOString(),
  };
}
