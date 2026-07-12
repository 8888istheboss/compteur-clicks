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

function createDefaultMissions() {
  return [
    { id: 'clicks', label: 'Faire 50 clics', target: 50, reward: 50, completed: false, claimed: false },
    { id: 'level', label: 'Atteindre le niveau 3', target: 3, reward: 100, completed: false, claimed: false },
    { id: 'cards', label: 'Acheter 2 cartes', target: 2, reward: 150, completed: false, claimed: false }
  ];
}

function normalizeUser(user) {
  return {
    username: user.username,
    password: user.password,
    bestScore: Number(user.bestScore) || 0,
    score: Number(user.score) || 0,
    xp: Number(user.xp) || 0,
    level: Number(user.level) || 1,
    cards: Array.isArray(user.cards) ? user.cards : [],
    missions: Array.isArray(user.missions) && user.missions.length > 0
      ? user.missions
      : createDefaultMissions()
  };
}

function readUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data).map(normalizeUser);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users.map(normalizeUser), null, 2));
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

        users.push({
          username,
          password,
          bestScore: 0,
          score: 0,
          xp: 0,
          level: 1,
          cards: [],
          missions: createDefaultMissions()
        });
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

        sendJson(res, 200, normalizeUser(user));
      } catch {
        sendJson(res, 400, { error: 'Requête invalide.' });
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/api/profile') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const users = readUsers();
        const user = users.find((entry) => entry.username === payload.username);

        if (!user) {
          sendJson(res, 404, { error: 'Utilisateur introuvable.' });
          return;
        }

        Object.assign(user, normalizeUser({ ...user, ...payload }));
        writeUsers(users);
        sendJson(res, 200, normalizeUser(user));
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

  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      const fallbackPath = path.join(filePath, 'index.html');
      fs.readFile(fallbackPath, (fallbackErr, data) => {
        if (fallbackErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not found');
          return;
        }
        const ext = path.extname(fallbackPath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
      return;
    }

    if (stats.isDirectory()) {
      const fallbackPath = path.join(filePath, 'index.html');
      fs.readFile(fallbackPath, (fallbackErr, data) => {
        if (fallbackErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Not found');
          return;
        }
        const ext = path.extname(fallbackPath).toLowerCase();
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
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
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
