import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../../components/Layout';
import DogForm, { DogFormData } from '../../../components/DogForm';
import { Dog } from '../../../../lib/schema';

export default function EditDog() {
  const router = useRouter();
  const { id } = router.query;
  const [dog, setDog] = useState<Dog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchDog();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDog = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dogs/${id}`);
      if (!response.ok) {
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

  const handleSubmit = async (data: DogFormData) => {
    try {
      const response = await fetch(`/api/dogs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update dog');
      }

      router.push('/');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to update dog');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Watchdog - Edit Dog</title>
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
            <p className="text-xl rainbow-text font-bold">Loading dog...</p>
          </div>
        </Layout>
      </>
    );
  }

  if (error || !dog) {
    return (
      <>
        <Head>
          <title>Watchdog - Edit Dog</title>
        </Head>
        <Layout>
          <div className="text-center py-16">
            <div className="text-6xl mb-6">😞</div>
            <div className="text-rainbow-red text-xl mb-6 font-bold">
              Error: {error || 'Dog not found'}
            </div>
            <button
              onClick={() => router.push('/')}
              className="
                px-6 py-3 bg-gradient-to-r from-rainbow-blue to-rainbow-indigo
                text-white rounded-lg font-bold transform transition-all duration-300
                hover:scale-105 hover:shadow-lg hover:shadow-rainbow-blue/25
                focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:ring-offset-2 focus:ring-offset-dark-bg
              "
            >
              Back to Dashboard
            </button>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Watchdog - Edit {dog.name}</title>
      </Head>
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold rainbow-text">✏️ Edit Dog</h1>
            <p className="text-dark-text-secondary text-lg">
              Update {dog.name}&apos;s information
            </p>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rainbow-green via-rainbow-blue to-rainbow-indigo rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

            <div className="relative bg-dark-surface rounded-xl shadow-2xl p-8 border border-dark-border">
              <DogForm
                dog={dog}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
