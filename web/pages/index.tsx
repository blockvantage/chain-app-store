import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useConfig } from '../hooks/useConfig';
import Layout from '../components/Layout';
import { getApps, getBoostedApps, App, BoostedApp } from '../utils/api';

// Utility function to safely access app properties
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

// Add type declarations to fix TypeScript errors
declare module 'react' {}
declare module 'next/head' {}
declare module 'next/link' {}
declare module 'next/image' {}

// Category type definition
interface Category {
  name: string;
  icon: string;
  color: string;
}

// Categories data
const categories: Category[] = [
  { name: 'DeFi', icon: '💰', color: 'from-blue-500 to-indigo-600' },
  { name: 'NFT', icon: '🖼️', color: 'from-purple-500 to-pink-600' },
  { name: 'Gaming', icon: '🎮', color: 'from-green-500 to-teal-600' },
  { name: 'Social', icon: '👥', color: 'from-yellow-500 to-orange-600' },
  { name: 'Tools', icon: '🛠️', color: 'from-gray-600 to-gray-800' },
  { name: 'Governance', icon: '🏛️', color: 'from-red-500 to-pink-600' }
];

function Home() {
  const { config, loading: configLoading } = useConfig();
  const [featuredApps, setFeaturedApps] = useState<App[]>([]);
  const [boostedApps, setBoostedApps] = useState<BoostedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (configLoading) return;

    const fetchApps = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get featured apps
        const featuredResponse = await getApps(1, 6, true);
        setFeaturedApps(featuredResponse?.apps || []);

        // Get boosted apps if boosting is enabled
        if (safe.get(config, 'enableModules.boosting', false)) {
          const boostedResponse = await getBoostedApps();
          setBoostedApps(boostedResponse?.apps || []);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching apps:', err);
        setError('Failed to load apps. Please try again later.');
        setLoading(false);
      }
    };

    fetchApps();
  }, [config, configLoading]);

  return (
    <Layout>
      <Head>
        <title>{config?.chainName || 'Chain App Hub'}</title>
        <meta name="description" content={`Discover the best apps on ${config?.chainName || 'blockchain'}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="space-y-12">
        {/* Hero Section */}
        <section className="apple-section apple-gradient-blue py-16 md:py-24 px-6 md:px-12 rounded-apple-lg overflow-hidden relative animate-apple-fade-in">
          {/* Abstract shapes in background */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-white blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white animate-apple-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="inline-block">{config?.chainName || 'Chain'}</span>{' '}
              <span className="inline-block font-light">App Hub</span>
            </h1>
            
            <p className="mt-8 text-xl md:text-2xl font-light max-w-2xl mx-auto text-white/90 animate-apple-slide-up" style={{ animationDelay: '0.2s' }}>
              Discover, use, and boost the best applications on {config?.chainName || 'blockchain'}.
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4 animate-apple-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/apps" className="btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl">
                Browse Apps
              </Link>
              <Link href="/submit" className="btn-secondary text-lg px-8 py-3 bg-white/20 hover:bg-white/30 text-white border border-white/30">
                Submit Your App
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Apps Section */}
        <section className="animate-apple-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600">
              Featured Apps
            </h2>
            <Link href="/apps?featured=true" className="flex items-center text-primary-600 hover:text-primary-500 font-medium transition-colors">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-16 animate-pulse">
              <div className="inline-block rounded-full bg-primary-100 p-4">
                <svg className="w-8 h-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading featured apps...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-apple-lg">
              <svg className="w-8 h-8 text-red-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : (featuredApps || []).length === 0 ? (
            <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-800/50 rounded-apple-lg">
              <svg className="w-8 h-8 text-neutral-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">No featured apps available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {(featuredApps || []).map((app, index) => (
                <Link key={safe.get(app, 'id', `app-${index}`)} href={`/apps/${safe.get(app, 'id', `app-${index}`)}`} className="group">
                  <div className="app-card h-full flex flex-col animate-apple-scale-in" style={{ animationDelay: `${0.1 * index}s` }}>
                    <div className="p-5 flex items-center">
                      <div className="w-16 h-16 relative mr-4 overflow-hidden rounded-apple-sm shadow-apple-sm group-hover:shadow-apple transition-all duration-300">
                        <Image 
                          src={safe.get(app, 'logoUrl', '/placeholder.png')} 
                          alt={safe.get(app, 'name', 'App')} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-neutral-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {safe.get(app, 'name', 'Unnamed App')}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(safe.get(app, 'tags', [])) && safe.get(app, 'tags', []).length > 0 ? (
                            safe.get(app, 'tags', []).slice(0, 2).map((tag: string) => (
                              <span key={tag} className="apple-tag text-xs">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="apple-tag text-xs">App</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 flex-grow">
                      <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2">{safe.get(app, 'description', 'No description available')}</p>
                    </div>
                    <div className="p-5 flex justify-end">
                      <span className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Boosted Apps Section */}
        <section className="mt-16 animate-apple-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600">
              Boosted Apps
            </h2>
            <Link href="/apps?boosted=true" className="flex items-center text-primary-600 hover:text-primary-500 font-medium transition-colors">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-16 animate-pulse">
              <div className="inline-block rounded-full bg-primary-100 p-4">
                <svg className="w-8 h-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading boosted apps...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-apple-lg">
              <svg className="w-8 h-8 text-red-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : (boostedApps || []).length === 0 ? (
            <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-800/50 rounded-apple-lg">
              <svg className="w-8 h-8 text-neutral-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">No boosted apps available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {(boostedApps || []).map((app, index) => (
                <Link key={safe.get(app, 'id', `app-${index}`)} href={`/apps/${safe.get(app, 'id', `app-${index}`)}`} className="group">
                  <div className="app-card h-full flex flex-col items-center p-6 text-center animate-apple-scale-in" style={{ animationDelay: `${0.1 * index}s` }}>
                    <div className="w-20 h-20 relative mb-5 overflow-hidden rounded-apple-md shadow-apple-sm group-hover:shadow-apple transition-all duration-300">
                      <Image 
                        src={safe.get(app, 'logoUrl', '/placeholder.png')} 
                        alt={safe.get(app, 'name', 'App')} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-neutral-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {safe.get(app, 'name', 'Unnamed App')}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {Array.isArray(safe.get(app, 'tags', [])) && safe.get(app, 'tags', []).length > 0 ? (
                        safe.get(app, 'tags', []).slice(0, 2).map((tag: string) => (
                          <span key={tag} className="apple-tag text-xs">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="apple-tag text-xs">App</span>
                      )}
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2 mb-4">{safe.get(app, 'description', 'No description available')}</p>
                    <div className="mt-auto">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Categories Section
        <section className="mt-16 animate-apple-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600">
              Categories
            </h2>
            <Link href="/categories" className="flex items-center text-primary-600 hover:text-primary-500 font-medium transition-colors">
              View all
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'DeFi', icon: '💰', color: 'from-blue-500 to-indigo-600' },
              { name: 'NFT', icon: '🖼️', color: 'from-purple-500 to-pink-600' },
              { name: 'Gaming', icon: '🎮', color: 'from-green-500 to-teal-600' },
              { name: 'Social', icon: '👥', color: 'from-yellow-500 to-orange-600' }
            ].map((category, index) => (
              <Link href={`/categories/${safe.get(category, 'name', 'other').toLowerCase()}`} key={index}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <div className="p-5 flex-grow">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${safe.get(category, 'color', 'from-gray-500 to-gray-700')} text-white text-2xl mb-4 shadow-lg`}>
                      {safe.get(category, 'icon', '🔍')}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{safe.get(category, 'name', 'Category')}</h3>
                  </div>
                  <div className="p-5 flex justify-end">
                    <span className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      Explore
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section> */}

      {/* Newsletter Section */}
      <section className="mt-16 animate-apple-fade-in" style={{ animationDelay: '0.8s' }}>
        <div className="apple-glass-card p-8 md:p-12 rounded-apple-lg">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600">
              Stay Updated
            </h2>
            <p className="text-lg text-neutral-700 dark:text-neutral-300 mb-8">
              Subscribe to our newsletter to get the latest updates on new apps and features.
            </p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow px-5 py-3 rounded-apple-md border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-apple-sm"
                required
              />
              <button 
                type="submit" 
                className="btn-primary px-8 py-3 shadow-apple-sm hover:shadow-apple transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mt-16 animate-apple-fade-in" style={{ animationDelay: '0.8s' }}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600">
            Categories
          </h2>
          <Link href="/categories" className="flex items-center text-primary-600 hover:text-primary-500 font-medium transition-colors">
            View all
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <Link key={safe.get(category, 'name', `category-${index}`)} href={`/categories/${safe.get(category, 'name', 'other').toLowerCase()}`} className="group">
              <div className="app-card p-6 text-center rounded-apple-lg shadow-apple-sm hover:shadow-apple transition-all duration-300 animate-apple-scale-in" style={{ animationDelay: `${0.1 * index}s` }}>
                <div className="mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${safe.get(category, 'color', 'from-gray-500 to-gray-700')} rounded-apple-lg flex items-center justify-center mx-auto shadow-inner text-white`}>
                    <span className="text-2xl">{safe.get(category, 'icon', '🔍')}</span>
                  </div>
                </div>
                <h3 className="font-medium text-lg text-neutral-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {safe.get(category, 'name', 'Category')}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* End of content sections */}
      </div>
    </Layout>
  );
};

export default Home;
