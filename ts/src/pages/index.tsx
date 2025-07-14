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
          <div className="text-center py-20">
            <div className="w-12 h-12 mx-auto mb-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-text-secondary text-lg">Loading dogs...</p>
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
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-error rounded-full flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <div className="text-error text-xl mb-6 font-semibold">{error}</div>
            <button
              onClick={() => fetchDogs()}
              className="px-6 py-3 bg-accent text-white rounded-2xl font-medium hover:bg-accent-hover transition-all duration-200 hover:shadow-glow"
            >
              Try Again
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
        <div className="space-y-12">
          {dogs.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-24 h-24 mx-auto mb-8 bg-card rounded-full flex items-center justify-center text-4xl animate-float">
                🐕
              </div>
              <h3 className="text-3xl font-bold text-text-primary mb-4">
                No dogs yet
              </h3>
              <p className="text-text-secondary mb-12 max-w-md mx-auto text-lg">
                Start your collection by adding your first furry friend to the
                database.
              </p>
              <Link
                href="/dogs/add"
                className="inline-flex items-center px-8 py-4 bg-accent text-white rounded-2xl font-semibold hover:bg-accent-hover transition-all duration-200 hover:shadow-glow hover:-translate-y-1"
              >
                Add Your First Dog
              </Link>
            </div>
          ) : (
            <>
              {/* Floating control panel */}
              <div className="glass rounded-3xl p-8 shadow-large animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-text-primary">
                      {dogs.length} {dogs.length === 1 ? 'Dog' : 'Dogs'}
                    </h1>
                    {lastRefresh && (
                      <span className="text-text-tertiary text-sm">
                        Updated {lastRefresh.toLocaleTimeString()}
                      </span>
                    )}
                    {isRefreshing && (
                      <div className="flex items-center space-x-2 text-accent">
                        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Updating...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => fetchDogs()}
                      disabled={isRefreshing}
                      className="px-5 py-2.5 bg-surface hover:bg-elevated text-text-primary rounded-xl font-medium transition-all duration-200 disabled:opacity-50 hover:shadow-medium"
                    >
                      {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                    <Link
                      href="/dogs/add"
                      className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl font-medium transition-all duration-200 hover:shadow-glow"
                    >
                      Add Dog
                    </Link>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRefresh && autoRefreshInterval > 0}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      disabled={autoRefreshInterval === 0}
                      className="w-5 h-5 text-accent bg-surface border-2 border-elevated rounded focus:ring-accent focus:ring-2 disabled:opacity-50"
                    />
                    <span className="text-text-secondary">
                      Auto-refresh{' '}
                      {autoRefreshInterval === 0
                        ? '(disabled)'
                        : `every ${autoRefreshInterval}s`}
                    </span>
                  </label>

                  <div className="flex items-center space-x-4">
                    <span className="text-text-secondary">Sort by</span>
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
                      className="bg-surface border-2 border-elevated rounded-xl px-4 py-2 text-text-primary focus:ring-2 focus:ring-accent focus:border-accent"
                    >
                      <option value="scrapedAt">Date Scraped</option>
                      <option value="updatedAt">Date Updated</option>
                      <option value="name">Name</option>
                      <option value="breed">Breed</option>
                    </select>
                    <button
                      onClick={() =>
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                      }
                      className="w-10 h-10 bg-surface hover:bg-elevated rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-200"
                      title={`Sort ${
                        sortOrder === 'asc' ? 'descending' : 'ascending'
                      }`}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Dogs Grid with staggered animation */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedDogs.map((dog, index) => (
                  <div
                    key={dog.id}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <DogCard dog={dog} onDelete={handleDelete} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Layout>
    </>
  );
}
