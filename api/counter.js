const https = require('https');

function brevoRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'GET') {
    try {
      const data = await brevoRequest({
        hostname: 'api.brevo.com',
        path: '/v3/contacts/lists/2',
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        }
      });
      res.status(200).json({ count: data.uniqueSubscribers || 0 });
    } catch (e) {
      res.status(200).json({ count: 0 });
    }
  }

  if (req.method === 'POST') {
    try {
      const { email } = req.body;
      const body = JSON.stringify({ email, listIds: [2], updateEnabled: true });
      await brevoRequest({
        hostname: 'api.brevo.com',
        path: '/v3/contacts',
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body),
          'api-key': process.env.BREVO_API_KEY
        }
      }, body);
      res.status(200).json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false });
    }
  }
}