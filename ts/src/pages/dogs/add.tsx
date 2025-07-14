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
          <div className="mb-8">
            <h1 className="text-3xl font-bold rainbow-text">🐕 Add New Dog</h1>
            <p className="text-dark-text-secondary text-lg">
              Add a new dog to your watchlist
            </p>
          </div>

          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rainbow-indigo via-rainbow-purple to-rainbow-pink rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>

            <div className="relative bg-dark-surface rounded-xl shadow-2xl p-8 border border-dark-border">
              <DogForm onSubmit={handleSubmit} onCancel={handleCancel} />
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
