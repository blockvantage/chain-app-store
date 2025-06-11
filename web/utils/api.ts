import axios from 'axios';

// Create an axios instance with default config
export const api = axios.create();

// Function to fetch config and set base URL
const initializeApi = async () => {
  try {
    const response = await fetch('/config.json');
    const config = await response.json();
    
    // In development, use localhost:8080 directly
    if (process.env.NODE_ENV === 'development') {
      api.defaults.baseURL = 'http://localhost:8080';
    } else {
      // In production, use the configured backend URL
      api.defaults.baseURL = config.backendUrl;
    }
    
    console.log('API Base URL set:', api.defaults.baseURL);
  } catch (error) {
    console.error('Error loading config:', error);
    // Fallback to localhost in development
    if (process.env.NODE_ENV === 'development') {
      api.defaults.baseURL = 'http://localhost:8080/api';
    }
  }
};

// Initialize the API configuration
initializeApi();

// App interfaces
export interface AppImage {
  id: number;
  filename: string;
  imagePath: string;
  description?: string;
  order: number;
}

export interface App {
  ID: number;
  name: string;
  description: string;
  logoPath: string;
  contractAddresses: string[];
  developerAddress: string;
  repoUrl: string;
  websiteUrl: string;
  tags: string[];
  featured: boolean;
  hidden: boolean;
  txHash: string;
  createdAt: string;
  updatedAt: string;
  mockupImages?: AppImage[];
  twitterUrl?: string;
  discordUrl?: string;
  telegramUrl?: string;
  mediumUrl?: string;
  githubUrl?: string;
}

export interface AppListResponse {
  apps: App[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    pages: number;
  };
}

// Review interfaces
export interface Review {
  id: number;
  appId: number;
  userAddress: string;
  rating: number;
  comment: string;
  signature: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  count: number;
  avgRating: number;
}

// Boost interfaces
export interface Boost {
  id: number;
  appId: number;
  userAddress: string;
  amount: string;
  tokenSymbol: string;
  txHash: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoostedApp extends App {
  boostTotal: number;
}

export interface BoostedAppsResponse {
  apps: BoostedApp[];
}

// POE interfaces
export interface LeaderboardEntry {
  userAddress: string;
  total: number;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

export interface AppContribution {
  userAddress: string;
  total: number;
}

export interface AppContributionsResponse {
  appId: number;
  appName: string;
  contributions: AppContribution[];
}

// API functions
export const getApps = async (page = 1, pageSize = 20, featured = false, category?: string) => {
  const params = { page, pageSize, featured: featured ? 'true' : undefined, category };
  const response = await api.get<AppListResponse>('/api/apps', { params });
  return response.data;
};

export const getApp = async (id: number) => {
  const response = await api.get<App>(`/api/apps/${id}`);
  return response.data;
};

export async function createApp(appData: any, logo: File, mockups?: File[], descriptions?: string[]) {
  const formData = new FormData();
  formData.append('appData', JSON.stringify(appData));
  formData.append('logo', logo);

  if (mockups && mockups.length > 0) {
    mockups.forEach((mockup, index) => {
      formData.append(`mockups[${index}]`, mockup);
      formData.append(`descriptions[${index}]`, descriptions?.[index] || '');
    });
  }

  const response = await api.post<App>('/api/apps', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getReviews = async (appId: number) => {
  const response = await api.get<ReviewsResponse>(`/api/reviews/${appId}`);
  return response.data;
};

export const createReview = async (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<Review>('/api/review', review);
  return response.data;
};

export const getBoostedApps = async () => {
  const response = await api.get<BoostedAppsResponse>('/api/boosted');
  return response.data;
};

export const createBoost = async (boost: Omit<Boost, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'>) => {
  const response = await api.post<Boost>('/api/boost', boost);
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await api.get<LeaderboardResponse>('/api/leaderboard');
  return response.data;
};

export const getAppContributions = async (appId: number) => {
  const response = await api.get<AppContributionsResponse>(`/api/contributions/${appId}`);
  return response.data;
};

export const logEngagement = async (engagement: {
  appId: number;
  userAddress: string;
  action: string;
  signature: string;
  txHash?: string;
}) => {
  const response = await api.post('/api/engage', engagement);
  return response.data;
};

export default api;
