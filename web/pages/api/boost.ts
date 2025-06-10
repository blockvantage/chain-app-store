import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Get the backend URL from environment variables or use default
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8080';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Forward the POST request to create a new boost
    const response = await axios.post(`${BACKEND_URL}/boost`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        // Forward any authorization headers
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization })
      }
    });
    
    return res.status(201).json(response.data);
  } catch (error: any) {
    console.error('Error creating boost:', error);
    
    // Forward the error status and message from the backend if available
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'An error occurred';
    
    return res.status(status).json({ message });
  }
}
