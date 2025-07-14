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

  // Array of rainbow colors for breed badges
  const rainbowColors = [
    'from-rainbow-red to-rainbow-orange',
    'from-rainbow-orange to-rainbow-yellow',
    'from-rainbow-yellow to-rainbow-green',
    'from-rainbow-green to-rainbow-blue',
    'from-rainbow-blue to-rainbow-indigo',
    'from-rainbow-indigo to-rainbow-purple',
    'from-rainbow-purple to-rainbow-pink',
  ];

  // Get a consistent color based on breed name
  const breedColorIndex = (dog.breed?.length || 0) % rainbowColors.length;
  const breedColor = rainbowColors[breedColorIndex];

  return (
    <div className="group relative">
      {/* Animated rainbow border container */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-rainbow-red via-rainbow-blue to-rainbow-purple rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

      <div className="relative bg-dark-surface rounded-xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-105 hover-glow">
        {/* Image container with overlay effects */}
        <div className="relative h-48 w-full overflow-hidden">
          <Link
            href={`/dogs/${dog.id}`}
            className="block relative h-full w-full group/image"
          >
            <Image
              src={dog.imageUrl}
              alt={dog.name}
              fill
              className="object-cover transition-transform duration-700 group-hover/image:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
          </Link>

          {/* Floating action button */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <Link
              href={`/dogs/${dog.id}`}
              className="w-10 h-10 bg-dark-elevated/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-rainbow-blue transition-all duration-300"
            >
              👁️
            </Link>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Header with name and breed */}
          <div className="flex items-start justify-between">
            <Link href={`/dogs/${dog.id}`} className="group/title">
              <h3 className="text-xl font-bold text-white group-hover/title:rainbow-text transition-all duration-300 mb-1">
                {dog.name}
              </h3>
            </Link>
            <span
              className={`
              px-3 py-1 rounded-full text-xs font-bold text-white
              bg-gradient-to-r ${breedColor}
              transform transition-all duration-300 hover:scale-110
              shadow-lg hover:shadow-xl
            `}
            >
              {dog.breed || 'Unknown Breed'}
            </span>
          </div>

          {/* Description */}
          <p className="text-dark-text-secondary text-sm leading-relaxed line-clamp-2 group-hover:text-dark-text-primary transition-colors duration-300">
            {dog.description}
          </p>

          {/* Timestamps with icons */}
          <div className="flex items-center justify-between text-xs text-dark-text-muted space-x-4">
            <div className="flex items-center space-x-1 hover:text-rainbow-green transition-colors duration-300">
              <span>📅</span>
              <span>
                Scraped: {new Date(dog.scrapedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-1 hover:text-rainbow-blue transition-colors duration-300">
              <span>🔄</span>
              <span>
                Updated: {new Date(dog.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <a
              href={dog.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group/link flex items-center space-x-2 text-sm font-medium 
                text-rainbow-blue hover:text-white transition-all duration-300
                hover:transform hover:scale-105
              "
            >
              <span>View Original Post</span>
              <span className="transform transition-transform duration-300 group-hover/link:translate-x-1">
                →
              </span>
            </a>

            <div className="flex space-x-2">
              <Link
                href={`/dogs/edit/${dog.id}`}
                className="
                  px-4 py-2 text-xs font-bold rounded-lg
                  bg-gradient-to-r from-rainbow-blue to-rainbow-indigo
                  text-white transform transition-all duration-300
                  hover:scale-105 hover:shadow-lg hover:shadow-rainbow-blue/25
                  focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:ring-offset-2 focus:ring-offset-dark-surface
                "
              >
                ✏️ Edit
              </Link>
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="
                    px-4 py-2 text-xs font-bold rounded-lg
                    bg-gradient-to-r from-rainbow-red to-rainbow-pink
                    text-white transform transition-all duration-300
                    hover:scale-105 hover:shadow-lg hover:shadow-rainbow-red/25
                    focus:outline-none focus:ring-2 focus:ring-rainbow-red focus:ring-offset-2 focus:ring-offset-dark-surface
                  "
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Animated corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-rainbow-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-rainbow-purple opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    </div>
  );
}
