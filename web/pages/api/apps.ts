import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Get the backend URL from environment variables or use default
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8080';
console.log('Backend URL for apps:', BACKEND_URL);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Forward the request to the backend with the same method, query params, and body
    const response = await axios({
      method: req.method,
      url: `${BACKEND_URL}/apps`,
      params: req.query,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        // Forward any signature headers if present
        ...(req.headers['x-signature'] && { 'X-Signature': req.headers['x-signature'] }),
      },
    });
    
    // Return the response from the backend
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error proxying apps request:', error);
    return res.status(500).json({ message: 'Failed to fetch apps data' });
  }
}
