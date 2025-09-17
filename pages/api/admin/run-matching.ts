import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    await new Promise((r) => setTimeout(r, 500));
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

