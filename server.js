const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;
const rootDir = __dirname;
const dataRoot = process.env.DATA_DIR || process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(rootDir, 'data');
const usersFilePath = path.join(dataRoot, 'users.json');
const giftCodesFilePath = path.join(dataRoot, 'gift-codes.json');
const forumPostsFilePath = path.join(dataRoot, 'forum-posts.json');

fs.mkdirSync(dataRoot, { recursive: true });

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

function createDefaultWorldState() {
  return {
    points: 0,
    prestige: 0,
    currentWorldIndex: 0,
    ownedCards: {},
    activeSkill: null,
    skillTimer: 0,
    achievements: [],
    dailyRewardClaimed: false,
    events: []
  };
}

function normalizeUser(user) {
  const missions = Array.isArray(user.missions) && user.missions.length > 0 ? user.missions : createDefaultMissions();
  return {
    username: user.username,
    password: user.password,
    bestScore: Number(user.bestScore) || 0,
    score: Number(user.score) || 0,
    xp: Number(user.xp) || 0,
    level: Number(user.level) || 1,
    cards: Array.isArray(user.cards) ? user.cards : [],
    missions,
    status: user.status || 'pending',
    playAttempts: Number(user.playAttempts) || 0,
    gamesExplored: Number(user.gamesExplored) || 0,
    forumApproved: Boolean(user.forumApproved),
    features: Array.isArray(user.features) ? user.features : [],
    giftCodesUsed: Array.isArray(user.giftCodesUsed) ? user.giftCodesUsed : [],
    createdGames: Array.isArray(user.createdGames) ? user.createdGames : [],
    createdAt: user.createdAt || new Date().toISOString(),
    lastSeen: user.lastSeen || new Date().toISOString(),
    totalSessions: Number(user.totalSessions) || 0,
    achievements: Array.isArray(user.achievements) ? user.achievements : [],
    worldsState: user.worldsState || createDefaultWorldState(),
    adminNotes: user.adminNotes || ''
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

function readGiftCodes() {
  try {
    return JSON.parse(fs.readFileSync(giftCodesFilePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeGiftCodes(codes) {
  fs.writeFileSync(giftCodesFilePath, JSON.stringify(codes, null, 2));
}

function readForumPosts() {
  try {
    return JSON.parse(fs.readFileSync(forumPostsFilePath, 'utf8'));
  } catch {
    return [];
  }
}

function writeForumPosts(posts) {
  fs.writeFileSync(forumPostsFilePath, JSON.stringify(posts, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid body'));
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/api/users') {
    sendJson(res, 200, readUsers());
    return;
  }

  if (req.method === 'GET' && req.url === '/api/gift-codes') {
    sendJson(res, 200, readGiftCodes());
    return;
  }

  if (req.method === 'GET' && req.url === '/api/forum') {
    sendJson(res, 200, readForumPosts());
    return;
  }

  if (req.method === 'POST' && req.url === '/api/register') {
    try {
      const { username, password, confirmPassword } = await parseBody(req);
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
        missions: createDefaultMissions(),
        status: 'pending',
        playAttempts: 0,
        gamesExplored: 0,
        forumApproved: false,
        features: [],
        giftCodesUsed: [],
        createdGames: [],
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
        totalSessions: 0,
        achievements: [],
        worldsState: createDefaultWorldState(),
        adminNotes: ''
      });
      writeUsers(users);
      sendJson(res, 201, { message: 'Compte créé avec succès. Votre accès sera validé par l’admin après votre première tentative.' });
    } catch {
      sendJson(res, 400, { error: 'Requête invalide.' });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/login') {
    try {
      const { username, password } = await parseBody(req);
      const users = readUsers();
      const user = users.find((entry) => entry.username === username && (password === '' || entry.password === password));

      if (!user) {
        sendJson(res, 401, { error: 'Identifiants incorrects.' });
        return;
      }

      if (user.status === 'blocked') {
        sendJson(res, 403, { error: 'Votre compte est bloqué. Contactez l’admin.' });
        return;
      }

      user.lastSeen = new Date().toISOString();
      user.totalSessions = Number(user.totalSessions || 0) + 1;
      writeUsers(users);
      sendJson(res, 200, normalizeUser(user));
    } catch {
      sendJson(res, 400, { error: 'Requête invalide.' });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/enter-game') {
    try {
      const { username } = await parseBody(req);
      const users = readUsers();
      const user = users.find((entry) => entry.username === username);

      if (!user) {
        sendJson(res, 404, { error: 'Utilisateur introuvable.' });
        return;
      }

      if (user.status === 'blocked') {
        sendJson(res, 403, { error: 'Votre compte est bloqué.' });
        return;
      }

      if (user.status === 'pending' && Number(user.playAttempts || 0) >= 1) {
        user.status = 'blocked';
        writeUsers(users);
        sendJson(res, 403, { error: 'Votre compte doit être validé par l’admin avant de continuer à jouer.' });
        return;
      }

      user.playAttempts = Number(user.playAttempts || 0) + 1;
      user.gamesExplored = Number(user.gamesExplored || 0) + 1;
      user.lastSeen = new Date().toISOString();
      writeUsers(users);
      sendJson(res, 200, normalizeUser(user));
    } catch {
      sendJson(res, 400, { error: 'Requête invalide.' });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/create-game') {
    try {
      const { username, prompt } = await parseBody(req);
      const users = readUsers();
      const user = users.find((entry) => entry.username === username);

      if (!user) {
        sendJson(res, 404, { error: 'Utilisateur introuvable.' });
        return;
      }

      const trimmedPrompt = String(prompt || '').trim();
      if (!trimmedPrompt) {
        sendJson(res, 400, { error: 'Le prompt est requis.' });
        return;
      }

      const createdGames = Array.isArray(user.createdGames) ? user.createdGames : [];
      if (createdGames.length >= 5) {
        sendJson(res, 409, { error: 'Vous avez déjà atteint la limite de 5 jeux créés.' });
        return;
      }

      createdGames.push({
        id: `${Date.now()}`,
        name: `Jeu #${createdGames.length + 1}`,
        prompt: trimmedPrompt,
        status: 'queued',
        createdAt: new Date().toISOString()
      });
      user.createdGames = createdGames;
      user.xp = Number(user.xp || 0) + 25;
      user.score = Number(user.score || 0) + 20;
      user.bestScore = Math.max(Number(user.bestScore || 0), Number(user.score || 0));
      user.lastSeen = new Date().toISOString();
      writeUsers(users);
      sendJson(res, 200, normalizeUser(user));
    } catch {
      sendJson(res, 400, { error: 'Requête invalide.' });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/profile') {
    try {
      const payload = await parseBody(req);
      const users = readUsers();
      const user = users.find((entry) => entry.username === payload.username);

      if (!user) {
        sendJson(res, 404, { error: 'Utilisateur introuvable.' });
        return;
      }

      if (user.status === 'blocked') {
        sendJson(res, 403, { error: 'Votre compte est bloqué.' });
        return;
      }

      Object.assign(user, normalizeUser({ ...user, ...payload }));
      user.lastSeen = new Date().toISOString();
      writeUsers(users);
      sendJson(res, 200, normalizeUser(user));
    } catch {
      sendJson(res, 400, { error: 'Requête invalide.' });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/redeem-code') {
    try {
      const { username, code } = await parseBody(req);
      const users = readUsers();
      const user = users.find((entry) => entry.username === username);
      const codes = readGiftCodes();
      const giftCode = codes.find((entry) => entry.code === code && entry.active !== false);

      if (!user) {
        sendJson(res, 404, { error: 'Utilisateur introuvable.' });
        return;
      }

      if (!giftCode) {
        sendJson(res, 404, { error: 'Code introuvable.' });
        return;
      }

      if (user.giftCodesUsed.includes(code)) {
        sendJson(res, 409, { error: 'Vous avez déjà utilisé ce code.' });
        return;
      }

      giftCode.uses = Number(giftCode.uses || 0) + 1;
      user.giftCodesUsed.push(code);
      user.features = Array.from(new Set([...(user.features || []), giftCode.feature]));
      user.score = Number(user.score || 0) + Number(giftCode.reward || 0);
      user.bestScore = Math.max(Number(user.bestScore || 0), Number(user.score || 0));
      user.xp = Number(user.xp || 0) + 25;
      user.lastSeen = new Date().toISOString();
      writeUsers(users);
      writeGiftCodes(codes);
      sendJson(res, 200, normalizeUser(user));
    } catch {
      sendJson(res, 400, { error: 'Requête invalide.' });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/admin') {
    try {
      const payload = await parseBody(req);
      if (payload.code !== '8888') {
        sendJson(res, 403, { error: 'Code administrateur invalide.' });
        return;
      }

      const users = readUsers();
      const user = users.find((entry) => entry.username === payload.username);

      if (!user) {
        sendJson(res, 404, { error: 'Utilisateur introuvable.' });
        return;
      }

      if (payload.action === 'validate-user') {
        user.status = 'active';
        user.forumApproved = true;
        user.adminNotes = payload.notes || 'Compte validé par l’admin.';
      } else if (payload.action === 'block-user') {
        user.status = 'blocked';
        user.adminNotes = payload.notes || 'Compte bloqué par l’admin.';
      } else if (payload.action === 'unblock-user') {
        user.status = 'active';
        user.adminNotes = payload.notes || 'Compte débloqué par l’admin.';
      } else if (payload.action === 'create-code') {
        const codes = readGiftCodes();
        codes.push({
          code: payload.giftCode,
          label: payload.label,
          reward: Number(payload.reward) || 0,
          feature: payload.feature || 'bonus',
          active: true,
          uses: 0
        });
        writeGiftCodes(codes);
        sendJson(res, 200, { message: 'Code cadeau créé.' });
        return;
      }

      writeUsers(users);
      sendJson(res, 200, normalizeUser(user));
    } catch {
      sendJson(res, 400, { error: 'Requête invalide.' });
    }
    return;
  }

  if (req.method === 'POST' && req.url === '/api/forum') {
    try {
      const payload = await parseBody(req);
      const users = readUsers();
      const user = users.find((entry) => entry.username === payload.username);

      if (!user) {
        sendJson(res, 404, { error: 'Utilisateur introuvable.' });
        return;
      }

      if (user.status === 'blocked' || !user.forumApproved) {
        sendJson(res, 403, { error: 'Votre compte doit être validé pour accéder au forum.' });
        return;
      }

      const posts = readForumPosts();
      posts.unshift({
        id: `${Date.now()}`,
        username: user.username,
        message: payload.message,
        createdAt: new Date().toISOString()
      });
      writeForumPosts(posts);
      sendJson(res, 200, posts);
    } catch {
      sendJson(res, 400, { error: 'Requête invalide.' });
    }
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
