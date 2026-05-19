import { NextResponse } from 'next/server';
import { demoSuppliers, demoSignals, demoNetwork, demoBrief } from '@/lib/demo-data';
import { ScanResult } from '@/lib/types';

export async function GET() {
  const result: ScanResult = {
    id: 'scan-demo-preset',
    query: 'EV Battery Supply Chain Risk Scan',
    status: 'complete',
    mode: 'demo',
    suppliers: demoSuppliers,
    signals: demoSignals,
    network: demoNetwork,
    brief: demoBrief,
    scanStarted: new Date().toISOString(),
    scanCompleted: new Date().toISOString(),
  };

  return NextResponse.json(result);
}
