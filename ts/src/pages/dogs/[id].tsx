import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import Layout from '../../components/Layout';
import { Dog } from '../../../lib/schema';

export default function ViewDog() {
  const router = useRouter();
  const { id } = router.query;
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDog(id as string);
    }
  }, [id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const fetchDog = async (dogId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/dogs/${dogId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Dog not found');
        }
        throw new Error('Failed to fetch dog');
      }
      const data = await response.json();
      setDog(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!dog || !confirm('Are you sure you want to delete this dog?')) {
      return;
    }

    try {
      const response = await fetch(`/api/dogs/${dog.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete dog');
      }
      router.push('/');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete dog');
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Watchdog - Loading Dog</title>
        </Head>
        <Layout>
          <div className="text-center py-20">
            <div className="w-12 h-12 mx-auto mb-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-text-secondary text-lg">
              Loading dog details...
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
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-error rounded-full flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <div className="text-error text-xl mb-6 font-semibold">{error}</div>
            <div className="space-x-4">
              <button
                onClick={() => fetchDog(id as string)}
                className="px-6 py-3 bg-accent text-white rounded-2xl font-medium hover:bg-accent-hover transition-all duration-200 hover:shadow-glow"
              >
                Try Again
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-surface hover:bg-elevated text-text-primary rounded-2xl font-medium transition-all duration-200 hover:shadow-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </Layout>
      </>
    );
  }

  if (!dog) {
    return (
      <>
        <Head>
          <title>Watchdog - Dog Not Found</title>
        </Head>
        <Layout>
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🐕</div>
            <div className="text-text-secondary text-xl mb-6">
              Dog not found
            </div>
            <Link
              href="/"
              className="px-6 py-3 bg-accent text-white rounded-2xl font-medium hover:bg-accent-hover transition-all duration-200 hover:shadow-glow"
            >
              Back to Home
            </Link>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Watchdog - {dog.name}</title>
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto">
          {/* Header with navigation */}
          <div className="glass rounded-3xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="flex items-center space-x-2 text-accent hover:text-accent-hover font-medium transition-all duration-200"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </Link>
              <div className="flex space-x-4">
                <Link
                  href={`/dogs/edit/${dog.id}`}
                  className="px-6 py-3 bg-accent text-white rounded-2xl font-medium hover:bg-accent-hover transition-all duration-200 hover:shadow-glow"
                >
                  ✏️ Edit Dog
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 bg-error text-white rounded-2xl font-medium hover:bg-red-600 transition-all duration-200 hover:shadow-glow"
                >
                  🗑️ Delete Dog
                </button>
              </div>
            </div>
          </div>

          {/* Main content with glassmorphism */}
          <div className="glass rounded-3xl overflow-hidden">
            {/* Image section */}
            <div
              className="relative h-96 w-full cursor-pointer overflow-hidden group/image"
              onClick={() => setIsModalOpen(true)}
            >
              <Image
                src={dog.imageUrl}
                alt={dog.name}
                fill
                className="object-cover transition-transform duration-500 group-hover/image:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>

              {/* Click to enlarge hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                <div className="glass px-4 py-2 rounded-2xl text-text-primary font-medium">
                  🔍 Click to enlarge
                </div>
              </div>
            </div>

            {/* Details section */}
            <div className="p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-4xl font-bold text-text-primary">
                    {dog.name}
                  </h1>
                  <span className="px-4 py-2 bg-accent text-white rounded-full text-sm font-medium">
                    {dog.breed || 'Unknown Breed'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-accent mb-4">
                  Description
                </h2>
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-lg">
                  {dog.description}
                </p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="glass-light p-6 rounded-2xl">
                  <h3 className="text-sm font-bold text-accent mb-3 flex items-center space-x-2">
                    <span>📅</span>
                    <span>Scraped Date</span>
                  </h3>
                  <p className="text-text-primary text-lg">
                    {new Date(dog.scrapedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="glass-light p-6 rounded-2xl">
                  <h3 className="text-sm font-bold text-accent mb-3 flex items-center space-x-2">
                    <span>🔄</span>
                    <span>Last Updated</span>
                  </h3>
                  <p className="text-text-primary text-lg">
                    {new Date(dog.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Original post link */}
              <div className="border-t border-border pt-8">
                <a
                  href={dog.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-accent text-white rounded-2xl font-medium hover:bg-accent-hover transition-all duration-200 hover:shadow-glow"
                >
                  <span>🔗</span>
                  <span>View Original Post</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Image Modal */}
          {isModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
              onClick={() => setIsModalOpen(false)}
            >
              <div className="relative max-w-7xl max-h-full">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 z-10 glass hover:glass-hover rounded-full p-2 transition-all duration-200"
                >
                  <svg
                    className="h-6 w-6 text-text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div
                  className="relative max-h-[90vh] max-w-[90vw]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={dog.imageUrl}
                    alt={dog.name}
                    width={1200}
                    height={800}
                    className="object-contain max-h-[90vh] w-auto h-auto"
                    sizes="90vw"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}
