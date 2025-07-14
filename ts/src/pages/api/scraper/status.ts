// src/pages/api/scraper/status.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../../lib/db';
import { dogs } from '../../../../lib/schema';
import { desc, count, isNull, gte } from 'drizzle-orm';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get total count
    const totalResult = await db.select({ count: count() }).from(dogs);
    const total = totalResult[0]?.count || 0;

    // Get count without breed classification
    const unclassifiedResult = await db
      .select({ count: count() })
      .from(dogs)
      .where(isNull(dogs.breed));
    const unclassified = unclassifiedResult[0]?.count || 0;

    // Get recent dogs
    const recentDogs = await db
      .select()
      .from(dogs)
      .orderBy(desc(dogs.scrapedAt))
      .limit(10);

    // Get stats by scraped date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayResult = await db
      .select({ count: count() })
      .from(dogs)
      .where(gte(dogs.scrapedAt, today));
    const scrapedToday = todayResult[0]?.count || 0;

    res.status(200).json({
      success: true,
      stats: {
        total,
        unclassified,
        classified: total - unclassified,
        scrapedToday,
      },
      recentDogs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scraper status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
