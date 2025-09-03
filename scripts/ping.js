// Lightweight ping script for Render Cron Jobs or manual runs
// Usage: node scripts/ping.js
// Env: PING_URL overrides default
const https = require('https');

const url = process.env.PING_URL || 'https://flashcard-rs95.onrender.com/';

function ping(u) {
  return new Promise((resolve, reject) => {
    const req = https.get(u, (res) => {
      if (res.statusCode === 200) {
        resolve({ ok: true, status: res.statusCode });
      } else {
        reject(new Error(`Ping failed with status ${res.statusCode}`));
      }
    });
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy(new Error('Ping timeout'));
    });
    req.end();
  });
}

ping(url)
  .then((r) => {
    console.log(`[ping] OK -> ${url} (status ${r.status})`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(`[ping] FAILED -> ${url}:`, e.message);
    process.exit(1);
  });

