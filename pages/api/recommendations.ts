import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { user_id, limit = '10' } = req.query;
  if (!user_id || Array.isArray(user_id)) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  const n = Math.max(1, Math.min(50, parseInt(String(limit), 10) || 10));
  const items = Array.from({ length: n }).map((_, i) => ({ id: i + 1, title: `Internship ${i + 1}`, company: 'TechCorp', score: 0.5 + i / (2 * n) }));
  return res.status(200).json({ user_id, items });
}

