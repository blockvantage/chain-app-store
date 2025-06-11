import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const walletAddress = req.headers['wallet-address'];
  const { appId } = req.body;

  if (!walletAddress || !appId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/hide`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'wallet-address': walletAddress as string
      },
      body: JSON.stringify({ appId })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error hiding app:', error);
    return res.status(500).json({ error: 'Failed to hide app' });
  }
}
