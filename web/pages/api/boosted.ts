import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Get the backend URL from environment variables with appropriate fallbacks
// In Docker: process.env.BACKEND_URL is set to http://backend:8080
// In local dev: process.env.BACKEND_URL should be set to http://localhost:8080
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
console.log('Backend URL for boosted apps:', BACKEND_URL);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Forward the request to get boosted apps
    const response = await axios.get(`${BACKEND_URL}/boosted`);
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error('Error fetching boosted apps:', error);
    
    // Forward the error status and message from the backend if available
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'An error occurred';
    
    return res.status(status).json({ message });
  }
}
