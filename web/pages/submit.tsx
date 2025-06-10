import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useWallet } from '../hooks/useWallet';
import { useConfig } from '../hooks/useConfig';
import { createApp, api } from '../utils/api';
import { connectWallet, getWalletState, signMessage } from '../utils/wallet';

export default function SubmitApp() {
  const router = useRouter();
  const { config, loading: configLoading } = useConfig();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    contractAddresses: [''],
    repoUrl: '',
    websiteUrl: '',
    tags: [''],
    txHash: '',
  });
  
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkWallet = () => {
      const state = getWalletState();
      setWalletConnected(state.connected);
      if (state.address) {
        setWalletAddress(state.address);
      }
    };
    
    checkWallet();
  }, []);

  const handleConnectWallet = async () => {
    try {
      const state = await connectWallet();
      setWalletConnected(true);
      setWalletAddress(state.address || '');
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet. Please make sure you have MetaMask installed.');
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Create message to sign
      const message = `Submit app ${formData.name} to ${config?.chainName || 'Chain App Hub'}`;
      
      // Get signature
      const signature = await signMessage(message);
      
      // Submit app with developer address from wallet
      // We need to separate the signature from the app data
      // as the App interface doesn't include a signature field
      const appData = {
        ...formData,
        developerAddress: walletAddress,
        featured: false,
        hidden: false,
      };
      
      // Add the signature to the request headers
      api.defaults.headers.common['X-Signature'] = signature;
      
      await createApp(appData);
      
      setSuccess(true);
      
      // Redirect to apps page after successful submission
      setTimeout(() => {
        router.push('/apps');
      }, 3000);
    } catch (err) {
      console.error('Error submitting app:', err);
      setError('Failed to submit app. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Submit App | {config?.chainName || 'Chain App Hub'}</title>
        <meta name="description" content={`Submit your app to ${config?.chainName || 'Chain App Hub'}`} />
      </Head>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Submit Your App</h1>
        
        {!configLoading && config?.listingFee && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Listing an app requires a fee of {config.listingFee.amount} {config.listingFee.token}.
                  Please complete the transaction and provide the transaction hash below.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {success ? (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Your app has been submitted successfully! Redirecting to apps page...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wallet Connection */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium">Connect Wallet</h2>
                  <p className="text-sm text-gray-500">
                    Connect your wallet to submit your app as a developer
                  </p>
                </div>
                {walletConnected ? (
                  <div className="text-green-600 font-medium">
                    Connected: {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className="btn-primary"
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
            
            {/* App Details */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                App Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 input-field w-full"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="mt-1 input-field w-full"
              />
            </div>
            
            <div>
              <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
                Logo URL *
              </label>
              <input
                type="url"
                id="logoUrl"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleInputChange}
                required
                className="mt-1 input-field w-full"
                placeholder="https://example.com/logo.png"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contract Addresses *
              </label>
              {formData.contractAddresses.map((address, index) => (
                <div key={index} className="flex mt-1">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => handleArrayInputChange(index, 'contractAddresses', e.target.value)}
                    required
                    className="input-field flex-grow"
                    placeholder="0x..."
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'contractAddresses')}
                    className="ml-2 text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('contractAddresses')}
                className="mt-2 text-primary-600"
              >
                + Add Another Contract
              </button>
            </div>
            
            <div>
              <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-700">
                Repository URL *
              </label>
              <input
                type="url"
                id="repoUrl"
                name="repoUrl"
                value={formData.repoUrl}
                onChange={handleInputChange}
                required
                className="mt-1 input-field w-full"
                placeholder="https://github.com/username/repo"
              />
            </div>
            
            <div>
              <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
                Website URL *
              </label>
              <input
                type="url"
                id="websiteUrl"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                required
                className="mt-1 input-field w-full"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tags *
              </label>
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex mt-1">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleArrayInputChange(index, 'tags', e.target.value)}
                    required
                    className="input-field flex-grow"
                    placeholder="DeFi, NFT, Gaming, etc."
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'tags')}
                    className="ml-2 text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('tags')}
                className="mt-2 text-primary-600"
              >
                + Add Another Tag
              </button>
            </div>
            
            <div>
              <label htmlFor="txHash" className="block text-sm font-medium text-gray-700">
                Transaction Hash (Listing Fee) *
              </label>
              <input
                type="text"
                id="txHash"
                name="txHash"
                value={formData.txHash}
                onChange={handleInputChange}
                required
                className="mt-1 input-field w-full"
                placeholder="0x..."
              />
              <p className="mt-1 text-sm text-gray-500">
                Please provide the transaction hash for the listing fee payment
              </p>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !walletConnected}
                className={`btn-primary ${(submitting || !walletConnected) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {submitting ? 'Submitting...' : 'Submit App'}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
