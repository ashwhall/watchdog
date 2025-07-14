import Image from 'next/image';
import Link from 'next/link';
import { Dog } from '../../lib/schema';

interface DogCardProps {
  dog: Dog;
  onDelete?: (id: number) => void;
}

export default function DogCard({ dog, onDelete }: DogCardProps) {
  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this dog?')) {
      onDelete(dog.id);
    }
  };

  return (
    <div className="group animate-slide-up">
      <div className="glass rounded-3xl shadow-large overflow-hidden hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
        {/* Image with overlay */}
        <div className="relative h-56 overflow-hidden">
          <Link
            href={`/dogs/${dog.id}`}
            className="block relative h-full w-full"
          >
            <Image
              src={dog.imageUrl}
              alt={dog.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          {/* Floating name on image */}
          <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <h3 className="text-white text-xl font-bold drop-shadow-lg">
              {dog.name}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link href={`/dogs/${dog.id}`} className="group/title">
              <h3 className="text-lg font-semibold text-text-primary group-hover/title:text-accent transition-colors duration-200">
                {dog.name}
              </h3>
            </Link>
            {dog.breed && (
              <span className="px-3 py-1 bg-accent-subtle text-accent text-sm font-medium rounded-full">
                {dog.breed}
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-text-secondary text-sm leading-relaxed line-clamp-2">
            {dog.description}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-text-tertiary">
            <span>📅 {new Date(dog.scrapedAt).toLocaleDateString()}</span>
            <span>🔄 {new Date(dog.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions - floating at bottom */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <a
              href={dog.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover text-sm font-medium transition-colors duration-200"
            >
              View Post →
            </a>

            <div className="flex space-x-2">
              <Link
                href={`/dogs/edit/${dog.id}`}
                className="px-4 py-2 bg-surface hover:bg-elevated text-text-primary text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-medium"
              >
                Edit
              </Link>
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-error hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-medium"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
