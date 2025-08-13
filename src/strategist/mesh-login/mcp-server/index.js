const http = require('http');
const crypto = require('crypto');

const PORT = 9002;
const strategist = 'nehemie.destine';
const zones = ['us-west', 'eu-central'];
const credentials = {};
const auditLog = [];

function issueCredential(zone) {
  const token = crypto.randomBytes(16).toString('hex');
  const signature = crypto.createHash('sha256').update(`${strategist}:${zone}:${token}`).digest('hex');
  credentials[zone] = signature;
  auditLog.push(`[${new Date().toISOString()}] Issued credential for ${zone}: ${signature}`);
  return signature;
}

function emitHeartbeat() {
  const beat = `[${new Date().toISOString()}] Heartbeat from strategist ${strategist}`;
  auditLog.push(beat);
  return beat;
}

// Initialize credentials
zones.forEach(issueCredential);

http.createServer((req, res) => {
  const url = req.url || '/';
  if (url === '/heartbeat') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(emitHeartbeat());
  } else if (url.startsWith('/credential/')) {
    const zone = url.split('/')[2];
    const cred = credentials[zone];
    if (cred) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ strategist, zone, credential: cred }));
    } else {
      res.writeHead(404);
      res.end('Zone not found');
    }
  } else if (url === '/audit') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(auditLog));
  } else {
    res.writeHead(200);
    res.end('🧭 Strategist MCP Daemon Active');
  }
}).listen(PORT, () => {
  console.log(`🧭 MCP strategist daemon listening on ${PORT}`);
});