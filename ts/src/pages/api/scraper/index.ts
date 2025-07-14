// src/pages/api/scraper/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { runScraping } from '../../../../lib/scraper';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { headless = true } = req.body;

    console.log('Starting scraping job...');
    const results = await runScraping({ headless });

    const totalScraped = Object.values(results).reduce(
      (sum: number, count: number) => sum + count,
      0
    );

    res.status(200).json({
      success: true,
      message: `Successfully scraped ${totalScraped} dogs`,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      success: false,
      error: 'Scraping failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
