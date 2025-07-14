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
          <div className="text-center py-16">
            <div className="text-6xl mb-6">😞</div>
            <div className="text-rainbow-red text-xl mb-6 font-bold">
              Error: {error}
            </div>
            <div className="space-x-4">
              <button
                onClick={() => fetchDog(id as string)}
                className="
                px-6 py-3 bg-gradient-to-r from-rainbow-blue to-rainbow-indigo 
                text-white rounded-lg font-bold transform transition-all duration-300
                hover:scale-105 hover:shadow-lg hover:shadow-rainbow-blue/25
                focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:ring-offset-2 focus:ring-offset-dark-bg
              "
              >
                Try Again
              </button>
              <Link
                href="/"
                className="
                px-6 py-3 bg-gradient-to-r from-dark-elevated to-dark-border
                text-white rounded-lg font-bold transform transition-all duration-300
                hover:scale-105 hover:shadow-lg
                focus:outline-none focus:ring-2 focus:ring-dark-border focus:ring-offset-2 focus:ring-offset-dark-bg
              "
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
            <div className="text-dark-text-secondary text-xl mb-6">
              Dog not found
            </div>
            <Link
              href="/"
              className="
              px-6 py-3 bg-gradient-to-r from-rainbow-blue to-rainbow-indigo
              text-white rounded-lg font-bold transform transition-all duration-300
              hover:scale-105 hover:shadow-lg hover:shadow-rainbow-blue/25
              focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:ring-offset-2 focus:ring-offset-dark-bg
            "
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Link
                href="/"
                className="
                flex items-center space-x-2 text-rainbow-blue hover:text-white 
                font-medium transform transition-all duration-300 hover:scale-105
              "
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </Link>
              <div className="flex space-x-4">
                <Link
                  href={`/dogs/edit/${dog.id}`}
                  className="
                  px-6 py-3 bg-gradient-to-r from-rainbow-green to-rainbow-blue
                  text-white rounded-lg font-bold transform transition-all duration-300
                  hover:scale-105 hover:shadow-lg hover:shadow-rainbow-blue/25
                  focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:ring-offset-2 focus:ring-offset-dark-bg
                "
                >
                  ✏️ Edit Dog
                </Link>
                <button
                  onClick={handleDelete}
                  className="
                  px-6 py-3 bg-gradient-to-r from-rainbow-red to-rainbow-pink
                  text-white rounded-lg font-bold transform transition-all duration-300
                  hover:scale-105 hover:shadow-lg hover:shadow-rainbow-red/25
                  focus:outline-none focus:ring-2 focus:ring-rainbow-red focus:ring-offset-2 focus:ring-offset-dark-bg
                "
                >
                  🗑️ Delete Dog
                </button>
              </div>
            </div>
          </div>

          {/* Main content with rainbow border */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rainbow-red via-rainbow-blue to-rainbow-purple rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

            <div className="relative bg-dark-surface rounded-xl shadow-2xl overflow-hidden">
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
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>

                {/* Click to enlarge hint */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                  <div className="bg-dark-surface/80 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium">
                    🔍 Click to enlarge
                  </div>
                </div>
              </div>

              {/* Details section */}
              <div className="p-8">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-4xl font-bold text-white">
                      {dog.name}
                    </h1>
                    <span className="px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r from-rainbow-blue to-rainbow-indigo shadow-lg">
                      {dog.breed || 'Unknown Breed'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold rainbow-text mb-4">
                    Description
                  </h2>
                  <p className="text-dark-text-secondary leading-relaxed whitespace-pre-wrap text-lg">
                    {dog.description}
                  </p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-dark-elevated/50 backdrop-blur-sm p-6 rounded-xl border border-dark-border">
                    <h3 className="text-sm font-bold text-rainbow-green mb-3 flex items-center space-x-2">
                      <span>📅</span>
                      <span>Scraped Date</span>
                    </h3>
                    <p className="text-white text-lg">
                      {new Date(dog.scrapedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="bg-dark-elevated/50 backdrop-blur-sm p-6 rounded-xl border border-dark-border">
                    <h3 className="text-sm font-bold text-rainbow-blue mb-3 flex items-center space-x-2">
                      <span>🔄</span>
                      <span>Last Updated</span>
                    </h3>
                    <p className="text-white text-lg">
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
                <div className="border-t border-dark-border pt-8">
                  <a
                    href={dog.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                  inline-flex items-center space-x-2 px-6 py-3 
                  bg-gradient-to-r from-rainbow-green to-rainbow-blue
                  text-white rounded-lg font-bold transform transition-all duration-300
                  hover:scale-105 hover:shadow-lg hover:shadow-rainbow-green/25
                  focus:outline-none focus:ring-2 focus:ring-rainbow-green focus:ring-offset-2 focus:ring-offset-dark-surface
                "
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
                  className="absolute top-4 right-4 z-10 bg-dark-elevated/90 hover:bg-dark-surface backdrop-blur-sm rounded-full p-2 transition-all duration-200 hover-glow"
                >
                  <svg
                    className="h-6 w-6 text-white"
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
