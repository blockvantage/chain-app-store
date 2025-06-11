import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useConfig } from '../../hooks/useConfig';
import { getApps, App, getBoostedApps } from '../../utils/api';

// Utility function to safely access properties
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

// Add Layout component import
import Layout from '../../components/Layout';

export default function Apps() {
  const router = useRouter();
  const { config } = useConfig();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Local state for filters
  const [currentPage, setCurrentPage] = useState(1);
  const [isFeatured, setIsFeatured] = useState(false);
  const [sortOption, setSortOption] = useState<string | null>(null);
  
  // Get initial values from query parameters on first load
  useEffect(() => {
    if (router.isReady) {
      setCurrentPage(Number(router.query.page) || 1);
      setIsFeatured(router.query.featured === 'true');
      setSelectedCategory(router.query.category as string || null);
      setSortOption(router.query.sort as string || null);
      
      // Update URL once to match initial state without causing navigation
      const query: any = {};
      if (router.query.featured === 'true') query.featured = 'true';
      if (router.query.category) query.category = router.query.category;
      if (router.query.sort) query.sort = router.query.sort;
      if (router.query.page) query.page = router.query.page;
      
      router.replace({
        pathname: router.pathname,
        query
      }, undefined, { shallow: true });
    }
  }, [router.isReady]);
  
  // Derived values for current render
  const featured = isFeatured;
  const sort = sortOption;
  const page = currentPage;

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        
        let appsData;
        
        // Handle different sorting options
        if (sort === 'boost' && safe.get(config, 'enableModules.boosting', false)) {
          // Get boosted apps
          const response = await getBoostedApps();
          appsData = {
            apps: response.apps,
            pagination: {
              total: response.apps.length,
              page: 1,
              pageSize: response.apps.length,
              pages: 1
            }
          };
        } else {
          // Get regular apps with filters
          appsData = await getApps(
            page, 
            12, 
            featured, 
            selectedCategory || undefined
          );
        }
        
        setApps(appsData.apps);
        setTotalPages(appsData.pagination.pages);
        
        // Extract unique categories from all apps
        const allCategories = new Set<string>();
        (appsData?.apps || []).forEach(app => {
          (safe.get(app, 'tags', []) || []).forEach(tag => {
            if (tag) allCategories.add(tag);
          });
        });
        
        setCategories(Array.from(allCategories));
      } catch (err) {
        console.error('Error fetching apps:', err);
        setError('Failed to load apps. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [page, featured, selectedCategory, sort, config]);

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to page 1 when changing filters
    
    // Update URL without causing a navigation (shallow update)
    const query: any = { ...router.query };
    if (category) {
      query.category = category;
    } else {
      delete query.category;
    }
    delete query.page; // Remove page from URL when changing filters
    
    router.replace({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    
    // Update URL without causing a navigation (shallow update)
    router.replace({
      pathname: router.pathname,
      query: { ...router.query, page: newPage }
    }, undefined, { shallow: true });
  };
  
  const handleFilterChange = (type: 'all' | 'featured' | 'boost') => {
    // Reset page to 1
    setCurrentPage(1);
    
    // Update filter states
    if (type === 'featured') {
      setIsFeatured(true);
      setSortOption(null);
    } else if (type === 'boost') {
      setIsFeatured(false);
      setSortOption('boost');
    } else {
      setIsFeatured(false);
      setSortOption(null);
    }
    
    // Update URL without causing a navigation
    const query: any = {};
    if (type === 'featured') query.featured = 'true';
    if (type === 'boost') query.sort = 'boost';
    if (selectedCategory) query.category = selectedCategory;
    
    router.replace({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  };

  return (
    <Layout>
      <Head>
        <title>Apps | {safe.get(config, 'chainName', 'Chain App Hub')}</title>
        <meta name="description" content={`Browse apps on ${safe.get(config, 'chainName', 'blockchain')}`} />
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
              <span className="inline-block">
                {featured ? 'Featured Apps' : 
                 selectedCategory ? `${selectedCategory} Apps` : 
                 sort === 'boost' ? 'Top Boosted Apps' : 
                 'All Apps'}
              </span>
            </h1>
            
            <p className="mt-8 text-xl md:text-2xl font-light max-w-2xl mx-auto text-white/90 animate-apple-slide-up" style={{ animationDelay: '0.2s' }}>
              Discover and use the best applications on {safe.get(config, 'chainName', 'blockchain')}.
            </p>
          </div>
        </section>
        
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-apple-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleFilterChange('all')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${!featured && !sort ? 'bg-primary-600 text-white shadow-apple-sm hover:shadow-apple' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => handleFilterChange('featured')}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${featured ? 'bg-primary-600 text-white shadow-apple-sm hover:shadow-apple' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
            >
              Featured
            </button>
            {safe.get(config, 'enableModules.boosting', false) && (
              <button 
                onClick={() => handleFilterChange('boost')}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${sort === 'boost' ? 'bg-primary-600 text-white shadow-apple-sm hover:shadow-apple' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
              >
                Boosted
              </button>
            )}
          </div>
        </div>

        {/* Categories filter */}
        <div className="animate-apple-fade-in" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600">Categories</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === null 
                  ? 'bg-primary-600 text-white shadow-apple-sm hover:shadow-apple' 
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat, index) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === cat 
                    ? 'bg-primary-600 text-white shadow-apple-sm hover:shadow-apple' 
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
                style={{ animationDelay: `${0.4 + (0.05 * index)}s` }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Apps grid */}
        <div className="animate-apple-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600">
              {featured ? 'Featured Apps' : 
               selectedCategory ? `${selectedCategory} Apps` : 
               sort === 'boost' ? 'Top Boosted Apps' : 
               'All Apps'}
            </h2>
          </div>
          
          {loading ? (
            <div className="text-center py-16 animate-pulse">
              <div className="inline-block rounded-full bg-primary-100 dark:bg-primary-900/30 p-4">
                <svg className="w-8 h-8 text-primary-500 dark:text-primary-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="mt-4 text-lg font-medium text-neutral-600 dark:text-neutral-300">Loading apps...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 bg-red-50 dark:bg-red-900/20 rounded-apple-lg">
              <svg className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="mt-4 text-xl font-medium text-red-600 dark:text-red-400">{error}</p>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">Please try again later</p>
            </div>
          ) : (apps || []).length === 0 ? (
            <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-800/50 rounded-apple-lg shadow-apple-sm">
              <svg className="w-12 h-12 text-neutral-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="mt-4 text-xl font-medium text-neutral-800 dark:text-neutral-200">No apps found</p>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">Try changing your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {(apps || []).map((app, index) => (
                <Link key={safe.get(app, 'ID', `app-${index}`)} href={`/apps/${safe.get(app, 'ID', `app-${index}`)}`} className="group">
                  <div className="app-card h-full flex flex-col animate-apple-scale-in" style={{ animationDelay: `${0.1 * index}s` }}>
                    <div className="p-5 flex items-center">
                      <div className="w-16 h-16 relative mr-4 overflow-hidden rounded-apple-md shadow-apple-sm group-hover:shadow-apple transition-all duration-300">
                        {safe.get(app, 'logoPath', null) ? (
                          <img 
                            src={`/api/images/${safe.get(app, 'logoPath', '')}`}
                            alt={safe.get(app, 'name', 'App')} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-2xl font-bold">
                            {safe.get(app, 'name', 'A').charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-neutral-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {safe.get(app, 'name', 'Unnamed App')}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Array.isArray(safe.get(app, 'tags', [])) && safe.get(app, 'tags', []).length > 0 ? 
                            safe.get(app, 'tags', []).slice(0, 2).map((tag) => (
                              <span key={tag} className="apple-tag text-xs">
                                {tag}
                              </span>
                            )) : (
                              <span className="apple-tag text-xs">App</span>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="p-5 border-t border-neutral-100 dark:border-neutral-800 flex-grow">
                      <p className="text-neutral-600 dark:text-neutral-400 line-clamp-2">{safe.get(app, 'description', 'No description available')}</p>
                    </div>
                    
                    {/* Show badges based on enabled modules */}
                    <div className="p-5 flex justify-between items-center">
                      {safe.get(app, 'featured', false) && (
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-medium">
                          Featured
                        </div>
                      )}
                      {'boostTotal' in app && safe.get(config, 'enableModules.boosting', false) && (
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          <span className="text-primary-600 dark:text-primary-400 font-medium">
                            {safe.get(app as any, 'boostTotal', 0)} {safe.get(config, 'primaryToken', 'tokens')}
                          </span> boosted
                        </div>
                      )}
                      <span className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
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
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-3 animate-apple-fade-in" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-5 py-3 rounded-full font-medium transition-all duration-300 flex items-center ${
                page === 1 
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed' 
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:shadow-apple-sm'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`w-12 h-12 rounded-full font-medium transition-all duration-300 flex items-center justify-center ${
                  page === pageNum 
                    ? 'bg-primary-600 text-white shadow-apple-sm hover:shadow-apple' 
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:shadow-apple-sm'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`px-5 py-3 rounded-full font-medium transition-all duration-300 flex items-center ${
                page === totalPages 
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed' 
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:shadow-apple-sm'
              }`}
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
