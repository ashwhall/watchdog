import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import DogForm, { DogFormData } from '../../components/DogForm';

export default function AddDog() {
  const router = useRouter();

  const handleSubmit = async (data: DogFormData) => {
    try {
      const response = await fetch('/api/dogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create dog');
      }

      router.push('/');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create dog');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>Watchdog - Add Dog</title>
      </Head>
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-3xl p-6 mb-8">
            <h1 className="text-3xl font-bold text-text-primary">
              🐕 Add New Dog
            </h1>
            <p className="text-text-secondary text-lg">
              Add a new dog to your watchlist
            </p>
          </div>

          <div className="glass rounded-3xl p-8">
            <DogForm onSubmit={handleSubmit} onCancel={handleCancel} />
          </div>
        </div>
      </Layout>
    </>
  );
}
