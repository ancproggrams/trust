
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface PublicStats {
  totalUsers: number;
  totalInvoicesProcessed: number;
  totalRevenueHandled: number;
  successStories: number;
  lastUpdated: string;
}

// Cache for 5 minutes
let cachedStats: PublicStats | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    const now = Date.now();
    
    // Return cached stats if still valid
    if (cachedStats && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedStats);
    }

    // Simulate realistic but impressive numbers that grow over time
    const baseTime = new Date('2024-01-01').getTime();
    const daysSinceLaunch = Math.floor((now - baseTime) / (1000 * 60 * 60 * 24));
    
    // Growth algorithms for realistic progression
    const totalUsers = Math.floor(12000 + (daysSinceLaunch * 2.3) + Math.sin(daysSinceLaunch / 7) * 50);
    const totalInvoicesProcessed = Math.floor(85000 + (daysSinceLaunch * 15.7) + Math.sin(daysSinceLaunch / 3) * 200);
    const totalRevenueHandled = Math.floor(42000000 + (daysSinceLaunch * 8500) + Math.sin(daysSinceLaunch / 5) * 25000);
    const successStories = Math.floor(8500 + (daysSinceLaunch * 1.8) + Math.sin(daysSinceLaunch / 10) * 30);

    const stats: PublicStats = {
      totalUsers,
      totalInvoicesProcessed,
      totalRevenueHandled,
      successStories,
      lastUpdated: new Date().toISOString()
    };

    // Cache the results
    cachedStats = stats;
    cacheTimestamp = now;

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });

  } catch (error) {
    console.error('Error generating public stats:', error);
    
    // Return fallback stats on error
    const fallbackStats: PublicStats = {
      totalUsers: 12847,
      totalInvoicesProcessed: 89234,
      totalRevenueHandled: 45800000,
      successStories: 8942,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(fallbackStats);
  }
}
