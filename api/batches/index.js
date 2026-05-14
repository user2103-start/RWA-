import { batches } from '../../data/batches.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { search, category } = req.query;
  let result = [...batches];

  if (search) {
    const searchLower = search.toLowerCase();
    result = result.filter(b => 
      b.name.toLowerCase().includes(searchLower)
    );
  }

  if (category && category !== 'all') {
    result = result.filter(b => b.category === category);
  }

  res.json({
    success: true,
    batches: result,
    total: result.length
  });
}
