import { userStore } from '../pw/verify.js';
import { batches } from '../../data/batches.js';

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'rwa-secret-key-2024';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  const { batchId } = req.body;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  let userData;
  try {
    userData = jwt.verify(token, JWT_SECRET);
  } catch(e) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  const user = userStore.get(userData.phone);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const index = user.enrolledBatches.indexOf(batchId);
  if (index === -1) {
    return res.status(400).json({ success: false, message: 'Not enrolled' });
  }

  user.enrolledBatches.splice(index, 1);
  userStore.set(userData.phone, user);

  res.json({ 
    success: true, 
    message: "Unenrolled successfully",
    enrolled: false
  });
}
