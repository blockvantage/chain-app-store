import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Get the backend URL from environment variables or use default
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8080';
console.log('Backend URL for leaderboard:', BACKEND_URL);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Forward the request to get the leaderboard
    const response = await axios.get(`${BACKEND_URL}/leaderboard`);
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    
    // Forward the error status and message from the backend if available
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'An error occurred';
    
    return res.status(status).json({ message });
  }
}
