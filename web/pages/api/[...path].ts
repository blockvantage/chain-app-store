import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Get the backend URL from environment variables or use default
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8080';
console.log('Backend URL for catch-all:', BACKEND_URL);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { path } = req.query;
  const endpoint = Array.isArray(path) ? path.join('/') : path;
  
  console.log(`Proxying request to: ${BACKEND_URL}/${endpoint}`);
  console.log('Request method:', req.method);
  console.log('Request query:', req.query);
  
  try {
    // Forward the request to the backend with the same method, query params, and body
    const response = await axios({
      method: req.method as string,
      url: `${BACKEND_URL}/${endpoint}`,
      params: { ...req.query, path: undefined }, // Remove path from query params
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        // Forward any signature headers if present
        ...(req.headers['x-signature'] && { 'X-Signature': req.headers['x-signature'] }),
      },
    });
    
    console.log(`Response status: ${response.status}`);
    
    // Return the response from the backend
    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error(`Error proxying request to ${endpoint}:`, error);
    
    // Forward the error status and message from the backend if available
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'An error occurred';
    
    return res.status(status).json({ message });
  }
}
