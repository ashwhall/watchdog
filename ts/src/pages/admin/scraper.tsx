// src/pages/admin/scraper.tsx
import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Layout from '../../components/Layout';

interface ScraperStatus {
  stats: {
    total: number;
    unclassified: number;
    classified: number;
    scrapedToday: number;
  };
  recentDogs: Array<{
    id: number;
    name: string;
    breed: string;
    postUrl: string;
    imageUrl: string;
    scrapedAt: Date;
  }>;
}

interface ScraperResult {
  success: boolean;
  message: string;
  results: { [key: string]: number };
}

export default function ScraperAdmin() {
  const [status, setStatus] = useState<ScraperStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ScraperResult | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/scraper/status');
      const data = await response.json();
      if (data.success) {
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const runScraper = async () => {
    setIsLoading(true);
    setLastResult(null);

    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ headless: true }),
      });

      const data = await response.json();
      setLastResult(data);

      if (data.success) {
        // Refresh status after successful scraping
        await fetchStatus();
      }
    } catch (error) {
      console.error('Scraping failed:', error);
      setLastResult({
        success: false,
        message: 'Network error',
        results: {},
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Watchdog - Admin Scraper</title>
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-8 rainbow-text">
            🔧 Dog Scraper Admin
          </h1>

          {/* Controls */}
          <div className="bg-dark-surface rounded-lg shadow-2xl border border-dark-border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Controls</h2>
            <div className="flex gap-4">
              <button
                onClick={runScraper}
                disabled={isLoading}
                className="bg-gradient-to-r from-rainbow-blue to-rainbow-purple hover:from-rainbow-purple hover:to-rainbow-pink disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              >
                {isLoading ? 'Scraping...' : 'Start Scraping'}
              </button>

              <button
                onClick={fetchStatus}
                className="bg-gradient-to-r from-rainbow-green to-rainbow-cyan hover:from-rainbow-cyan hover:to-rainbow-blue text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105"
              >
                Refresh Status
              </button>
            </div>
          </div>

          {/* Last Result */}
          {lastResult && (
            <div className="bg-dark-surface rounded-lg shadow-2xl border border-dark-border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Last Scraping Result
              </h2>
              <div
                className={`p-4 rounded-lg ${
                  lastResult.success
                    ? 'bg-dark-elevated border border-rainbow-green text-rainbow-green'
                    : 'bg-dark-elevated border border-rainbow-red text-rainbow-red'
                }`}
              >
                <p className="font-medium">{lastResult.message}</p>
                {lastResult.success && lastResult.results && (
                  <div className="mt-2">
                    <p className="text-sm text-dark-text-secondary">
                      Results by site:
                    </p>
                    <ul className="text-sm ml-4 text-dark-text-secondary">
                      {Object.entries(lastResult.results).map(
                        ([site, count]) => (
                          <li key={site}>
                            {site}: {count} dogs
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          {status && (
            <div className="bg-dark-surface rounded-lg shadow-2xl border border-dark-border p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Database Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-dark-elevated border border-rainbow-blue rounded-lg">
                  <div className="text-2xl font-bold text-rainbow-blue">
                    {status.stats.total}
                  </div>
                  <div className="text-sm text-dark-text-secondary">
                    Total Dogs
                  </div>
                </div>
                <div className="text-center p-4 bg-dark-elevated border border-rainbow-green rounded-lg">
                  <div className="text-2xl font-bold text-rainbow-green">
                    {status.stats.classified}
                  </div>
                  <div className="text-sm text-dark-text-secondary">
                    Classified
                  </div>
                </div>
                <div className="text-center p-4 bg-dark-elevated border border-rainbow-yellow rounded-lg">
                  <div className="text-2xl font-bold text-rainbow-yellow">
                    {status.stats.unclassified}
                  </div>
                  <div className="text-sm text-dark-text-secondary">
                    Unclassified
                  </div>
                </div>
                <div className="text-center p-4 bg-dark-elevated border border-rainbow-purple rounded-lg">
                  <div className="text-2xl font-bold text-rainbow-purple">
                    {status.stats.scrapedToday}
                  </div>
                  <div className="text-sm text-dark-text-secondary">
                    Scraped Today
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Dogs */}
          {status && status.recentDogs.length > 0 && (
            <div className="bg-dark-surface rounded-lg shadow-2xl border border-dark-border p-6">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Recently Scraped Dogs
              </h2>
              <div className="grid gap-4">
                {status.recentDogs.map((dog) => (
                  <div
                    key={dog.id}
                    className="flex items-center space-x-4 p-4 border border-dark-border rounded-lg bg-dark-elevated hover:bg-dark-surface transition-colors"
                  >
                    <Image
                      src={dog.imageUrl}
                      alt={dog.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-dog.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{dog.name}</h3>
                      <p className="text-sm text-dark-text-secondary">
                        {dog.breed || 'Unclassified'}
                      </p>
                      <p className="text-xs text-dark-text-secondary">
                        Scraped: {new Date(dog.scrapedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={dog.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-rainbow-blue hover:text-rainbow-cyan text-sm transition-colors"
                    >
                      View Post →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!status && (
            <div className="text-center py-8">
              <p className="text-dark-text-secondary">
                Click &ldquo;Refresh Status&rdquo; to load data
              </p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
