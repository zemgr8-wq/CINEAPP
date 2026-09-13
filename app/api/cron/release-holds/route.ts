import { NextRequest, NextResponse } from 'next/server';
import { releaseAllExpiredHolds } from '@/lib/booking-store';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'cinebook-cron-dev-secret';

  // Verify Vercel Cron or Bearer secret
  if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }
  }

  const result = releaseAllExpiredHolds();
  return NextResponse.json({
    success: true,
    message: `Released ${result.releasedCount} expired seat holds idempotently.`,
    releasedCount: result.releasedCount,
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  return GET(req);
}
