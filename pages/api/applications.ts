import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { user_id } = req.query;
  if (!user_id || Array.isArray(user_id)) {
    return res.status(400).json({ error: 'user_id is required' });
  }
  const items = [
    { id: 1, title: 'Frontend Intern', status: 'Under Review' },
    { id: 2, title: 'Backend Intern', status: 'Interview Scheduled' },
  ];
  return res.status(200).json({ user_id, items });
}

