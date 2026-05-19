import { NextRequest, NextResponse } from 'next/server';
import { demoSuppliers, demoSignals, demoBrief } from '@/lib/demo-data';
import { generateSupplierRiskBrief } from '@/lib/ai-analysis';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query || 'Supplier Risk Analysis';
    const suppliers = body.suppliers || demoSuppliers;
    const signals = body.signals || demoSignals;

    const brief = await generateSupplierRiskBrief(query, suppliers, signals);
    return NextResponse.json(brief);
  } catch {
    return NextResponse.json(demoBrief);
  }
}
