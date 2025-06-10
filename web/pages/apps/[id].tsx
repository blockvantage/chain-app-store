import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useConfig } from '../../hooks/useConfig';
import { getApp, getReviews, App, ReviewsResponse } from '../../utils/api';
import { connectWallet, getWalletState, signMessage } from '../../utils/wallet';

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

export default function AppDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { config } = useConfig();
  
  const [app, setApp] = useState<App | null>(null);
  const [reviews, setReviews] = useState<ReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const checkWallet = () => {
      const state = getWalletState();
      setWalletConnected(state.connected);
    };
    
    checkWallet();
    
    // Check wallet connection status when component mounts
    window.addEventListener('walletChanged', checkWallet);
    
    return () => {
      window.removeEventListener('walletChanged', checkWallet);
    };
  }, []);

  useEffect(() => {
    const fetchAppData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch app details
        const appData = await getApp(Number(id));
        setApp(appData);
        
        // Fetch reviews if reviews module is enabled
        if (safe.get(config, 'enableModules.reviews', false)) {
          const reviewsData = await getReviews(Number(id));
          setReviews(reviewsData);
        }
      } catch (err) {
        console.error('Error fetching app data:', err);
        setError('Failed to load app details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppData();
    }
  }, [id, config]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      setWalletConnected(true);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      alert('Failed to connect wallet. Please make sure you have MetaMask installed.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-apple-fade-in">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-t-primary-600 border-r-primary-300 border-b-primary-100 border-l-primary-300 animate-spin"></div>
        </div>
        <p className="mt-6 text-lg font-medium text-neutral-600 dark:text-neutral-300">Loading app details...</p>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-apple-fade-in">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-xl font-medium text-neutral-800 dark:text-neutral-200">{error || 'App not found'}</p>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Please try again or go back to the apps listing</p>
        <Link href="/apps" className="mt-6 btn-primary px-6 py-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Apps
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{safe.get(app, 'name', 'App Details')} | {safe.get(config, 'chainName', 'Chain App Hub')}</title>
        <meta name="description" content={safe.get(app, 'description', 'App details')} />
      </Head>

      <div className="space-y-8">
        {/* App Hero Header */}
        <section className="apple-section apple-gradient-blue py-12 px-6 md:px-12 rounded-apple-lg overflow-hidden relative animate-apple-fade-in">
          {/* Abstract shapes in background */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-white blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-28 h-28 md:w-32 md:h-32 relative overflow-hidden rounded-apple-lg shadow-apple">
              {safe.get(app, 'logoUrl', null) ? (
                <Image 
                  src={safe.get(app, 'logoUrl', '/placeholder.png')} 
                  alt={safe.get(app, 'name', 'App')} 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-4xl font-bold">
                  {safe.get(app, 'name', 'A').charAt(0)}
                </div>
              )}
            </div>
            
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white animate-apple-slide-up" style={{ animationDelay: '0.1s' }}>
                {safe.get(app, 'name', 'App Name')}
              </h1>
              
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start animate-apple-slide-up" style={{ animationDelay: '0.2s' }}>
                {Array.isArray(safe.get(app, 'tags', [])) && safe.get(app, 'tags', []).length > 0 ? (
                  safe.get(app, 'tags', []).map((tag) => (
                    <span key={tag} className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-apple-md">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="bg-white/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-apple-md">
                    App
                  </span>
                )}
              </div>
              
              <div className="mt-4 text-white/80 animate-apple-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-center md:justify-start">
                  <span className="font-medium">Developer:</span>
                  <span className="ml-2 text-white">
                    {safe.get(app, 'developerAddress', '').length > 8 
                      ? `${safe.get(app, 'developerAddress', '').substring(0, 6)}...${safe.get(app, 'developerAddress', '').substring(safe.get(app, 'developerAddress', '').length - 4)}`
                      : safe.get(app, 'developerAddress', 'Unknown')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-row md:flex-col gap-3 mt-4 md:mt-0 animate-apple-slide-up" style={{ animationDelay: '0.4s' }}>
              {safe.get(app, 'websiteUrl', null) && (
                <a 
                  href={safe.get(app, 'websiteUrl', '#')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary px-4 py-2 shadow-apple-sm hover:shadow-apple transition-all duration-300 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  Website
                </a>
              )}
              
              {safe.get(app, 'repoUrl', null) && (
                <a 
                  href={safe.get(app, 'repoUrl', '#')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Repository
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="animate-apple-fade-in" style={{ animationDelay: '0.5s' }}>
          <nav className="flex space-x-2 md:space-x-4 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-5 rounded-apple-full font-medium text-sm transition-all duration-300 ${
                activeTab === 'details'
                  ? 'bg-primary-600 text-white shadow-apple-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
              }`}
              aria-current={activeTab === 'details' ? 'page' : undefined}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Details
              </div>
            </button>
            
            {safe.get(config, 'enableModules.reviews', false) && (
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-3 px-5 rounded-apple-full font-medium text-sm transition-all duration-300 ${
                  activeTab === 'reviews'
                    ? 'bg-primary-600 text-white shadow-apple-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
                aria-current={activeTab === 'reviews' ? 'page' : undefined}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Reviews
                </div>
              </button>
            )}
            
            {safe.get(config, 'enableModules.boosting', false) && (
              <button
                onClick={() => setActiveTab('boost')}
                className={`py-3 px-5 rounded-apple-full font-medium text-sm transition-all duration-300 ${
                  activeTab === 'boost'
                    ? 'bg-primary-600 text-white shadow-apple-sm'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
                aria-current={activeTab === 'boost' ? 'page' : undefined}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  Boost
                </div>
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-8 animate-apple-fade-in" style={{ animationDelay: '0.6s' }}>
          {activeTab === 'details' && (
            <div className="space-y-8">
              <div className="bg-white dark:bg-neutral-900 rounded-apple-lg p-6 shadow-apple-sm">
                <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Description</h2>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {safe.get(app, 'description', 'No description available')}
                </p>
              </div>
              
              <div className="bg-white dark:bg-neutral-900 rounded-apple-lg p-6 shadow-apple-sm">
                <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Contract Addresses
                </h2>
                <div className="space-y-3">
                  {Array.isArray(safe.get(app, 'contractAddresses', [])) && safe.get(app, 'contractAddresses', []).length > 0 ? (
                    safe.get(app, 'contractAddresses', []).map((address, index) => (
                      <div key={index} className="flex items-center">
                        <code className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-apple-md text-sm flex-grow font-mono text-neutral-700 dark:text-neutral-300 overflow-x-auto">
                          {address}
                        </code>
                        <a 
                          href={`${safe.get(config, 'explorerUrl', '#')}/address/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-3 text-primary-600 hover:text-primary-500 flex items-center transition-all duration-300 hover:scale-105"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                          View
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="text-neutral-500 dark:text-neutral-400 italic">
                      No contract addresses available
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white dark:bg-neutral-900 rounded-apple-lg p-6 shadow-apple-sm">
                <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Transaction
                </h2>
                <div className="flex items-center">
                  {safe.get(app, 'txHash', '').length > 0 ? (
                    <>
                      <code className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-apple-md text-sm flex-grow font-mono text-neutral-700 dark:text-neutral-300 overflow-x-auto">
                        {safe.get(app, 'txHash', '')}
                      </code>
                      <a 
                        href={`${safe.get(config, 'explorerUrl', '#')}/tx/${safe.get(app, 'txHash', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 text-primary-600 hover:text-primary-500 flex items-center transition-all duration-300 hover:scale-105"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                        View
                      </a>
                    </>
                  ) : (
                    <div className="text-neutral-500 dark:text-neutral-400 italic">
                      Transaction hash not available
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && safe.get(config, 'enableModules.reviews', false) && (
            <div className="bg-white dark:bg-neutral-900 rounded-apple-lg p-6 shadow-apple-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Reviews
                </h2>
                {walletConnected ? (
                  <button className="btn-primary px-4 py-2 text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                    Write Review
                  </button>
                ) : (
                  <button 
                    onClick={handleConnectWallet}
                    className="btn-secondary px-4 py-2 text-sm flex items-center"
                  >
                    Connect Wallet to Review
                  </button>
                )}
              </div>
              
              {/* Reviews placeholder - will be implemented separately */}
              <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-lg font-medium">No reviews yet</p>
                <p className="mt-2">Be the first to review this app</p>
              </div>
            </div>
          )}

          {activeTab === 'boost' && safe.get(config, 'enableModules.boosting', false) && (
            <div className="bg-white dark:bg-neutral-900 rounded-apple-lg p-6 shadow-apple-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  Boost this App
                </h2>
                {walletConnected ? (
                  <button className="btn-primary px-4 py-2 text-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                    </svg>
                    Boost Now
                  </button>
                ) : (
                  <button 
                    onClick={handleConnectWallet}
                    className="btn-secondary px-4 py-2 text-sm flex items-center"
                  >
                    Connect Wallet to Boost
                  </button>
                )}
              </div>
              
              {/* Boost placeholder - will be implemented separately */}
              <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <p className="text-lg font-medium">Boost this app to increase its visibility</p>
                <p className="mt-2">Boosting helps great apps get discovered by more users</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
