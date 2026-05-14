import { otpStore } from './login.js';

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'rwa-secret-key-2024';

// User store (in-memory - will reset on cold start)
const userStore = new Map();

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { phoneNumber, otp, username } = req.body;

  const record = otpStore.get(phoneNumber);

  if (!record) {
    return res.status(400).json({ 
      success: false, 
      message: "No OTP requested. Please request OTP first." 
    });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phoneNumber);
    return res.status(400).json({ 
      success: false, 
      message: "OTP expired. Please request new OTP." 
    });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid OTP. Please try again." 
    });
  }

  // OTP verified - Create or get user
  let user = userStore.get(phoneNumber);
  if (!user) {
    user = {
      id: Date.now().toString(),
      phone: phoneNumber,
      name: username || `User_${phoneNumber.slice(-4)}`,
      createdAt: new Date().toISOString(),
      enrolledBatches: []
    };
    userStore.set(phoneNumber, user);
  }

  // Clean up OTP
  otpStore.delete(phoneNumber);

  // Generate JWT token
  const token = jwt.sign(
    { 
      id: user.id, 
      phone: user.phone,
      name: user.name,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
    },
    JWT_SECRET
  );

  res.json({
    success: true,
    accessToken: token,
    refreshToken: token,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      createdAt: user.createdAt
    }
  });
}

export { userStore };
