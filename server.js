const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const rootDir = __dirname;
const usersFilePath = path.join(rootDir, 'data', 'users.json');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function readUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/users') {
    sendJson(res, 200, readUsers());
    return;
  }

  if (req.method === 'POST' && req.url === '/api/register') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { username, password, confirmPassword } = JSON.parse(body);
        const users = readUsers();

        if (!username || !password) {
          sendJson(res, 400, { error: 'Remplissez tous les champs.' });
          return;
        }

        if (password !== confirmPassword) {
          sendJson(res, 400, { error: 'Les mots de passe ne correspondent pas.' });
          return;
        }

        if (users.some((user) => user.username === username)) {
          sendJson(res, 409, { error: 'Ce nom d’utilisateur existe déjà.' });
          return;
        }

        users.push({ username, password, bestScore: 0 });
        writeUsers(users);
        sendJson(res, 201, { message: 'Compte créé avec succès.' });
      } catch {
        sendJson(res, 400, { error: 'Requête invalide.' });
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/login') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { username, password } = JSON.parse(body);
        const users = readUsers();
        const user = users.find((entry) => entry.username === username && entry.password === password);

        if (!user) {
          sendJson(res, 401, { error: 'Identifiants incorrects.' });
          return;
        }

        sendJson(res, 200, { username: user.username, bestScore: user.bestScore });
      } catch {
        sendJson(res, 400, { error: 'Requête invalide.' });
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/score') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { username, score } = JSON.parse(body);
        const users = readUsers();
        const user = users.find((entry) => entry.username === username);

        if (!user) {
          sendJson(res, 404, { error: 'Utilisateur introuvable.' });
          return;
        }

        user.bestScore = Math.max(user.bestScore, Number(score) || 0);
        writeUsers(users);
        sendJson(res, 200, { bestScore: user.bestScore });
      } catch {
        sendJson(res, 400, { error: 'Requête invalide.' });
      }
    });
    return;
  }

  let requestedPath = req.url === '/' ? '/index.html' : req.url;
  const safePath = path.normalize(requestedPath).replace(/^\.+/, '');
  const filePath = path.join(rootDir, safePath);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
