import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useConfig } from '../../hooks/useConfig';
import { getApp, getReviews, App, ReviewsResponse } from '../../utils/api';
import { connectWallet, getWalletState, signMessage } from '../../utils/wallet';

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
        if (config?.enableModules.reviews) {
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
    return <div className="text-center py-12">Loading app details...</div>;
  }

  if (error || !app) {
    return <div className="text-center py-12 text-red-500">{error || 'App not found'}</div>;
  }

  return (
    <>
      <Head>
        <title>{app.name} | {config?.chainName || 'Chain App Hub'}</title>
        <meta name="description" content={app.description} />
      </Head>

      <div className="space-y-8">
        {/* App Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 relative">
            <Image 
              src={app.logoUrl || '/placeholder.png'} 
              alt={app.name} 
              fill 
              className="rounded-lg object-cover"
            />
          </div>
          
          <div className="flex-grow">
            <h1 className="text-3xl font-bold">{app.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {app.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-2 text-gray-600">
              Developer: {app.developerAddress.substring(0, 6)}...{app.developerAddress.substring(38)}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <a 
              href={app.websiteUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary"
            >
              Visit Website
            </a>
            <a 
              href={app.repoUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-secondary"
            >
              View Source
            </a>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            
            {config?.enableModules.reviews && (
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reviews
              </button>
            )}
            
            {config?.enableModules.boosting && (
              <button
                onClick={() => setActiveTab('boost')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'boost'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Boost
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-4">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{app.description}</p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-2">Contract Addresses</h2>
                <div className="space-y-2">
                  {app.contractAddresses.map((address, index) => (
                    <div key={index} className="flex items-center">
                      <code className="bg-gray-100 p-2 rounded text-sm flex-grow font-mono">
                        {address}
                      </code>
                      <a 
                        href={`${config?.explorerUrl}/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary-600 hover:text-primary-500"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-2">Transaction</h2>
                <div className="flex items-center">
                  <code className="bg-gray-100 p-2 rounded text-sm flex-grow font-mono">
                    {app.txHash}
                  </code>
                  <a 
                    href={`${config?.explorerUrl}/tx/${app.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary-600 hover:text-primary-500"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && config?.enableModules.reviews && (
            <div className="space-y-6">
              {/* Reviews component will be implemented separately */}
              <p>Reviews functionality will be implemented here</p>
            </div>
          )}

          {activeTab === 'boost' && config?.enableModules.boosting && (
            <div className="space-y-6">
              {/* Boost component will be implemented separately */}
              <p>Boosting functionality will be implemented here</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
