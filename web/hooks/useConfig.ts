import { useState, useEffect } from 'react';
import axios from 'axios';

// Define the config interface based on the backend structure
interface LogoConfig {
  light: string;
  dark: string;
}

interface ModulesConfig {
  poe: boolean;
  boosting: boolean;
  reviews: boolean;
}

interface ListingFeeConfig {
  amount: string;
  token: string;
}

export interface Config {
  chainName: string;
  primaryToken: string;
  rpcUrl: string;
  explorerUrl: string;
  logos: LogoConfig;
  enableModules: ModulesConfig;
  listingFee: ListingFeeConfig;
}

export const useConfig = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // First try to fetch from the backend
        const response = await axios.get('/api/config');
        setConfig(response.data);
      } catch (backendError) {
        try {
          // If backend fails, try to fetch directly from the config file
          // This is useful for local development or static deployments
          const response = await fetch('/config.json');
          if (!response.ok) {
            throw new Error('Failed to fetch config');
          }
          const data = await response.json();
          setConfig(data);
        } catch (configError) {
          console.error('Error fetching config:', configError);
          setError('Failed to load configuration');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error };
};
