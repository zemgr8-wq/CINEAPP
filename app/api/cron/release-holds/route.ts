import { NextRequest, NextResponse } from 'next/server';
import { releaseAllExpiredHolds } from '@/lib/booking-store';

export const dynamic = 'force-static';

export async function GET(req: NextRequest) {
  const result = releaseAllExpiredHolds();
  return NextResponse.json({
    success: true,
    message: `Released ${result.releasedCount} expired seat holds idempotently.`,
    releasedCount: result.releasedCount,
    timestamp: new Date().toISOString()
  });
}
