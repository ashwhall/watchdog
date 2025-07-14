import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/', current: router.pathname === '/' },
    {
      name: 'Add Dog',
      href: '/dogs/add',
      current: router.pathname === '/dogs/add',
    },
    {
      name: 'Settings',
      href: '/settings',
      current: router.pathname === '/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Floating navigation */}
      <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 glass rounded-2xl shadow-large">
        <div className="px-6 py-3">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-lg font-semibold text-text-primary hover:text-accent transition-colors duration-200"
            >
              🐕 Watchdog
            </Link>

            <div className="flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    ${
                      item.current
                        ? 'bg-accent text-white shadow-glow'
                        : 'text-text-secondary hover:text-text-primary hover:bg-elevated'
                    } 
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  `}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content with top padding for floating nav */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Minimal footer */}
      <footer className="text-center py-8">
        <p className="text-text-tertiary text-sm">
          Made with ❤️ for our furry friends
        </p>
      </footer>
    </div>
  );
}
