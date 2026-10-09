// Static file server only. All data (items, edits, comments, layout) stays in the browser;
// the CSV you import and export is the data. Nothing is stored or processed here.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3120;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.csv': 'text/csv' };

function serveStatic(req, res, url) {
  // Try the path as given, then with leading segments removed, so a proxy prefix is ignored.
  const segs = url.pathname.split('/').filter(Boolean);
  for (let k = 0; k <= segs.length; k++) {
    const target = path.join(PUBLIC_DIR, segs.slice(k).join('/') || 'index.html');
    if (!target.startsWith(PUBLIC_DIR)) continue;
    let st; try { st = fs.statSync(target); } catch { continue; }
    if (!st.isFile()) continue;
    res.writeHead(200, { 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    return fs.createReadStream(target).pipe(res);
  }
  res.writeHead(404); res.end('Not found');
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }
  serveStatic(req, res, new URL(req.url, 'http://localhost'));
});
server.on('error', err => {
  if (err.code === 'EADDRINUSE') console.error(`Port ${PORT} is already in use by another process, so Item Review did not start. Stop that process or set a different PORT.`);
  else console.error(err);
  process.exit(1);
});
server.listen(PORT, () => console.log(`Item Review running at http://localhost:${PORT}`));
