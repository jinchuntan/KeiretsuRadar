export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type RiskCategoryType =
  | 'financial'
  | 'operational'
  | 'leadership'
  | 'hiring'
  | 'regulatory'
  | 'reputation'
  | 'product_pricing'
  | 'cyber';

export type SignalSentiment = 'positive' | 'neutral' | 'negative';

export type SourceType =
  | 'news'
  | 'regulatory_filing'
  | 'job_posting'
  | 'social_media'
  | 'financial_report'
  | 'press_release'
  | 'industry_report'
  | 'government'
  | 'review';

export interface EvidenceSource {
  title: string;
  url: string;
  sourceType: SourceType;
  dateFound: string;
  snippet: string;
}

export interface WebSignal {
  id: string;
  supplierId: string;
  sourceType: SourceType;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  sentiment: SignalSentiment;
  riskCategory: RiskCategoryType;
  confidence: number;
}

export interface RiskCategory {
  category: RiskCategoryType;
  score: number;
  label: string;
  signals: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RiskScore {
  overall: number;
  level: RiskLevel;
  categories: RiskCategory[];
  explanation: string;
  lastCalculated: string;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  industry: string;
  website: string;
  relationshipType: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  riskScore: RiskScore;
  lastUpdated: string;
  description: string;
  signalCount: number;
}

export interface SupplierNode {
  id: string;
  name: string;
  country: string;
  riskLevel: RiskLevel;
  riskScore: number;
  importance: string;
  signalCount: number;
}

export interface SupplierEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface SupplierNetwork {
  centerNode: { id: string; name: string; type: string };
  suppliers: SupplierNode[];
  edges: SupplierEdge[];
}

export interface IntelligenceBrief {
  id: string;
  generatedAt: string;
  query: string;
  executiveSummary: string;
  topRisks: { title: string; description: string; severity: RiskLevel; supplier: string }[];
  topOpportunities: { title: string; description: string; supplier: string }[];
  recommendedActions: string[];
  monitoringFrequency: string;
  confidenceLevel: number;
  supplierCount: number;
  signalCount: number;
}

export interface ScanResult {
  id: string;
  query: string;
  status: 'running' | 'complete' | 'error';
  mode: 'live' | 'demo';
  suppliers: Supplier[];
  signals: WebSignal[];
  network: SupplierNetwork;
  brief: IntelligenceBrief;
  scanStarted: string;
  scanCompleted?: string;
}

export interface ScanProgress {
  stage: string;
  progress: number;
  message: string;
}
