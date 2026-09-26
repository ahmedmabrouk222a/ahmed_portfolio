const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'messages.json');
const ADMIN_PASSWORD = '8080';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pdf': 'application/pdf',
  '.svg': 'image/svg+xml'
};

function readMessages() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading messages.json:', err);
    return [];
  }
}

function writeMessages(messages) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(messages, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing messages.json:', err);
    return false;
  }
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Helper: Verify Admin Password
  function isAuthorized() {
    const key = req.headers['x-admin-key'];
    return key === ADMIN_PASSWORD;
  }

  // API ROUTE: POST /api/admin/verify (Validate password)
  if (pathname === '/api/admin/verify' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        if (payload.password === ADMIN_PASSWORD) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, authorized: true }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid password' }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Malformed request' }));
      }
    });
    return;
  }

  // API ROUTE: GET /api/messages (Protected)
  if (pathname === '/api/messages' && req.method === 'GET') {
    if (!isAuthorized()) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized: Admin password required' }));
      return;
    }
    const messages = readMessages();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(messages));
    return;
  }

  // API ROUTE: POST /api/messages
  if (pathname === '/api/messages' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const newMsg = JSON.parse(body);
        if (!newMsg.name || !newMsg.email || !newMsg.message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required fields' }));
          return;
        }

        const msgObj = {
          id: newMsg.id || Date.now().toString(),
          name: newMsg.name,
          email: newMsg.email,
          subject: newMsg.subject || 'General Inquiry',
          message: newMsg.message,
          date: newMsg.date || new Date().toISOString(),
          read: false
        };

        const messages = readMessages();
        messages.unshift(msgObj);
        writeMessages(messages);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: msgObj }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  // API ROUTE: DELETE /api/messages/:id (Protected)
  if (pathname.startsWith('/api/messages/') && req.method === 'DELETE') {
    if (!isAuthorized()) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized: Admin password required' }));
      return;
    }
    const id = pathname.replace('/api/messages/', '');
    let messages = readMessages();

    if (id === 'all') {
      writeMessages([]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: 0 }));
      return;
    }

    const filtered = messages.filter(m => m.id !== id);
    writeMessages(filtered);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, remaining: filtered.length }));
    return;
  }

  // API ROUTE: PATCH /api/messages/:id/toggle-read (Protected)
  if (pathname.includes('/toggle-read') && req.method === 'PATCH') {
    if (!isAuthorized()) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized: Admin password required' }));
      return;
    }
    const parts = pathname.split('/');
    const id = parts[3];
    let messages = readMessages();
    const item = messages.find(m => m.id === id);
    if (item) {
      item.read = !item.read;
      writeMessages(messages);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, read: item.read }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
    return;
  }

  // STATIC FILE SERVING
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : decodeURIComponent(pathname));
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Ahmed Mabrouk Portfolio & Admin Server running at http://localhost:${PORT}`);
});
