import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Get the backend URL from environment variables or use default
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8080';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: 'Invalid app ID' });
  }

  try {
    if (req.method === 'GET') {
      // Forward the request to get reviews for an app
      const response = await axios.get(`${BACKEND_URL}/reviews/${id}`);
      return res.status(200).json(response.data);
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error(`Error with reviews for app ID ${id} API:`, error);
    
    // Forward the error status and message from the backend if available
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'An error occurred';
    
    return res.status(status).json({ message });
  }
}
