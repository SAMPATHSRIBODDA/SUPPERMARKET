import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { status: 'ok', message: 'API is working!' },
    { status: 200 }
  );
}

export const dynamic = 'force-dynamic';
