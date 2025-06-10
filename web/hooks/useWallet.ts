import { useState, useEffect } from 'react';
import { connectWallet, getWalletState, signMessage, WalletState } from '../utils/wallet';

export function useWallet() {
  const [walletState, setWalletState] = useState({
    connected: false,
    address: null,
    chainId: null,
    error: null,
    provider: null,
    signer: null
  });

  useEffect(() => {
    // Check if wallet is already connected on component mount
    const checkWalletConnection = async () => {
      const state = await getWalletState();
      setWalletState(state);
    };

    checkWalletConnection();
  }, []);

  const connect = async () => {
    try {
      const state = await connectWallet();
      setWalletState(state);
      return state;
    } catch (error) {
      setWalletState(prev => ({ ...prev, error: error.message }));
      throw error;
    }
  };

  const sign = async (message: string) => {
    if (!walletState.connected) {
      await connect();
    }
    return signMessage(message);
  };

  return {
    ...walletState,
    connect,
    sign
  };
}
