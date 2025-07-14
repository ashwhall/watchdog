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
          <div className="glass rounded-3xl p-6 mb-8">
            <h1 className="text-3xl font-bold text-text-primary">
              🔧 Dog Scraper Admin
            </h1>
          </div>

          {/* Controls */}
          <div className="glass rounded-3xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">
              Controls
            </h2>
            <div className="flex gap-4">
              <button
                onClick={runScraper}
                disabled={isLoading}
                className="px-6 py-3 bg-accent text-white rounded-2xl font-medium hover:bg-accent-hover disabled:opacity-50 transition-all duration-200 hover:shadow-glow"
              >
                {isLoading ? 'Scraping...' : 'Start Scraping'}
              </button>

              <button
                onClick={fetchStatus}
                className="px-6 py-3 bg-surface hover:bg-elevated text-text-primary rounded-2xl font-medium transition-all duration-200 hover:shadow-medium"
              >
                Refresh Status
              </button>
            </div>
          </div>

          {/* Last Result */}
          {lastResult && (
            <div className="glass rounded-3xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-text-primary">
                Last Scraping Result
              </h2>
              <div
                className={`p-4 rounded-2xl ${
                  lastResult.success
                    ? 'bg-green-900/20 border border-green-500/30 text-green-400'
                    : 'bg-red-900/20 border border-red-500/30 text-red-400'
                }`}
              >
                <p className="font-medium">{lastResult.message}</p>
                {lastResult.success && lastResult.results && (
                  <div className="mt-2">
                    <p className="text-sm text-text-secondary">
                      Results by site:
                    </p>
                    <ul className="text-sm ml-4 text-text-secondary">
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
            <div className="glass rounded-3xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-text-primary">
                Database Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 glass-light rounded-2xl">
                  <div className="text-2xl font-bold text-accent">
                    {status.stats.total}
                  </div>
                  <div className="text-sm text-text-secondary">Total Dogs</div>
                </div>
                <div className="text-center p-4 glass-light rounded-2xl">
                  <div className="text-2xl font-bold text-green-400">
                    {status.stats.classified}
                  </div>
                  <div className="text-sm text-text-secondary">Classified</div>
                </div>
                <div className="text-center p-4 glass-light rounded-2xl">
                  <div className="text-2xl font-bold text-amber-400">
                    {status.stats.unclassified}
                  </div>
                  <div className="text-sm text-text-secondary">
                    Unclassified
                  </div>
                </div>
                <div className="text-center p-4 glass-light rounded-2xl">
                  <div className="text-2xl font-bold text-purple-400">
                    {status.stats.scrapedToday}
                  </div>
                  <div className="text-sm text-text-secondary">
                    Scraped Today
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Dogs */}
          {status && status.recentDogs.length > 0 && (
            <div className="glass rounded-3xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-text-primary">
                Recently Scraped Dogs
              </h2>
              <div className="grid gap-4">
                {status.recentDogs.map((dog) => (
                  <div
                    key={dog.id}
                    className="flex items-center space-x-4 p-4 glass-light rounded-2xl hover:bg-card/50 transition-colors"
                  >
                    <Image
                      src={dog.imageUrl}
                      alt={dog.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded-xl"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-dog.jpg';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-text-primary">
                        {dog.name}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {dog.breed || 'Unclassified'}
                      </p>
                      <p className="text-xs text-text-tertiary">
                        Scraped: {new Date(dog.scrapedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={dog.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent-hover text-sm transition-colors"
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
              <p className="text-text-secondary">
                Click &ldquo;Refresh Status&rdquo; to load data
              </p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
