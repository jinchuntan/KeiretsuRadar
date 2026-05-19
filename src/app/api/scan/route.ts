import { NextRequest, NextResponse } from 'next/server';
import { isBrightDataConfigured, fetchCompanySignals, fetchSupplierNews, fetchHiringSignals, fetchRegulatorySignals, fetchReputationSignals } from '@/lib/brightdata';
import { demoSuppliers, demoSignals, demoNetwork, demoBrief } from '@/lib/demo-data';
import { generateSupplierRiskBrief } from '@/lib/ai-analysis';
import { calculateRiskScore } from '@/lib/risk-scoring';
import { ScanResult, Supplier, WebSignal, SupplierNetwork } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query as string;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const isLive = isBrightDataConfigured();

    if (isLive) {
      // Live mode: use Bright Data to collect signals
      const suppliers = demoSuppliers; // Use demo supplier list as base
      const allSignals: WebSignal[] = [];

      for (const supplier of suppliers) {
        const [company, news, hiring, regulatory, reputation] = await Promise.all([
          fetchCompanySignals(supplier.name),
          fetchSupplierNews(supplier.name),
          fetchHiringSignals(supplier.name),
          fetchRegulatorySignals(supplier.name),
          fetchReputationSignals(supplier.name),
        ]);

        const signals = [
          ...(company || []),
          ...(news || []),
          ...(hiring || []),
          ...(regulatory || []),
          ...(reputation || []),
        ].map(s => ({ ...s, supplierId: supplier.id }));

        allSignals.push(...signals);
      }

      // If live signals came back empty, fall back to demo signals
      // This ensures charts and timelines always have data to display
      const finalSignals = allSignals.length > 0 ? allSignals : demoSignals;
      const isHybrid = allSignals.length === 0;

      // Recalculate risk scores with available data
      const liveSuppliers: Supplier[] = suppliers.map(s => {
        const supplierSignals = finalSignals.filter(sig => sig.supplierId === s.id);
        const riskScore = supplierSignals.length > 0
          ? calculateRiskScore(supplierSignals)
          : s.riskScore;
        return { ...s, riskScore, signalCount: supplierSignals.length, lastUpdated: new Date().toISOString() };
      });

      const network: SupplierNetwork = {
        centerNode: { id: 'center', name: query, type: 'query' },
        suppliers: liveSuppliers.map(s => ({
          id: s.id, name: s.name, country: s.country,
          riskLevel: s.riskScore.level, riskScore: s.riskScore.overall,
          importance: s.importance, signalCount: s.signalCount,
        })),
        edges: liveSuppliers.map(s => ({
          source: 'center', target: s.id, relationship: s.relationshipType,
        })),
      };

      const brief = await generateSupplierRiskBrief(query, liveSuppliers, finalSignals);

      const result: ScanResult = {
        id: `scan-${Date.now()}`,
        query,
        status: 'complete',
        mode: isHybrid ? 'demo' : 'live',
        suppliers: liveSuppliers,
        signals: finalSignals,
        network,
        brief,
        scanStarted: new Date().toISOString(),
        scanCompleted: new Date().toISOString(),
      };

      return NextResponse.json(result);
    } else {
      // Demo mode
      const brief = await generateSupplierRiskBrief(query, demoSuppliers, demoSignals);

      const result: ScanResult = {
        id: `scan-demo-${Date.now()}`,
        query,
        status: 'complete',
        mode: 'demo',
        suppliers: demoSuppliers,
        signals: demoSignals,
        network: { ...demoNetwork, centerNode: { ...demoNetwork.centerNode, name: query } },
        brief: brief || demoBrief,
        scanStarted: new Date().toISOString(),
        scanCompleted: new Date().toISOString(),
      };

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: 'Scan failed. Please try again.' }, { status: 500 });
  }
}
