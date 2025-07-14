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
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-bold text-rainbow-blue mb-2"
        >
          🏷️ Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="
            w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg 
            text-white placeholder-dark-text-muted
            focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:border-rainbow-blue
            transition-all duration-300
          "
          placeholder="Enter dog's name"
        />
      </div>

      <div>
        <label
          htmlFor="breed"
          className="block text-sm font-bold text-rainbow-green mb-2"
        >
          🐕 Breed
        </label>
        <input
          type="text"
          id="breed"
          name="breed"
          required
          value={formData.breed}
          onChange={handleChange}
          className="
            w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg 
            text-white placeholder-dark-text-muted
            focus:outline-none focus:ring-2 focus:ring-rainbow-green focus:border-rainbow-green
            transition-all duration-300
          "
          placeholder="Enter dog's breed"
        />
      </div>

      <div>
        <label
          htmlFor="postUrl"
          className="block text-sm font-bold text-rainbow-purple mb-2"
        >
          🔗 Post URL
        </label>
        <input
          type="url"
          id="postUrl"
          name="postUrl"
          required
          value={formData.postUrl}
          onChange={handleChange}
          className="
            w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg 
            text-white placeholder-dark-text-muted
            focus:outline-none focus:ring-2 focus:ring-rainbow-purple focus:border-rainbow-purple
            transition-all duration-300
          "
          placeholder="https://example.com/post"
        />
      </div>

      <div>
        <label
          htmlFor="imageUrl"
          className="block text-sm font-bold text-rainbow-orange mb-2"
        >
          🖼️ Image URL
        </label>
        <input
          type="url"
          id="imageUrl"
          name="imageUrl"
          required
          value={formData.imageUrl}
          onChange={handleChange}
          className="
            w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg 
            text-white placeholder-dark-text-muted
            focus:outline-none focus:ring-2 focus:ring-rainbow-orange focus:border-rainbow-orange
            transition-all duration-300
          "
          placeholder="https://example.com/image.jpg"
        />
        {formData.imageUrl && (
          <div className="mt-4 p-4 bg-dark-elevated/50 rounded-lg border border-dark-border">
            <p className="text-sm text-dark-text-secondary mb-2">Preview:</p>
            <Image
              src={formData.imageUrl}
              alt="Preview"
              width={200}
              height={200}
              className="object-cover rounded-lg border-2 border-rainbow-orange/30"
            />
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-bold text-rainbow-pink mb-2"
        >
          📝 Description
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          value={formData.description}
          onChange={handleChange}
          className="
            w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg 
            text-white placeholder-dark-text-muted resize-none
            focus:outline-none focus:ring-2 focus:ring-rainbow-pink focus:border-rainbow-pink
            transition-all duration-300
          "
          placeholder="Tell us about this adorable pup..."
        />
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="
            px-6 py-3 bg-dark-elevated border border-dark-border rounded-lg 
            text-dark-text-secondary font-medium transform transition-all duration-300
            hover:scale-105 hover:text-white hover:border-white
            focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-dark-surface
          "
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="
            px-6 py-3 bg-gradient-to-r from-rainbow-blue to-rainbow-indigo 
            text-white rounded-lg font-bold transform transition-all duration-300
            hover:scale-105 hover:shadow-lg hover:shadow-rainbow-blue/25
            focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:ring-offset-2 focus:ring-offset-dark-surface
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          "
        >
          {loading ? (
            <span className="flex items-center space-x-2">
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
              <span>Saving...</span>
            </span>
          ) : (
            <>{dog ? '✏️ Update Dog' : '➕ Add Dog'}</>
          )}
        </button>
      </div>
    </form>
  );
}
