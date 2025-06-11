import type { NextApiRequest, NextApiResponse } from 'next';
import http from 'http';
import { URL } from 'url';

// Get the backend URL from environment variables with appropriate fallbacks
// In Docker: process.env.BACKEND_URL is set to http://backend:8080
// In local dev: process.env.BACKEND_URL should be set to http://localhost:8080
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
console.log('Backend URL for apps:', BACKEND_URL);

export const config = {
  api: {
    // Disable built-in body parser to handle multipart form data
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return new Promise<void>((resolve, reject) => {
    const backendUrl = new URL(BACKEND_URL);
    
    // Create proxy request options
    const options = {
      hostname: backendUrl.hostname,
      port: backendUrl.port,
      path: '/apps',
      method: req.method,
      headers: {
        ...req.headers,
        host: backendUrl.host,
      },
    };

    // Remove headers that might interfere with the proxy request
    delete options.headers['content-length'];
    delete options.headers['transfer-encoding'];

    // Log request headers for debugging
    console.log('Proxying request with headers:', options.headers);

    // Create proxy request
    const proxyReq = http.request(options, (proxyRes) => {
      // Forward the response status and headers
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);

      // Stream the response data
      proxyRes.pipe(res);

      // When the response ends, resolve the promise
      proxyRes.on('end', () => {
        resolve();
      });
    });

    // Handle proxy request errors
    proxyReq.on('error', (error) => {
      console.error('Proxy request error:', error);
      res.status(500).json({ message: 'Internal server error' });
      resolve();
    });

    // If our request has a body, stream it to the proxy request
    if (req.body) {
      req.pipe(proxyReq);
    } else {
      proxyReq.end();
    }

    // Handle client request errors
    req.on('error', (error) => {
      console.error('Client request error:', error);
      res.status(500).json({ message: 'Internal server error' });
      resolve();
    });
  });
}
