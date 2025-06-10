import axios from 'axios';

// Use relative URLs for API calls from the browser
// This will be proxied through Next.js API routes
const apiBaseUrl = '/api';

console.log('API Base URL:', apiBaseUrl);

// Create an axios instance with default config
export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// App interfaces
export interface App {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
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
  const response = await api.get<AppListResponse>('/apps', { params });
  return response.data;
};

export const getApp = async (id: number) => {
  const response = await api.get<App>(`/apps/${id}`);
  return response.data;
};

export const createApp = async (app: Omit<App, 'id' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<App>('/apps', app);
  return response.data;
};

export const getReviews = async (appId: number) => {
  const response = await api.get<ReviewsResponse>(`/reviews/${appId}`);
  return response.data;
};

export const createReview = async (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
  const response = await api.post<Review>('/review', review);
  return response.data;
};

export const getBoostedApps = async () => {
  const response = await api.get<BoostedAppsResponse>('/boosted');
  return response.data;
};

export const createBoost = async (boost: Omit<Boost, 'id' | 'createdAt' | 'updatedAt' | 'expiresAt'>) => {
  const response = await api.post<Boost>('/boost', boost);
  return response.data;
};

export const getLeaderboard = async () => {
  const response = await api.get<LeaderboardResponse>('/leaderboard');
  return response.data;
};

export const getAppContributions = async (appId: number) => {
  const response = await api.get<AppContributionsResponse>(`/contributions/${appId}`);
  return response.data;
};

export const logEngagement = async (engagement: {
  appId: number;
  userAddress: string;
  action: string;
  signature: string;
  txHash?: string;
}) => {
  const response = await api.post('/engage', engagement);
  return response.data;
};

export default api;
