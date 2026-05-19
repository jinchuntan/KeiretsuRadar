import { NextRequest, NextResponse } from 'next/server';
import { demoSuppliers, demoSignals } from '@/lib/demo-data';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supplier = demoSuppliers.find(s => s.id === id);

  if (!supplier) {
    return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
  }

  const signals = demoSignals.filter(s => s.supplierId === id);

  return NextResponse.json({ supplier, signals });
}
