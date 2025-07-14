import { useState } from 'react';
import Image from 'next/image';
import { Dog } from '../../lib/schema';

interface DogFormProps {
  dog?: Dog;
  onSubmit: (data: DogFormData) => Promise<void>;
  onCancel: () => void;
}

export interface DogFormData {
  name: string;
  breed: string;
  postUrl: string;
  imageUrl: string;
  description: string;
}

export default function DogForm({ dog, onSubmit, onCancel }: DogFormProps) {
  const [formData, setFormData] = useState<DogFormData>({
    name: dog?.name || '',
    breed: dog?.breed || '',
    postUrl: dog?.postUrl || '',
    imageUrl: dog?.imageUrl || '',
    description: dog?.description || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image preview */}
        {formData.imageUrl && (
          <div className="glass rounded-3xl p-6 animate-scale-in">
            <div className="relative h-64 rounded-2xl overflow-hidden">
              <Image
                src={formData.imageUrl}
                alt="Dog preview"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <div className="glass rounded-3xl p-8 space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-lg font-semibold text-text-primary mb-3"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-surface border-2 border-elevated rounded-2xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-200"
              placeholder="Enter the dog's name"
            />
          </div>

          {/* Breed */}
          <div>
            <label
              htmlFor="breed"
              className="block text-lg font-semibold text-text-primary mb-3"
            >
              Breed
            </label>
            <input
              type="text"
              id="breed"
              name="breed"
              required
              value={formData.breed}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-surface border-2 border-elevated rounded-2xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-200"
              placeholder="Enter the dog's breed"
            />
          </div>

          {/* Image URL */}
          <div>
            <label
              htmlFor="imageUrl"
              className="block text-lg font-semibold text-text-primary mb-3"
            >
              Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              required
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-surface border-2 border-elevated rounded-2xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-200"
              placeholder="https://example.com/dog-image.jpg"
            />
          </div>

          {/* Post URL */}
          <div>
            <label
              htmlFor="postUrl"
              className="block text-lg font-semibold text-text-primary mb-3"
            >
              Original Post URL
            </label>
            <input
              type="url"
              id="postUrl"
              name="postUrl"
              required
              value={formData.postUrl}
              onChange={handleChange}
              className="w-full px-6 py-4 bg-surface border-2 border-elevated rounded-2xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-200"
              placeholder="https://example.com/post"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-lg font-semibold text-text-primary mb-3"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-6 py-4 bg-surface border-2 border-elevated rounded-2xl text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-200 resize-none"
              placeholder="Tell us about this dog..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 bg-surface hover:bg-elevated text-text-primary rounded-2xl font-semibold transition-all duration-200 hover:shadow-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-accent hover:bg-accent-hover text-white rounded-2xl font-semibold transition-all duration-200 hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : dog ? 'Update Dog' : 'Add Dog'}
          </button>
        </div>
      </form>
    </div>
  );
}
