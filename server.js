const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3120;
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const STATUSES = ['pending', 'approved', 'changes_requested', 'rejected'];
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

const file = name => path.join(DATA_DIR, name + '.json');
function load(name, fallback) {
  try { return JSON.parse(fs.readFileSync(file(name), 'utf8')); } catch { return fallback; }
}
function save(name, value) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(file(name), JSON.stringify(value));
}
function send(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', c => { size += c.length; if (size > 100e6) req.destroy(); else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString() || '{}')); } catch (e) { reject(e); } });
  });
}

// State: dataset {fileName, columns, rows, imported}, settings, reviews {[id]: {status, comments}}
async function api(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean);
  // Some corporate proxies block PUT, so PUT and POST are treated the same.
  const method = req.method === 'PUT' ? 'POST' : req.method;
  let body = {};
  if (method !== 'GET') {
    try { body = await readBody(req); } catch { return send(res, 400, { error: 'Invalid JSON' }); }
  }

  if (parts[1] === 'state' && method === 'GET') {
    return send(res, 200, {
      dataset: load('dataset', null),
      settings: load('settings', {}),
      reviews: load('reviews', {}),
    });
  }

  if (parts[1] === 'dataset' && method === 'POST') {
    if (!Array.isArray(body.columns) || !Array.isArray(body.rows)) return send(res, 400, { error: 'columns and rows required' });
    // Large files arrive in several chunks; chunks after the first set append: true.
    const prev = body.append ? load('dataset', null) : null;
    const rows = prev ? prev.rows.concat(body.rows) : body.rows;
    save('dataset', { fileName: String(body.fileName || (prev && prev.fileName) || ''), columns: body.columns, rows, imported: new Date().toISOString() });
    return send(res, 200, { ok: true, count: rows.length });
  }

  if (parts[1] === 'settings' && method === 'POST') {
    save('settings', body);
    return send(res, 200, { ok: true });
  }

  // /api/reviews/:id/status, /api/reviews/:id/comments (id is URL-encoded)
  if (parts[1] === 'reviews' && parts[2] && method === 'POST' && parts[3] === 'status') {
    if (!STATUSES.includes(body.status)) return send(res, 400, { error: 'Bad status' });
    const reviews = load('reviews', {});
    const id = decodeURIComponent(parts[2]);
    reviews[id] = reviews[id] || { status: 'pending', comments: [] };
    reviews[id].status = body.status;
    save('reviews', reviews);
    return send(res, 200, reviews[id]);
  }

  if (parts[1] === 'reviews' && parts[2] && method === 'POST' && parts[3] === 'comments') {
    if (!body.text || !String(body.text).trim()) return send(res, 400, { error: 'Text required' });
    const reviews = load('reviews', {});
    const id = decodeURIComponent(parts[2]);
    reviews[id] = reviews[id] || { status: 'pending', comments: [] };
    reviews[id].comments.push({
      id: crypto.randomUUID(),
      author: String(body.author || 'Reviewer').trim() || 'Reviewer',
      text: String(body.text).trim(),
      created: new Date().toISOString(),
    });
    save('reviews', reviews);
    return send(res, 201, reviews[id]);
  }

  send(res, 404, { error: 'Not found' });
}

function serveStatic(req, res, url) {
  const rel = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const target = path.join(PUBLIC_DIR, rel);
  if (!target.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(target, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) return api(req, res, url);
  serveStatic(req, res, url);
});
server.on('error', err => {
  if (err.code === 'EADDRINUSE') console.error(`Port ${PORT} is already in use by another process, so Item Review did not start. Stop that process or set a different PORT.`);
  else console.error(err);
  process.exit(1);
});
server.listen(PORT, () => console.log(`Item Review running at http://localhost:${PORT}`));
