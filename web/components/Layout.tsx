import React, { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useConfig } from '../hooks/useConfig';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { config, loading } = useConfig();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for system dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    // Listen for changes in dark mode preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      setDarkMode(e.matches);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {!loading && config?.logos && (
                <Image 
                  src={darkMode ? config.logos.dark : config.logos.light} 
                  alt={config?.chainName || 'Chain App Hub'} 
                  width={40} 
                  height={40}
                />
              )}
              <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
                {config?.chainName || 'Chain App Hub'}
              </Link>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className={`${router.pathname === '/' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-500`}>
                Home
              </Link>
              <Link href="/apps" className={`${router.pathname === '/apps' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-500`}>
                Apps
              </Link>
              {config?.enableModules?.poe && (
                <Link href="/leaderboard" className={`${router.pathname === '/leaderboard' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-500`}>
                  Leaderboard
                </Link>
              )}
              <Link href="/submit" className={`${router.pathname === '/submit' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-500`}>
                Submit App
              </Link>
              <Link href="/about" className={`${router.pathname === '/about' ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-500`}>
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <footer className="bg-gray-100 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 dark:text-gray-300">
                &copy; {new Date().getFullYear()} {config?.chainName || 'Chain App Hub'}
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-primary-500">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-primary-500">
                Privacy
              </Link>
              <a 
                href={config?.explorerUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 dark:text-gray-300 hover:text-primary-500"
              >
                Explorer
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
