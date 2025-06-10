import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Get the backend URL from environment variables or use default
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8080';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      // Extract query parameters
      const { page, pageSize, featured, category } = req.query;
      
      // Forward the request to the backend
      const response = await axios.get(`${BACKEND_URL}/apps`, {
        params: {
          page,
          pageSize,
          featured,
          category
        }
      });
      
      return res.status(200).json(response.data);
    } else if (req.method === 'POST') {
      // Forward the POST request with the body
      const response = await axios.post(`${BACKEND_URL}/apps`, req.body, {
        headers: {
          'Content-Type': 'application/json',
          // Forward any authorization headers
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
        }
      });
      
      return res.status(201).json(response.data);
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Error with apps API:', error);
    
    // Forward the error status and message from the backend if available
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'An error occurred';
    
    return res.status(status).json({ message });
  }
}
