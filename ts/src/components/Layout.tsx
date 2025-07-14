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
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-rainbow-red opacity-10 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-20 w-40 h-40 bg-rainbow-blue opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-rainbow-green opacity-10 rounded-full blur-xl"></div>
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-rainbow-purple opacity-10 rounded-full blur-xl"></div>
      </div>

      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-dark-surface/80 border-b border-dark-border shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link
                  href="/"
                  className="text-2xl font-bold rainbow-text hover:scale-110 transition-all duration-300"
                >
                  🐕 Watchdog
                </Link>
              </div>
              <div className="hidden sm:ml-8 sm:flex sm:items-center sm:space-x-1">
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      ${
                        item.current
                          ? 'text-white border-b-2 border-rainbow-blue glow-blue'
                          : 'text-dark-text-secondary hover:text-white'
                      } 
                      relative px-4 py-2 font-medium text-sm transition-all duration-300 
                      hover:transform hover:scale-105 hover-glow group rounded-lg
                    `}
                  >
                    <span className="relative z-10">{item.name}</span>
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-rainbow-red via-rainbow-blue to-rainbow-purple opacity-0 group-hover:opacity-20 rounded-lg transition-opacity duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    ></div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile menu button with rainbow effect */}
            <div className="sm:hidden flex items-center">
              <button className="p-2 rounded-lg bg-dark-elevated hover:bg-dark-border transition-colors duration-300 hover-glow">
                <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                  <div className="w-full h-0.5 bg-gradient-to-r from-rainbow-red to-rainbow-blue"></div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-rainbow-green to-rainbow-purple"></div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-rainbow-yellow to-rainbow-pink"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">{children}</div>
      </main>

      {/* Footer with rainbow accent */}
      <footer className="relative mt-16 border-t border-dark-border bg-dark-surface/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="h-1 w-32 mx-auto mb-4 bg-gradient-to-r from-rainbow-red via-rainbow-green to-rainbow-blue rounded-full"></div>
            <p className="text-dark-text-secondary">
              Made with <span className="rainbow-text">❤️</span> for our furry
              friends
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
