const ACTIVE_USER_KEY = 'counter-demo-active-user';
const cardCatalog = [
  { id: 'cursor', name: 'Curseur', emoji: '🖱️', basePrice: 25, cps: 0.5, description: 'Un mini automate qui clique tout seul.' },
  { id: 'bot', name: 'Bot de clic', emoji: '🤖', basePrice: 120, cps: 2, description: 'Un petit robot de production.' },
  { id: 'factory', name: 'Usine', emoji: '🏭', basePrice: 650, cps: 8, description: 'Une usine brillante de clics.' },
  { id: 'nova', name: 'Nova Core', emoji: '✨', basePrice: 3200, cps: 24, description: 'Le summum du click farming.' }
];
const defaultMissions = [
  { id: 'clicks', label: 'Faire 50 clics', target: 50, reward: 50 },
  { id: 'level', label: 'Atteindre le niveau 3', target: 3, reward: 100 },
  { id: 'cards', label: 'Acheter 2 cartes', target: 2, reward: 150 }
];

const authPanel = document.getElementById('authPanel');
const gamePanel = document.getElementById('gamePanel');
const authForm = document.getElementById('authForm');
const loginModeBtn = document.getElementById('loginModeBtn');
const registerModeBtn = document.getElementById('registerModeBtn');
const confirmPasswordInput = document.getElementById('confirmPassword');
const confirmPasswordLabel = document.getElementById('confirmPasswordLabel');
const authMessage = document.getElementById('authMessage');
const saveMessage = document.getElementById('saveMessage');
const playerName = document.getElementById('playerName');
const counterElement = document.getElementById('counter');
const levelElement = document.getElementById('level');
const xpTextElement = document.getElementById('xpText');
const xpFillElement = document.getElementById('xpFill');
const cpsDisplayElement = document.getElementById('cpsDisplay');
const bestScoreDisplayElement = document.getElementById('bestScoreDisplay');
const clickValueElement = document.getElementById('clickValue');
const clickButton = document.getElementById('clickButton');
const resetButton = document.getElementById('resetButton');
const logoutButton = document.getElementById('logoutButton');
const leaderboardList = document.getElementById('leaderboardList');
const cardListElement = document.getElementById('cardList');
const claimGiftButton = document.getElementById('claimGiftButton');
const missionListElement = document.getElementById('missionList');
const celebrationBanner = document.getElementById('celebrationBanner');

let users = [];
let currentUser = null;
let profile = null;
let mode = 'login';
let autoLoop = null;
let saveLoop = null;

function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);
}

function ensureProfileState() {
  if (!profile) return;
  profile.cards = Array.isArray(profile.cards) ? profile.cards : [];
  profile.missions = Array.isArray(profile.missions) && profile.missions.length > 0
    ? profile.missions
    : defaultMissions.map((mission) => ({ ...mission, completed: false, claimed: false }));
}

function getCardOwnedCount(cardId) {
  const card = profile?.cards?.find((entry) => entry.id === cardId);
  return card ? card.owned : 0;
}

function getCardPrice(card, ownedCount) {
  return Math.round(card.basePrice * Math.pow(1.25, ownedCount));
}

function calculateCps() {
  return cardCatalog.reduce((sum, card) => sum + card.cps * getCardOwnedCount(card.id), 0);
}

function getClickPower() {
  return 1 + Math.floor((profile.level || 1) / 2);
}

function celebrate(text) {
  celebrationBanner.textContent = text;
  celebrationBanner.classList.remove('hidden');
  clearTimeout(celebrate.timeout);
  celebrate.timeout = setTimeout(() => {
    celebrationBanner.classList.add('hidden');
  }, 1800);
}

function updateDisplay() {
  if (!profile) return;
  ensureProfileState();

  const xpNeeded = 100;
  const xpProgress = Math.min(100, (profile.xp % xpNeeded) / xpNeeded * 100);
  const level = profile.level || 1;

  counterElement.textContent = formatNumber(profile.score || 0);
  levelElement.textContent = level;
  xpTextElement.textContent = `${profile.xp % xpNeeded}/${xpNeeded} XP`;
  xpFillElement.style.width = `${xpProgress}%`;
  clickValueElement.textContent = getClickPower();
  cpsDisplayElement.textContent = `${formatNumber(calculateCps())}/s`;
  bestScoreDisplayElement.textContent = formatNumber(profile.bestScore || 0);
  playerName.textContent = profile.username;
  renderLeaderboard();
  renderShop();
  renderMissions();
}

function setMode(nextMode) {
  mode = nextMode;
  loginModeBtn.classList.toggle('active', nextMode === 'login');
  registerModeBtn.classList.toggle('active', nextMode === 'register');
  confirmPasswordInput.classList.toggle('hidden', nextMode === 'login');
  confirmPasswordLabel.classList.toggle('hidden', nextMode === 'login');
  authForm.querySelector('button').textContent = nextMode === 'login' ? 'Se connecter' : 'Créer un compte';
  authMessage.textContent = '';
}

function renderGame() {
  if (!profile) {
    authPanel.classList.remove('hidden');
    gamePanel.classList.add('hidden');
    return;
  }

  authPanel.classList.add('hidden');
  gamePanel.classList.remove('hidden');
  updateDisplay();
}

function renderShop() {
  cardListElement.innerHTML = '';
  cardCatalog.forEach((card) => {
    const ownedCount = getCardOwnedCount(card.id);
    const price = getCardPrice(card, ownedCount);
    const item = document.createElement('div');
    item.className = 'shop-card';
    item.innerHTML = `
      <div>
        <strong>${card.emoji} ${card.name}</strong>
        <div class="meta">${card.description}</div>
        <div class="meta">+${card.cps}/s • possédé : ${ownedCount}</div>
      </div>
      <div class="shop-actions">
        <button class="primary" data-action="buy" data-card="${card.id}">Acheter ${formatNumber(price)}</button>
        <button class="secondary" data-action="sell" data-card="${card.id}" ${ownedCount > 0 ? '' : 'disabled'}>Vendre</button>
      </div>
    `;
    cardListElement.appendChild(item);
  });
}

function renderMissions() {
  if (!profile) return;
  ensureProfileState();
  missionListElement.innerHTML = '';
  profile.missions.forEach((mission) => {
    const progress = mission.id === 'clicks'
      ? Math.min(profile.score, mission.target)
      : mission.id === 'level'
        ? profile.level
        : (profile.cards || []).reduce((sum, card) => sum + card.owned, 0);
    const done = progress >= mission.target;
    const li = document.createElement('li');
    li.innerHTML = `${mission.label} — ${Math.min(progress, mission.target)}/${mission.target} ${done ? '✅' : ''}`;
    missionListElement.appendChild(li);
  });
}

function renderLeaderboard() {
  const sortedUsers = [...users].sort((a, b) => b.bestScore - a.bestScore);
  leaderboardList.innerHTML = '';

  if (sortedUsers.length === 0) {
    leaderboardList.innerHTML = '<li>Aucun joueur enregistré pour le moment.</li>';
    return;
  }

  sortedUsers.slice(0, 10).forEach((user, index) => {
    const item = document.createElement('li');
    item.className = user.username === profile?.username ? 'highlight' : '';
    item.innerHTML = `<span>#${index + 1}</span> <strong>${user.username}</strong> — ${formatNumber(user.bestScore)} pts`;
    leaderboardList.appendChild(item);
  });
}

function checkMissionProgress() {
  if (!profile) return;
  ensureProfileState();
  let completedAny = false;
  profile.missions.forEach((mission) => {
    if (mission.completed || mission.claimed) return;
    const progress = mission.id === 'clicks'
      ? Math.min(profile.score, mission.target)
      : mission.id === 'level'
        ? profile.level
        : (profile.cards || []).reduce((sum, card) => sum + card.owned, 0);
    if (progress >= mission.target) {
      mission.completed = true;
      mission.claimed = true;
      profile.xp += mission.reward;
      profile.score += mission.reward;
      applyLeveling();
      completedAny = true;
      celebrate(`🎉 Mission complétée : ${mission.label} +${mission.reward} XP`);
    }
  });
  if (completedAny) {
    updateDisplay();
    saveProfile();
  }
}

function addCard(cardId) {
  const card = cardCatalog.find((entry) => entry.id === cardId);
  if (!card) return;
  const ownedCount = getCardOwnedCount(cardId);
  const price = getCardPrice(card, ownedCount);
  if ((profile.score || 0) < price) {
    showMessage(`Tu as besoin de ${formatNumber(price)} clicks pour acheter ${card.name}.`);
    return;
  }

  profile.score -= price;
  profile.xp += Math.round(price / 8);
  const existing = profile.cards.find((entry) => entry.id === cardId);
  if (existing) {
    existing.owned += 1;
  } else {
    profile.cards.push({ id: cardId, owned: 1 });
  }
  applyLeveling();
  updateDisplay();
  checkMissionProgress();
  saveProfile();
  showMessage(`${card.name} ajouté à votre empire !`);
}

function sellCard(cardId) {
  const card = cardCatalog.find((entry) => entry.id === cardId);
  if (!card) return;
  const ownedCount = getCardOwnedCount(cardId);
  if (ownedCount <= 0) return;

  const price = getCardPrice(card, ownedCount - 1);
  const refund = Math.floor(price / 2);
  profile.score += refund;
  profile.xp += 5;
  const existing = profile.cards.find((entry) => entry.id === cardId);
  if (existing) {
    existing.owned -= 1;
    if (existing.owned <= 0) {
      profile.cards = profile.cards.filter((entry) => entry.id !== cardId);
    }
  }
  applyLeveling();
  updateDisplay();
  checkMissionProgress();
  saveProfile();
  showMessage(`${card.name} vendu pour ${formatNumber(refund)} clicks.`);
}

function applyLeveling() {
  const nextLevel = 1 + Math.floor(profile.xp / 100);
  profile.level = nextLevel;
  if ((profile.score || 0) > (profile.bestScore || 0)) {
    profile.bestScore = Math.floor(profile.score);
  }
}

function showMessage(text) {
  saveMessage.textContent = text;
  clearTimeout(showMessage.timeout);
  showMessage.timeout = setTimeout(() => {
    saveMessage.textContent = 'Votre progression est sauvegardée automatiquement.';
  }, 1400);
}

function claimGift() {
  if (!profile) return;
  profile.score += 100;
  profile.xp += 20;
  applyLeveling();
  updateDisplay();
  checkMissionProgress();
  saveProfile();
  celebrate('🎁 Cadeau récupéré : +100 clicks !');
}

function startAutoLoop() {
  clearInterval(autoLoop);
  autoLoop = setInterval(() => {
    if (!profile) return;
    const cps = calculateCps();
    if (cps > 0) {
      profile.score += cps / 10;
      profile.score = Number(profile.score.toFixed(2));
      if (profile.score > (profile.bestScore || 0)) {
        profile.bestScore = Math.floor(profile.score);
      }
      updateDisplay();
      checkMissionProgress();
    }
  }, 100);
}

async function saveProfile() {
  if (!profile || !currentUser) return;
  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    const data = await response.json();
    if (response.ok) {
      profile.bestScore = Number(data.bestScore) || profile.bestScore;
      profile.score = Number(data.score) || profile.score;
      profile.xp = Number(data.xp) || profile.xp;
      profile.level = Number(data.level) || profile.level;
      profile.cards = Array.isArray(data.cards) ? data.cards : profile.cards;
      profile.missions = Array.isArray(data.missions) && data.missions.length > 0 ? data.missions : profile.missions;
      updateDisplay();
    }
  } catch {
    // no-op
  }
}

async function loadLeaderboard() {
  const response = await fetch('/api/users');
  users = await response.json();
  if (profile) {
    renderLeaderboard();
  }
}

async function loginUser(username, password) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();

  if (!response.ok) {
    authMessage.textContent = data.error || 'Identifiants incorrects.';
    return;
  }

  currentUser = { username: data.username };
  profile = {
    username: data.username,
    password,
    bestScore: Number(data.bestScore) || 0,
    score: Number(data.score) || 0,
    xp: Number(data.xp) || 0,
    level: Number(data.level) || 1,
    cards: Array.isArray(data.cards) ? data.cards : [],
    missions: Array.isArray(data.missions) && data.missions.length > 0
      ? data.missions
      : defaultMissions.map((mission) => ({ ...mission, completed: false, claimed: false }))
  };
  ensureProfileState();
  localStorage.setItem(ACTIVE_USER_KEY, profile.username);
  await loadLeaderboard();
  renderGame();
  startAutoLoop();
  if (!saveLoop) {
    saveLoop = setInterval(() => saveProfile(), 3000);
  }
  showMessage('Bienvenue dans Click Quest !');
}

async function registerUser(username, password, confirmPassword) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, confirmPassword })
  });
  const data = await response.json();

  if (!response.ok) {
    authMessage.textContent = data.error || 'Une erreur est survenue.';
    return;
  }

  authMessage.textContent = data.message;
  setMode('login');
}

loginModeBtn.addEventListener('click', () => setMode('login'));
registerModeBtn.addEventListener('click', () => setMode('register'));

authForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(authForm);
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');
  const confirmPassword = String(formData.get('confirmPassword') || '');

  if (mode === 'login') {
    loginUser(username, password);
  } else {
    registerUser(username, password, confirmPassword);
  }
});

clickButton.addEventListener('click', () => {
  if (!profile) return;
  profile.score += getClickPower();
  profile.xp += 2;
  applyLeveling();
  updateDisplay();
  checkMissionProgress();
  saveProfile();
  showMessage('Clic !');
});

resetButton.addEventListener('click', () => {
  if (!profile) return;
  profile.score = 0;
  profile.bestScore = 0;
  profile.xp = 0;
  profile.level = 1;
  profile.cards = [];
  profile.missions = defaultMissions.map((mission) => ({ ...mission, completed: false, claimed: false }));
  updateDisplay();
  saveProfile();
  showMessage('Session réinitialisée.');
});

claimGiftButton.addEventListener('click', () => claimGift());

logoutButton.addEventListener('click', () => {
  clearInterval(autoLoop);
  clearInterval(saveLoop);
  autoLoop = null;
  saveLoop = null;
  currentUser = null;
  profile = null;
  localStorage.removeItem(ACTIVE_USER_KEY);
  renderGame();
  authMessage.textContent = 'Vous êtes déconnecté.';
});

cardListElement.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || !profile) return;
  const { action, card } = button.dataset;
  if (action === 'buy') {
    addCard(card);
  } else if (action === 'sell') {
    sellCard(card);
  }
});

async function init() {
  await loadLeaderboard();
  const autoLogin = localStorage.getItem(ACTIVE_USER_KEY);
  if (autoLogin) {
    const rememberedUser = users.find((entry) => entry.username === autoLogin);
    if (rememberedUser) {
      currentUser = { username: rememberedUser.username };
      profile = {
        username: rememberedUser.username,
        password: rememberedUser.password,
        bestScore: Number(rememberedUser.bestScore) || 0,
        score: Number(rememberedUser.score) || 0,
        xp: Number(rememberedUser.xp) || 0,
        level: Number(rememberedUser.level) || 1,
        cards: Array.isArray(rememberedUser.cards) ? rememberedUser.cards : [],
        missions: Array.isArray(rememberedUser.missions) && rememberedUser.missions.length > 0
          ? rememberedUser.missions
          : defaultMissions.map((mission) => ({ ...mission, completed: false, claimed: false }))
      };
      ensureProfileState();
      renderGame();
      startAutoLoop();
      if (!saveLoop) {
        saveLoop = setInterval(() => saveProfile(), 3000);
      }
    } else {
      renderGame();
    }
  } else {
    renderGame();
  }
  setMode('login');
}

init();
