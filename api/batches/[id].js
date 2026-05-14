import { batches } from '../../data/batches.js';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  const batch = batches.find(b => b.id === id);

  if (!batch) {
    return res.status(404).json({ success: false, message: 'Batch not found' });
  }

  res.json({ success: true, batch });
}
