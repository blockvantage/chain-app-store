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
      // Forward the request to the backend
      const response = await axios.get(`${BACKEND_URL}/apps/${id}`);
      return res.status(200).json(response.data);
    } else if (req.method === 'PUT') {
      // Forward the PUT request with the body (for admin updates)
      const response = await axios.put(`${BACKEND_URL}/apps/${id}`, req.body, {
        headers: {
          'Content-Type': 'application/json',
          // Forward authorization headers for admin authentication
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
        }
      });
      return res.status(200).json(response.data);
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error(`Error with app ID ${id} API:`, error);
    
    // Forward the error status and message from the backend if available
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'An error occurred';
    
    return res.status(status).json({ message });
  }
}
