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

// Add Layout component import
import Layout from '../../components/Layout';

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
  const [mockupImageIndex, setMockupImageIndex] = useState(0);

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

        console.log(appData);

        // Convert ID to lowercase id for backward compatibility
        const normalizedApp = {
          ...appData,
          id: appData.ID // Keep a lowercase version for any existing code
        };
        
        setApp(normalizedApp);
        
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
    <Layout>
      <Head>
        <title>{safe.get(app, 'name', 'App Details')} | {safe.get(config, 'chainName', 'Chain App Hub')}</title>
        <meta name="description" content={safe.get(app, 'description', 'App details')} />
      </Head>

      <div className="space-y-8">
        {/* App Hero Header */}
        <section className="apple-section apple-gradient-blue py-12 px-6 md:px-12 rounded-apple-lg overflow-hidden relative animate-apple-fade-in">
          {/* App banner/mockup image */}
          {app?.mockupImages && app.mockupImages.length > 0 && (
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent z-10"></div>
              <img 
                src={app.mockupImages[mockupImageIndex].imagePath ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/images/${app.mockupImages[mockupImageIndex].imagePath}` : '/placeholder.png'}
                alt={`${app.name} mockup`}
                className="w-full h-full object-cover opacity-30"
              />
            </div>
          )}
          {/* Abstract shapes in background */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-white blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-28 h-28 md:w-32 md:h-32 relative overflow-hidden rounded-apple-lg shadow-apple">
              {safe.get(app, 'logoPath', null) ? (
                <img 
                  src={safe.get(app, 'logoPath', '') ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/images/${safe.get(app, 'logoPath', '')}` : '/placeholder.png'}
                  alt={safe.get(app, 'name', 'App')} 
                  className="w-full h-full object-cover"
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
              
              {/* Social Links */}
              <div className="flex items-center gap-3 mt-3 justify-center md:justify-start animate-apple-slide-up" style={{ animationDelay: '0.2s' }}>
                {safe.get(app, 'twitterUrl', null) && (
                  <a href={safe.get(app, 'twitterUrl', '#')} target="_blank" rel="noopener noreferrer" 
                     className="text-white/80 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                )}
                {safe.get(app, 'discordUrl', null) && (
                  <a href={safe.get(app, 'discordUrl', '#')} target="_blank" rel="noopener noreferrer"
                     className="text-white/80 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </a>
                )}
                {safe.get(app, 'telegramUrl', null) && (
                  <a href={safe.get(app, 'telegramUrl', '#')} target="_blank" rel="noopener noreferrer"
                     className="text-white/80 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </a>
                )}
                {safe.get(app, 'mediumUrl', null) && (
                  <a href={safe.get(app, 'mediumUrl', '#')} target="_blank" rel="noopener noreferrer"
                     className="text-white/80 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                    </svg>
                  </a>
                )}
                {safe.get(app, 'githubUrl', null) && (
                  <a href={safe.get(app, 'githubUrl', '#')} target="_blank" rel="noopener noreferrer"
                     className="text-white/80 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                )}
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start animate-apple-slide-up" style={{ animationDelay: '0.3s' }}>
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
              {/* Description */}
              <div className="bg-white dark:bg-neutral-900 rounded-apple-lg p-6 shadow-apple-sm">
                <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Description</h2>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {safe.get(app, 'description', 'No description available')}
                </p>
              </div>

              {/* Mockup Images Carousel */}
              {app?.mockupImages && app.mockupImages.length > 0 && (
                <div className="bg-white dark:bg-neutral-900 rounded-apple-lg p-6 shadow-apple-sm space-y-6">
                  <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Screenshots</h2>
                  
                  {/* Main Image */}
                  <div className="relative aspect-[16/9] rounded-apple-lg overflow-hidden">
                    <img 
                      src={app.mockupImages[mockupImageIndex].imagePath ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/images/${app.mockupImages[mockupImageIndex].imagePath}` : '/placeholder.png'}
                      alt={app.mockupImages[mockupImageIndex].description || `${app.name} screenshot ${mockupImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {app.mockupImages[mockupImageIndex].description && (
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-4">
                        <p className="text-white text-sm">{app.mockupImages[mockupImageIndex].description}</p>
                      </div>
                    )}
                    
                    {/* Navigation Arrows */}
                    {app.mockupImages.length > 1 && (
                      <>
                        <button 
                          onClick={() => setMockupImageIndex((prev) => (prev === 0 ? app.mockupImages.length - 1 : prev - 1))}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => setMockupImageIndex((prev) => (prev === app.mockupImages.length - 1 ? 0 : prev + 1))}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {app.mockupImages.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setMockupImageIndex(index)}
                        className={`relative flex-none w-24 aspect-[16/9] rounded-apple-md overflow-hidden ${index === mockupImageIndex ? 'ring-2 ring-primary-600' : ''}`}
                      >
                        <img 
                          src={image.imagePath ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/images/${image.imagePath}` : '/placeholder.png'}
                          alt={image.description || `${app.name} screenshot ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Contract Addresses */}
              <div className="bg-white dark:bg-neutral-900 rounded-apple-lg p-6 shadow-apple-sm">
                <h2 className="text-xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Contract Addresses</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safe.get(app, 'contractAddresses', []).map((address) => (
                    <div key={address} className="flex items-center p-3 rounded-apple-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                      <span className="text-neutral-700 dark:text-neutral-300">{address}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(address)}
                        className="ml-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 2a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 9h12v2H6z" />
                        </svg>
                      </button>
                    </div>
                  ))}
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
              <div className="space-y-4">
                {reviews?.reviews?.length > 0 ? (
                  reviews.reviews.map((review, index) => (
                    <div key={index} className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-apple-md">
                      <div className="flex items-center mb-2">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">{review.userAddress}</span>
                        <span className="text-neutral-500 dark:text-neutral-400 ml-2 text-sm">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-neutral-300 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg font-medium">No reviews yet</p>
                    <p className="mt-2">Be the first to review this app</p>
                  </div>
                )}
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
    </Layout>
  );
}
