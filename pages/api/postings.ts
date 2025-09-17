import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const items = [
      { id: 1, title: 'Fullstack Intern', company: 'TechCorp', location: 'Bangalore' },
      { id: 2, title: 'Data Science Intern', company: 'DataLabs', location: 'Remote' },
    ];
    return res.status(200).json({ items });
  }
  if (req.method === 'POST') {
    const body = req.body ?? {};
    if (!body || !body.title) {
      return res.status(400).json({ error: 'Invalid posting payload' });
    }
    return res.status(201).json({ id: Date.now(), ...body });
  }
  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method Not Allowed' });
}

