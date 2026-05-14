const jwt = require('jsonwebtoken');

// In-memory storage (Vercel edge case - will reset on cold start)
const otpStore = new Map();

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { phoneNumber, username } = req.body;

  if (!phoneNumber || phoneNumber.length !== 10) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid phone number. Please enter 10 digits." 
    });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(phoneNumber, { otp, expiresAt });

  console.log(`[OTP] ${phoneNumber} → ${otp}`);

  // In production, send SMS via Twilio/MSG91
  // For testing, return OTP in response (remove in production)
  res.json({ 
    success: true, 
    message: "OTP sent successfully",
    debug_otp: otp  // Remove this in production!
  });
}

export { otpStore };
