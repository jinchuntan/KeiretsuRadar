import { NextResponse } from 'next/server';
import { demoSuppliers } from '@/lib/demo-data';

export async function GET() {
  return NextResponse.json({ suppliers: demoSuppliers });
}
