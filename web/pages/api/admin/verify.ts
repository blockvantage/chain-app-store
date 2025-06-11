import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const walletAddress = req.headers['wallet-address'];

  if (!walletAddress) {
    return res.status(401).json({ error: 'No wallet address provided' });
  }

  try {
    // Make a request to the backend to verify if the wallet is an admin
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/verify`, {
      headers: {
        'wallet-address': walletAddress as string
      }
    });
    
    const data = await response.json();
    return res.status(200).json({ isAdmin: data.isAdmin });
  } catch (error) {
    console.error('Error verifying admin:', error);
    return res.status(500).json({ error: 'Failed to verify admin status' });
  }
}
