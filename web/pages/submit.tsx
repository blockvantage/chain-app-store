import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useConfig } from '../hooks/useConfig';
import { createApp } from '../utils/api';
import Layout from '../components/Layout';

export default function SubmitApp() {
  const router = useRouter();
  const { config, loading: configLoading } = useConfig();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contractAddresses: [''],
    repoUrl: '',
    websiteUrl: '',
    tags: [''],
    txHash: '',
    // Social media links (optional)
    twitterUrl: '',
    discordUrl: '',
    telegramUrl: '',
    mediumUrl: '',
    githubUrl: '',
  });

  // Validate URL format
  const isValidUrl = (url: string) => {
    if (!url) return true; // Empty URLs are valid (optional fields)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  // State for logo file
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  
  // State for mockup images
  const [mockupImages, setMockupImages] = useState<File[]>([]);
  const [imageDescriptions, setImageDescriptions] = useState<string[]>([]);
  
  // const [walletConnected, setWalletConnected] = useState(false);
  // const [walletAddress, setWalletAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // useEffect(() => {
  //   const checkWallet = () => {
  //     const state = getWalletState();
  //     setWalletConnected(state.connected);
  //     if (state.address) {
  //       setWalletAddress(state.address);
  //     }
  //   };
    
  //   checkWallet();
  // }, []);

  // const handleConnectWallet = async () => {
  //   try {
  //     const state = await connectWallet();
  //     setWalletConnected(true);
  //     setWalletAddress(state.address || '');
  //   } catch (err) {
  //     console.error('Error connecting wallet:', err);
  //     setError('Failed to connect wallet. Please make sure you have MetaMask installed.');
  //   }
  // };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (index: number, field: 'contractAddresses' | 'tags', value: string) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const addArrayItem = (field: 'contractAddresses' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index: number, field: 'contractAddresses' | 'tags') => {
    if (formData[field].length <= 1) return;
    
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray.splice(index, 1);
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  // Handle mockup image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files);
      setMockupImages(prev => [...prev, ...newImages]);
      setImageDescriptions(prev => [...prev, ...newImages.map(() => '')]);
    }
  };

  // Handle image description change
  const handleImageDescriptionChange = (index: number, description: string) => {
    const newDescriptions = [...imageDescriptions];
    newDescriptions[index] = description;
    setImageDescriptions(newDescriptions);
  };

  // Remove an image
  const removeImage = (index: number) => {
    setMockupImages(prev => prev.filter((_, i) => i !== index));
    setImageDescriptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) throw new Error('App name is required');
      if (!formData.description.trim()) throw new Error('Description is required');
      if (!logoFile) throw new Error('App logo is required');
      if (!formData.repoUrl.trim()) throw new Error('Repository URL is required');
      
      // Validate URLs
      const urlFields = {
        'Repository URL': formData.repoUrl,
        'Website URL': formData.websiteUrl,
        'Twitter URL': formData.twitterUrl,
        'Discord URL': formData.discordUrl,
        'Telegram URL': formData.telegramUrl,
        'Medium URL': formData.mediumUrl,
        'GitHub URL': formData.githubUrl
      };

      for (const [fieldName, url] of Object.entries(urlFields)) {
        if (url && !isValidUrl(url)) {
          throw new Error(`Invalid ${fieldName} format`);
        }
      }

      // Prepare app data by filtering empty contract addresses and tags
      const appData = {
        ...formData,
        contractAddresses: formData.contractAddresses.filter(addr => addr.trim()),
        tags: formData.tags.filter(tag => tag.trim())
      };

      // Submit using the API utility
      await createApp(appData, logoFile, mockupImages, imageDescriptions);

      setSuccess(true);
      
      // Redirect to app page after a delay
      setTimeout(() => {
        router.push('/apps');
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting app:', err);
      setError(err.response?.data?.error || err.message || 'Failed to submit app. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <Head>
        <title>Submit App | {config?.chainName || 'Chain App Hub'}</title>
        <meta name="description" content={`Submit your app to ${config?.chainName || 'Chain App Hub'}`} />
      </Head>

      <div className="max-w-3xl mx-auto animate-apple-fade-in">
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Submit Your App</h1>
        
        {configLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-apple-spin w-8 h-8 border-2 border-t-blue-500 border-blue-200 rounded-full"></div>
            <span className="ml-3 text-neutral-600 dark:text-neutral-300">Loading...</span>
          </div>
        ) : success ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-6 py-4 rounded-apple-lg shadow-apple-sm animate-apple-fade-in" role="alert">
            <h3 className="font-medium text-lg mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
              Success!
            </h3>
            <p className="mb-2">Your app has been submitted successfully.</p>
            <p className="text-sm opacity-75">Redirecting to apps page...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Wallet Connection - Commented out
            <div className="bg-neutral-50 dark:bg-neutral-800/40 p-6 rounded-apple-lg shadow-apple-sm border border-neutral-100 dark:border-neutral-700">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-medium flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    Connect Wallet
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Connect your wallet to submit your app as a developer
                  </p>
                </div>
                {walletConnected ? (
                  <div className="flex items-center bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-apple-md border border-green-200 dark:border-green-800">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                    </svg>
                    <span className="font-medium">{walletAddress.substring(0, 6)}...{walletAddress.substring(38)}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-apple-md shadow-apple-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
            */}
            
            {/* App Details */}
            <div className="bg-neutral-50 dark:bg-neutral-800/40 p-6 rounded-apple-lg shadow-apple-sm border border-neutral-100 dark:border-neutral-700">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                App Details
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    App Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-apple-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 rounded-apple-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                  />
                </div>
                
                <div>
                  <label htmlFor="logo" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    App Logo *
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    {logoPreview && (
                      <div className="relative w-16 h-16">
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoFile(null);
                            setLogoPreview('');
                          }}
                          className="absolute -top-2 -right-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full p-1 hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <label className="flex-1">
                      <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 border-dashed rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700/50 cursor-pointer">
                        <div className="flex flex-col items-center space-y-2">
                          <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                          </svg>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {logoFile ? 'Change logo' : 'Upload app logo'}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            PNG, JPG or GIF (max 2MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          id="logo"
                          accept="image/*"
                          
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setLogoFile(file);
                              setLogoPreview(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-50 dark:bg-neutral-800/40 p-6 rounded-apple-lg shadow-apple-sm border border-neutral-100 dark:border-neutral-700">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
                Contract Addresses
              </h3>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Contract Addresses *
                </label>
                {formData.contractAddresses.map((address, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => handleArrayInputChange(index, 'contractAddresses', e.target.value)}
                      
                      className="flex-grow px-4 py-2 rounded-apple-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                      placeholder="0x..."
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'contractAddresses')}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-apple-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('contractAddresses')}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-blue-300 dark:border-blue-700 text-sm font-medium rounded-apple-md text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Another Contract
                </button>
              </div>
            </div>
            
            <div className="bg-neutral-50 dark:bg-neutral-800/40 p-6 rounded-apple-lg shadow-apple-sm border border-neutral-100 dark:border-neutral-700">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
                URLs
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label htmlFor="repoUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Repository URL *
                  </label>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-l-apple-md px-3 py-2 border border-neutral-300 dark:border-neutral-600 border-r-0">
                      <svg className="w-5 h-5 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                      </svg>
                    </div>
                    <input
                      type="url"
                      id="repoUrl"
                      name="repoUrl"
                      value={formData.repoUrl}
                      onChange={handleInputChange}
                      
                      className="flex-grow px-4 py-2 rounded-r-apple-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="websiteUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Website URL *
                  </label>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-l-apple-md px-3 py-2 border border-neutral-300 dark:border-neutral-600 border-r-0">
                      <svg className="w-5 h-5 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                      </svg>
                    </div>
                    <input
                      type="url"
                      id="websiteUrl"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleInputChange}
                      
                      className="flex-grow px-4 py-2 rounded-r-apple-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-50 dark:bg-neutral-800/40 p-6 rounded-apple-lg shadow-apple-sm border border-neutral-100 dark:border-neutral-700">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                </svg>
                Tags
              </h3>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Tags *
                </label>
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleArrayInputChange(index, 'tags', e.target.value)}
                      
                      className="flex-grow px-4 py-2 rounded-apple-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                      placeholder="DeFi, NFT, Gaming, etc."
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem(index, 'tags')}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-apple-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-150"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('tags')}
                  className="mt-3 inline-flex items-center px-4 py-2 border border-blue-300 dark:border-blue-700 text-sm font-medium rounded-apple-md text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add Another Tag
                </button>
              </div>
            </div>
            
            <div className="bg-neutral-50 dark:bg-neutral-800/40 p-6 rounded-apple-lg shadow-apple-sm border border-neutral-100 dark:border-neutral-700">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                App Mockup Images
              </h3>
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Upload screenshots or mockups of your app (optional)
                </label>
                
                {mockupImages.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {mockupImages.map((image, index) => (
                      <div key={index} className="border border-neutral-200 dark:border-neutral-700 rounded-apple-md p-3 bg-white dark:bg-neutral-800">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            {image.name}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => removeImage(index)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        </div>
                        
                        <div className="relative h-40 bg-neutral-100 dark:bg-neutral-900 rounded-apple-md overflow-hidden mb-2">
                          <img 
                            src={URL.createObjectURL(image)} 
                            alt={`Preview ${index}`} 
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                        </div>
                        
                        <input
                          type="text"
                          value={imageDescriptions[index] || ''}
                          onChange={(e) => handleImageDescriptionChange(index, e.target.value)}
                          placeholder="Image description (optional)"
                          className="w-full px-3 py-2 text-sm rounded-apple-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-neutral-300 border-dashed rounded-apple-lg cursor-pointer bg-neutral-50 dark:bg-neutral-800/60 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">PNG, JPG or GIF (MAX. 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageUpload} 
                    />
                  </label>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-50 dark:bg-neutral-800/40 p-6 rounded-apple-lg shadow-apple-sm border border-neutral-100 dark:border-neutral-700">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                </svg>
                Social Media
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="twitterUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Twitter URL
                  </label>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-l-apple-md px-3 py-2 border border-neutral-300 dark:border-neutral-600 border-r-0">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </div>
                    <input
                      type="url"
                      id="twitterUrl"
                      name="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={handleInputChange}
                      className="flex-grow px-4 py-2 rounded-r-apple-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                      placeholder="https://twitter.com/yourusername"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="discordUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Discord URL
                  </label>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-l-apple-md px-3 py-2 border border-neutral-300 dark:border-neutral-600 border-r-0">
                      <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </div>
                    <input
                      type="url"
                      id="discordUrl"
                      name="discordUrl"
                      value={formData.discordUrl}
                      onChange={handleInputChange}
                      className="flex-grow px-4 py-2 rounded-r-apple-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                      placeholder="https://discord.gg/yourinvite"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="telegramUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Telegram URL
                  </label>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-l-apple-md px-3 py-2 border border-neutral-300 dark:border-neutral-600 border-r-0">
                      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </div>
                    <input
                      type="url"
                      id="telegramUrl"
                      name="telegramUrl"
                      value={formData.telegramUrl}
                      onChange={handleInputChange}
                      className="flex-grow px-4 py-2 rounded-r-apple-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                      placeholder="https://t.me/yourusername"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="mediumUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Medium URL
                  </label>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-l-apple-md px-3 py-2 border border-neutral-300 dark:border-neutral-600 border-r-0">
                      <svg className="w-5 h-5 text-neutral-800 dark:text-neutral-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
                      </svg>
                    </div>
                    <input
                      type="url"
                      id="mediumUrl"
                      name="mediumUrl"
                      value={formData.mediumUrl}
                      onChange={handleInputChange}
                      className="flex-grow px-4 py-2 rounded-r-apple-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                      placeholder="https://medium.com/@yourusername"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="githubUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    GitHub URL
                  </label>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-l-apple-md px-3 py-2 border border-neutral-300 dark:border-neutral-600 border-r-0">
                      <svg className="w-5 h-5 text-neutral-900 dark:text-neutral-100" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </div>
                    <input
                      type="url"
                      id="githubUrl"
                      name="githubUrl"
                      value={formData.githubUrl}
                      onChange={handleInputChange}
                      className="flex-grow px-4 py-2 rounded-r-apple-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-50 dark:bg-neutral-800/40 p-6 rounded-apple-lg shadow-apple-sm border border-neutral-100 dark:border-neutral-700">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Transaction Details
              </h3>
              
              <div>
                <label htmlFor="txHash" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Transaction Hash (Listing Fee) *
                </label>
                <div className="flex items-center">
                  <div className="flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-l-apple-md px-3 py-2 border border-neutral-300 dark:border-neutral-600 border-r-0">
                    <svg className="w-5 h-5 text-neutral-500 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="txHash"
                    name="txHash"
                    value={formData.txHash}
                    onChange={handleInputChange}
                    required
                    className="flex-grow px-4 py-2 rounded-r-apple-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-150"
                    placeholder="0x..."
                  />
                </div>
                <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                  Please provide the transaction hash for the listing fee payment of {config?.listingFee?.amount} {config?.listingFee?.token}
                </p>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-apple-md shadow-apple-sm animate-apple-fade-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-apple-md shadow-apple-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-150 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-apple-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Submit App
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
