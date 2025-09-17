import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    // In a real app, parse and process the resume file here
    return res.status(200).json({ success: true, score: 87, keywords: ['React', 'Next.js', 'Tailwind'] });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

