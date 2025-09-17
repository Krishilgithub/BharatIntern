import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  const { company_id } = req.query;
  if (!company_id || Array.isArray(company_id)) {
    return res.status(400).json({ error: 'company_id is required' });
  }
  return res.status(200).json({ company_id, candidates: [{ id: 1, name: 'John Doe' }] });
}

