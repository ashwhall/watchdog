import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout';
import DogCard from '../components/DogCard';
import { Dog } from '../../lib/schema';

export default function Home() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30);
  const [sortBy, setSortBy] = useState<
    'name' | 'breed' | 'scrapedAt' | 'updatedAt'
  >('scrapedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchDogs();
    fetchAutoRefreshInterval();
  }, []);

  const fetchAutoRefreshInterval = async () => {
    try {
      const response = await fetch('/api/settings?key=autoRefreshInterval');
      if (response.ok) {
        const data = await response.json();
        const interval = parseInt(data.value || '30');
        setAutoRefreshInterval(interval);
        // If interval is 0, disable auto-refresh
        if (interval === 0) {
          setAutoRefresh(false);
        }
      }
    } catch (error) {
      console.error('Error fetching auto-refresh interval:', error);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    console.log('Auto-refresh effect triggered', {
      autoRefresh,
      autoRefreshInterval,
    });

    if (!autoRefresh || autoRefreshInterval === 0) {
      console.log('Auto-refresh disabled');
      return;
    }

    console.log(
      `Setting up auto-refresh interval: ${autoRefreshInterval} seconds`
    );

    const interval = setInterval(() => {
      console.log(
        'Auto-refresh triggered at:',
        new Date().toLocaleTimeString()
      );
      fetchDogs(true); // true indicates this is an auto-refresh
    }, autoRefreshInterval * 1000); // Convert seconds to milliseconds

    return () => {
      console.log('Cleaning up auto-refresh interval');
      clearInterval(interval);
    };
  }, [autoRefresh, autoRefreshInterval]);

  const fetchDogs = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      console.log('Fetching dogs...', {
        isAutoRefresh,
        timestamp: new Date().toISOString(),
      });

      const response = await fetch('/api/dogs');
      if (!response.ok) {
        throw new Error('Failed to fetch dogs');
      }
      const data = await response.json();
      setDogs(data);

      const now = new Date();
      setLastRefresh(now);
      console.log(
        'Dogs fetched, last refresh set to:',
        now.toLocaleTimeString()
      );

      setError(null);
    } catch (err) {
      console.error('Error fetching dogs:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/dogs/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete dog');
      }
      setDogs(dogs.filter((dog) => dog.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete dog');
    }
  };

  const sortedDogs = [...dogs].sort((a, b) => {
    let aValue: string | number | Date;
    let bValue: string | number | Date;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'breed':
        aValue = (a.breed || '').toLowerCase();
        bValue = (b.breed || '').toLowerCase();
        break;
      case 'scrapedAt':
        aValue = new Date(a.scrapedAt);
        bValue = new Date(b.scrapedAt);
        break;
      case 'updatedAt':
        aValue = new Date(a.updatedAt);
        bValue = new Date(b.updatedAt);
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <>
        <Head>
          <title>Watchdog</title>
        </Head>
        <Layout>
          <div className="text-center py-16">
            <div className="relative mx-auto w-32 h-32 mb-8">
              {/* Rainbow spinning loader */}
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-rainbow-red via-rainbow-blue to-rainbow-purple animate-spin"
                style={{
                  background:
                    'conic-gradient(from 0deg, #ff6b6b, #ffa726, #ffeb3b, #66bb6a, #42a5f5, #7e57c2, #ab47bc, #ff6b6b)',
                  mask: 'radial-gradient(circle at center, transparent 50%, black 50%)',
                  WebkitMask:
                    'radial-gradient(circle at center, transparent 50%, black 50%)',
                }}
              ></div>
              <div className="absolute inset-2 bg-dark-bg rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                🐕
              </div>
            </div>
            <p className="text-xl rainbow-text font-bold">
              Loading our furry friends...
            </p>
          </div>
        </Layout>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Watchdog - Error</title>
        </Head>
        <Layout>
          <div className="text-center py-16">
            <div className="text-6xl mb-6">😞</div>
            <div className="text-rainbow-red text-xl mb-6 font-bold">
              Error: {error}
            </div>
            <button
              onClick={() => fetchDogs()}
              className="
              px-6 py-3 bg-gradient-to-r from-rainbow-red to-rainbow-pink 
              text-white rounded-lg font-bold transform transition-all duration-300
              hover:scale-105 hover:shadow-lg hover:shadow-rainbow-red/25
              focus:outline-none focus:ring-2 focus:ring-rainbow-red focus:ring-offset-2 focus:ring-offset-dark-bg
            "
            >
              Try Again 🔄
            </button>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Watchdog</title>
      </Head>
      <Layout>
        <div className="space-y-8">
          {dogs.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative inline-block">
                <div className="text-8xl mb-6">🐕</div>
                <div className="absolute -top-2 -right-2 text-2xl">✨</div>
                <div className="absolute -bottom-2 -left-2 text-2xl">💫</div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                No pups found yet!
              </h3>
              <p className="text-dark-text-secondary mb-8 max-w-md mx-auto text-lg">
                Start building your dog database by adding your first furry
                friend.
              </p>
              <Link
                href="/dogs/add"
                className="
                inline-flex items-center space-x-2 px-8 py-4 
                bg-gradient-to-r from-rainbow-purple to-rainbow-pink
                text-white rounded-xl font-bold transform transition-all duration-300
                hover:scale-105 hover:shadow-xl hover:shadow-rainbow-purple/25
                focus:outline-none focus:ring-2 focus:ring-rainbow-purple focus:ring-offset-2 focus:ring-offset-dark-bg
              "
              >
                <span>🎉</span>
                <span>Add Your First Dog</span>
                <span>🐾</span>
              </Link>
            </div>
          ) : (
            <>
              {/* Combined Header and Controls Section */}
              <div className="relative">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-rainbow-red/10 via-rainbow-blue/10 to-rainbow-purple/10 rounded-2xl blur-xl"></div>

                <div className="relative bg-dark-surface/50 backdrop-blur-sm rounded-2xl p-8 border border-dark-border">
                  {/* Status indicators */}
                  <div className="flex items-center space-x-6 text-dark-text-secondary mb-6">
                    {lastRefresh && (
                      <span className="flex items-center space-x-2 text-sm bg-dark-elevated px-3 py-1 rounded-full">
                        <span>🕐</span>
                        <span>
                          Last updated: {lastRefresh.toLocaleTimeString()}
                        </span>
                      </span>
                    )}
                    {isRefreshing && (
                      <span className="flex items-center space-x-2 text-sm text-rainbow-blue bg-dark-elevated px-3 py-1 rounded-full">
                        <svg
                          className="animate-spin h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Updating database...</span>
                      </span>
                    )}
                  </div>

                  {/* Main controls */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                      <span className="flex items-center space-x-2 text-lg font-medium text-white">
                        <span>🐾</span>
                        <span>{dogs.length} pups in database</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={autoRefresh && autoRefreshInterval > 0}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            disabled={autoRefreshInterval === 0}
                            className="
                            mr-3 w-5 h-5 text-rainbow-blue bg-dark-elevated border-dark-border 
                            rounded focus:ring-rainbow-blue focus:ring-2 disabled:opacity-50
                          "
                          />
                          <span className="text-sm text-dark-text-secondary group-hover:text-white transition-colors duration-300">
                            ✨ Auto-refresh{' '}
                            {autoRefreshInterval === 0
                              ? '(disabled)'
                              : `(${autoRefreshInterval}s)`}
                          </span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-dark-text-secondary">
                          Sort by:
                        </span>
                        <select
                          value={sortBy}
                          onChange={(e) =>
                            setSortBy(
                              e.target.value as
                                | 'name'
                                | 'breed'
                                | 'scrapedAt'
                                | 'updatedAt'
                            )
                          }
                          className="
                          bg-dark-elevated border border-dark-border rounded-lg px-3 py-2 
                          text-white focus:ring-2 focus:ring-rainbow-blue focus:border-rainbow-blue
                          transition-all duration-300
                        "
                        >
                          <option value="scrapedAt">📅 Date Scraped</option>
                          <option value="updatedAt">🔄 Date Updated</option>
                          <option value="name">🏷️ Name</option>
                          <option value="breed">🐕 Breed</option>
                        </select>
                        <button
                          onClick={() =>
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                          }
                          className="
                          px-3 py-2 bg-dark-elevated border border-dark-border rounded-lg
                          text-rainbow-blue hover:text-white hover:bg-rainbow-blue
                          transition-all duration-300 font-bold
                        "
                          title={`Sort ${
                            sortOrder === 'asc' ? 'descending' : 'ascending'
                          }`}
                        >
                          {sortOrder === 'asc' ? '⬆️' : '⬇️'}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => fetchDogs()}
                        disabled={isRefreshing}
                        className="
                        flex items-center space-x-2 px-4 py-2 
                        bg-gradient-to-r from-rainbow-indigo to-rainbow-purple
                        text-white rounded-lg font-medium transform transition-all duration-300
                        hover:scale-105 hover:shadow-lg hover:shadow-rainbow-purple/25
                        disabled:opacity-50 disabled:cursor-not-allowed
                        focus:outline-none focus:ring-2 focus:ring-rainbow-purple focus:ring-offset-2 focus:ring-offset-dark-bg
                      "
                      >
                        {isRefreshing ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Refreshing...</span>
                          </>
                        ) : (
                          <>
                            <span>🔄</span>
                            <span>Refresh</span>
                          </>
                        )}
                      </button>
                      <Link
                        href="/dogs/add"
                        className="
                        px-6 py-3 bg-gradient-to-r from-rainbow-green to-rainbow-blue
                        text-white rounded-lg font-bold transform transition-all duration-300
                        hover:scale-105 hover:shadow-lg hover:shadow-rainbow-blue/25
                        focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:ring-offset-2 focus:ring-offset-dark-bg
                      "
                      >
                        ➕ Add New Dog
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dogs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedDogs.map((dog) => (
                  <DogCard key={dog.id} dog={dog} onDelete={handleDelete} />
                ))}
              </div>
            </>
          )}
        </div>
      </Layout>
    </>
  );
}
