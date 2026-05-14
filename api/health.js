export default async function handler(req, res) {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'RWA Proxy is running!'
  });
}
