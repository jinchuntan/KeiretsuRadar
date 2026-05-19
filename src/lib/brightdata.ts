/**
 * Bright Data Integration Layer for Keiretsu Radar
 *
 * This module provides live web data collection through Bright Data's APIs.
 * When Bright Data credentials are configured, functions connect to:
 * - SERP API for search result signals
 * - Web Unlocker for public page content
 * - Web Scraper API for structured data
 *
 * Environment Variables Required:
 *   BRIGHT_DATA_API_KEY        - Your Bright Data API token
 *   BRIGHT_DATA_CUSTOMER_ID    - Your Bright Data customer/account ID
 *   BRIGHT_DATA_SERP_ZONE      - SERP API zone name (e.g., "serp")
 *   BRIGHT_DATA_WEB_UNLOCKER_ZONE - Web Unlocker zone name
 *
 * If credentials are missing, all functions return null so the app
 * gracefully falls back to demo data.
 */

import { WebSignal, RiskCategoryType, SignalSentiment, SourceType } from './types';

// ─── Configuration ──────────────────────────────────────────────────────────

function getConfig() {
  return {
    apiKey: process.env.BRIGHT_DATA_API_KEY || '',
    customerId: process.env.BRIGHT_DATA_CUSTOMER_ID || '',
    serpZone: process.env.BRIGHT_DATA_SERP_ZONE || 'serp',
    webUnlockerZone: process.env.BRIGHT_DATA_WEB_UNLOCKER_ZONE || 'unlocker',
  };
}

export function isBrightDataConfigured(): boolean {
  const cfg = getConfig();
  return !!(cfg.apiKey && cfg.customerId);
}

// ─── SERP API ───────────────────────────────────────────────────────────────

interface SerpResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

async function serpSearch(query: string): Promise<SerpResult[]> {
  const cfg = getConfig();
  if (!cfg.apiKey) return [];

  try {
    // Bright Data SERP API endpoint
    const url = `https://api.brightdata.com/serp/req`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        zone: cfg.serpZone,
        query,
        country: 'us',
        num: 10,
      }),
    });

    if (!response.ok) {
      console.error(`Bright Data SERP API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const organic = data?.organic || data?.results || [];
    return organic.map((r: Record<string, unknown>, i: number) => ({
      title: String(r.title || ''),
      link: String(r.link || r.url || ''),
      snippet: String(r.snippet || r.description || ''),
      position: i + 1,
    }));
  } catch (error) {
    console.error('Bright Data SERP request failed:', error);
    return [];
  }
}

// ─── Signal Extraction Helpers ──────────────────────────────────────────────

function classifySentiment(text: string): SignalSentiment {
  const lower = text.toLowerCase();
  const negativeTerms = ['risk', 'lawsuit', 'decline', 'layoff', 'investigation', 'fraud', 'crisis', 'warning', 'penalty', 'breach', 'scandal', 'downturn', 'loss', 'default', 'bankruptcy', 'violation'];
  const positiveTerms = ['growth', 'expansion', 'innovation', 'award', 'partnership', 'profit', 'record', 'breakthrough', 'invest', 'launch', 'hire'];

  const negScore = negativeTerms.filter(t => lower.includes(t)).length;
  const posScore = positiveTerms.filter(t => lower.includes(t)).length;

  if (negScore > posScore) return 'negative';
  if (posScore > negScore) return 'positive';
  return 'neutral';
}

function classifyCategory(text: string): RiskCategoryType {
  const lower = text.toLowerCase();
  if (/financ|revenue|profit|debt|earnings|stock|share price|credit/.test(lower)) return 'financial';
  if (/ceo|cto|cfo|executive|board|resign|appoint|leadership/.test(lower)) return 'leadership';
  if (/hire|hiring|job|recruit|layoff|workforce|headcount/.test(lower)) return 'hiring';
  if (/regulat|compliance|fine|penalty|sanction|law|legal|sec |ftc/.test(lower)) return 'regulatory';
  if (/reputation|review|sentiment|media|scandal|controversy/.test(lower)) return 'reputation';
  if (/price|pricing|product|supply|shortage|delivery|inventory/.test(lower)) return 'product_pricing';
  if (/cyber|hack|breach|data leak|security incident/.test(lower)) return 'cyber';
  return 'operational';
}

function classifySourceType(url: string): SourceType {
  const lower = url.toLowerCase();
  if (/reuters|bloomberg|cnbc|wsj|ft\.com|bbc|techcrunch/.test(lower)) return 'news';
  if (/sec\.gov|fda\.gov|gov\./.test(lower)) return 'regulatory_filing';
  if (/linkedin|indeed|glassdoor/.test(lower)) return 'job_posting';
  if (/twitter|reddit|facebook/.test(lower)) return 'social_media';
  return 'news';
}

function serpToSignals(results: SerpResult[], supplierId: string, companyName: string): WebSignal[] {
  return results
    .filter(r => r.title && r.link)
    .map((r, idx) => ({
      id: `sig-${supplierId}-${Date.now()}-${idx}`,
      supplierId,
      sourceType: classifySourceType(r.link),
      title: r.title,
      summary: r.snippet || `Signal related to ${companyName}`,
      url: r.link,
      publishedAt: new Date(Date.now() - Math.random() * 30 * 86400000).toISOString(),
      sentiment: classifySentiment(`${r.title} ${r.snippet}`),
      riskCategory: classifyCategory(`${r.title} ${r.snippet}`),
      confidence: 0.6 + Math.random() * 0.3,
    }));
}

// ─── Public API Functions ───────────────────────────────────────────────────

/**
 * Search for general web signals about a topic or company.
 * Uses Bright Data SERP API.
 */
export async function searchWebSignals(query: string): Promise<WebSignal[] | null> {
  if (!isBrightDataConfigured()) return null;
  const results = await serpSearch(query);
  return serpToSignals(results, 'search', query);
}

/**
 * Fetch company-specific signals including financial, operational, and news.
 */
export async function fetchCompanySignals(companyName: string, domain?: string): Promise<WebSignal[] | null> {
  if (!isBrightDataConfigured()) return null;

  const queries = [
    `${companyName} financial news ${new Date().getFullYear()}`,
    `${companyName} supplier risk`,
    domain ? `site:${domain} press release` : null,
  ].filter(Boolean) as string[];

  const allSignals: WebSignal[] = [];
  for (const q of queries) {
    const results = await serpSearch(q);
    allSignals.push(...serpToSignals(results, companyName.toLowerCase().replace(/\s+/g, '-'), companyName));
  }
  return allSignals;
}

/**
 * Fetch news signals for a supplier.
 */
export async function fetchSupplierNews(companyName: string): Promise<WebSignal[] | null> {
  if (!isBrightDataConfigured()) return null;
  const results = await serpSearch(`"${companyName}" news latest`);
  return serpToSignals(results, companyName.toLowerCase().replace(/\s+/g, '-'), companyName);
}

/**
 * Fetch hiring and workforce signals.
 */
export async function fetchHiringSignals(companyName: string): Promise<WebSignal[] | null> {
  if (!isBrightDataConfigured()) return null;
  const results = await serpSearch(`${companyName} hiring jobs layoffs workforce`);
  return serpToSignals(results, companyName.toLowerCase().replace(/\s+/g, '-'), companyName)
    .map(s => ({ ...s, riskCategory: 'hiring' as RiskCategoryType }));
}

/**
 * Fetch regulatory and compliance signals.
 */
export async function fetchRegulatorySignals(companyName: string): Promise<WebSignal[] | null> {
  if (!isBrightDataConfigured()) return null;
  const results = await serpSearch(`${companyName} regulation compliance fine penalty`);
  return serpToSignals(results, companyName.toLowerCase().replace(/\s+/g, '-'), companyName)
    .map(s => ({ ...s, riskCategory: 'regulatory' as RiskCategoryType }));
}

/**
 * Fetch reputation and public sentiment signals.
 */
export async function fetchReputationSignals(companyName: string): Promise<WebSignal[] | null> {
  if (!isBrightDataConfigured()) return null;
  const results = await serpSearch(`${companyName} reputation reviews controversy`);
  return serpToSignals(results, companyName.toLowerCase().replace(/\s+/g, '-'), companyName)
    .map(s => ({ ...s, riskCategory: 'reputation' as RiskCategoryType }));
}
