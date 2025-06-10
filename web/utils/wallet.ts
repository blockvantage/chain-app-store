import { ethers } from 'ethers';

export interface WalletState {
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  connected: boolean;
  error: string | null;
}

const initialState: WalletState = {
  address: null,
  provider: null,
  signer: null,
  chainId: null,
  connected: false,
  error: null,
};

let walletState = { ...initialState };
let listeners: Array<(state: WalletState) => void> = [];

export const connectWallet = async (): Promise<WalletState> => {
  if (!window.ethereum) {
    throw new Error('No Ethereum wallet found. Please install MetaMask or another wallet.');
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create ethers provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    // Get signer and address
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // Get chain ID
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    // Update state
    walletState = {
      address,
      provider,
      signer,
      chainId,
      connected: true,
      error: null,
    };
    
    // Notify listeners
    notifyListeners();
    
    // Setup event listeners
    setupEventListeners();
    
    return walletState;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const disconnectWallet = (): void => {
  walletState = { ...initialState };
  notifyListeners();
};

export const getWalletState = (): WalletState => {
  return { ...walletState };
};

export const signMessage = async (message: string): Promise<string> => {
  if (!walletState.signer) {
    throw new Error('Wallet not connected');
  }
  
  try {
    return await walletState.signer.signMessage(message);
  } catch (error) {
    console.error('Error signing message:', error);
    throw error;
  }
};

export const addWalletListener = (listener: (state: WalletState) => void): void => {
  listeners.push(listener);
};

export const removeWalletListener = (listener: (state: WalletState) => void): void => {
  listeners = listeners.filter(l => l !== listener);
};

const notifyListeners = (): void => {
  listeners.forEach(listener => listener({ ...walletState }));
};

const setupEventListeners = (): void => {
  if (!window.ethereum) return;
  
  // Handle account changes
  window.ethereum.on('accountsChanged', async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet();
    } else {
      // Account changed, update state
      if (walletState.provider) {
        const signer = await walletState.provider.getSigner();
        walletState.signer = signer;
        walletState.address = accounts[0];
        notifyListeners();
      }
    }
  });
  
  // Handle chain changes
  window.ethereum.on('chainChanged', async (chainIdHex: string) => {
    // Parse chain ID from hex to decimal
    const chainId = parseInt(chainIdHex, 16);
    walletState.chainId = chainId;
    
    // Update provider and signer
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      walletState.provider = provider;
      walletState.signer = signer;
      
      notifyListeners();
    }
  });
  
  // Handle disconnect
  window.ethereum.on('disconnect', () => {
    disconnectWallet();
  });
};

// Add TypeScript type definition for window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
