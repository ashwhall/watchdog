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
          <div className="text-center py-20">
            <div className="w-12 h-12 mx-auto mb-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            <p className="text-text-secondary text-lg">Loading dog...</p>
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
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-error rounded-full flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <div className="text-error text-xl mb-6 font-semibold">
              Error: {error || 'Dog not found'}
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-accent text-white rounded-2xl font-medium hover:bg-accent-hover transition-all duration-200 hover:shadow-glow"
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
          <div className="glass rounded-3xl p-6 mb-8">
            <h1 className="text-3xl font-bold text-text-primary">
              ✏️ Edit Dog
            </h1>
            <p className="text-text-secondary text-lg">
              Update {dog.name}&apos;s information
            </p>
          </div>

          <div className="glass rounded-3xl p-8">
            <DogForm
              dog={dog}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </Layout>
    </>
  );
}
