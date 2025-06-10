import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useConfig } from '../hooks/useConfig';

// Safe utility function for accessing nested properties
const safe = {
  get: <T extends unknown>(obj: any, path: string, defaultValue: T): T => {
    try {
      const keys = path.split('.');
      let result = obj;
      
      for (const key of keys) {
        if (result === null || result === undefined) return defaultValue;
        result = result[key];
      }
      
      return (result === null || result === undefined) ? defaultValue : result as T;
    } catch (e) {
      console.error(`Error accessing ${path}:`, e);
      return defaultValue;
    }
  }
};

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const { config, loading } = useConfig();
  const [darkMode, setDarkMode] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    // Check for system dark mode preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    // Listen for changes in dark mode preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      setDarkMode(e.matches);
    });

    // Add scroll listener for header effects
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900 animate-apple-fade-in">
      <header className={`apple-header transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {!loading && (
                <div className="relative w-10 h-10 overflow-hidden rounded-apple-sm">
                  {safe.get(config, 'logos', null) && 
                   typeof safe.get(config, 'logos.dark', '') === 'string' && 
                   typeof safe.get(config, 'logos.light', '') === 'string' ? (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold">
                      {safe.get(config, 'chainName', 'C').charAt(0)}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold">
                      {safe.get(config, 'chainName', 'C').charAt(0)}
                    </div>
                  )}
                </div>
              )}
              <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-teal">
                {safe.get(config, 'chainName', 'Chain App Hub')}
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              {[
                { path: '/', label: 'Home' },
                { path: '/apps', label: 'Apps' },
                ...(safe.get(config, 'enableModules.poe', false) ? [{ path: '/leaderboard', label: 'Leaderboard' }] : []),
                { path: '/submit', label: 'Submit App' },
                { path: '/about', label: 'About' }
              ].map((item) => (
                <Link 
                  key={item.path}
                  href={item.path} 
                  className={`relative font-medium transition-all duration-300 ${isActive(item.path) 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-neutral-600 dark:text-neutral-300 hover:text-primary-500 dark:hover:text-primary-400'}`}
                >
                  {item.label}
                  {isActive(item.path) && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-primary-500 rounded-full animate-apple-fade-in"></span>
                  )}
                </Link>
              ))}
            </nav>
            
            {/* Mobile menu button */}
            <button className="md:hidden rounded-full p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {children}
        </div>
      </main>
      
      <footer className="apple-footer py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2 mb-3">
                {!loading && (
                  <div className="relative w-8 h-8 overflow-hidden rounded-apple-sm">
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 text-white font-bold text-xs">
                      {safe.get(config, 'chainName', 'C').charAt(0)}
                    </div>
                  </div>
                )}
                <span className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-teal">
                  {safe.get(config, 'chainName', 'Chain App Hub')}
                </span>
              </div>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                &copy; {new Date().getFullYear()} {safe.get(config, 'chainName', 'Chain App Hub')}. All rights reserved.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:flex md:space-x-12 gap-4 md:gap-0">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">Resources</h3>
                <div className="flex flex-col space-y-2">
                  <Link href="/terms" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                    Terms of Service
                  </Link>
                  <Link href="/privacy" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                    Privacy Policy
                  </Link>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-white">Ecosystem</h3>
                <div className="flex flex-col space-y-2">
                  <a 
                    href={safe.get(config, 'explorerUrl', '#')} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    Block Explorer
                  </a>
                  <a 
                    href="#" 
                    className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    Documentation
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
