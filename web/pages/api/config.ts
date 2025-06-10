import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Get the backend URL from environment variables or use default
// In Next.js API routes, we can access server-side environment variables directly
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8080';
console.log('Backend URL:', BACKEND_URL);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Fetch config from backend
    const response = await axios.get(`${BACKEND_URL}/config`);
    
    // Return the config data
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching config:', error);
    return res.status(500).json({ message: 'Failed to fetch configuration' });
  }
}
