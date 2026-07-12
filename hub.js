const authPanel = document.getElementById('authPanel');
const hubPanel = document.getElementById('hubPanel');
const authForm = document.getElementById('authForm');
const loginModeBtn = document.getElementById('loginModeBtn');
const registerModeBtn = document.getElementById('registerModeBtn');
const authMessage = document.getElementById('authMessage');
const confirmPasswordInput = document.getElementById('confirmPassword');
const confirmPasswordLabel = document.getElementById('confirmPasswordLabel');
const playerName = document.getElementById('playerName');
const userProfileCard = document.getElementById('userProfileCard');
const userStats = document.getElementById('userStats');
const gamesList = document.getElementById('gamesList');
const leaderboardList = document.getElementById('leaderboardList');
const progressionList = document.getElementById('progressionList');
const codeInput = document.getElementById('codeInput');
const redeemCodeButton = document.getElementById('redeemCodeButton');
const giftMessage = document.getElementById('giftMessage');
const logoutButton = document.getElementById('logoutButton');

let mode = 'login';
let currentUser = null;
let users = [];
let giftCodes = [];
let forumPosts = [];

function setMode(nextMode) {
  mode = nextMode;
  loginModeBtn.classList.toggle('active', nextMode === 'login');
  registerModeBtn.classList.toggle('active', nextMode === 'register');
  confirmPasswordInput.classList.toggle('hidden', nextMode === 'login');
  confirmPasswordLabel.classList.toggle('hidden', nextMode === 'login');
  authForm.querySelector('button').textContent = nextMode === 'login' ? 'Se connecter' : 'Créer un compte';
  authMessage.textContent = '';
}

function showHub() {
  authPanel.classList.add('hidden');
  hubPanel.classList.remove('hidden');
}

function showAuth() {
  authPanel.classList.remove('hidden');
  hubPanel.classList.add('hidden');
}

function renderProfile() {
  if (!currentUser) return;
  playerName.textContent = currentUser.username;
  userProfileCard.innerHTML = `
    <h3>${currentUser.username}</h3>
    <p><strong>Statut :</strong> ${currentUser.status}</p>
    <p><strong>Points cumulatifs :</strong> ${currentUser.score}</p>
    <p><strong>XP total :</strong> ${currentUser.xp}</p>
    <p><strong>Niveau :</strong> ${currentUser.level}</p>
    <p><strong>Jeux explorés :</strong> ${currentUser.gamesExplored}</p>
    <p><strong>Codes utilisés :</strong> ${currentUser.giftCodesUsed.join(', ') || 'aucun'}</p>
    <p><strong>Bonus débloqués :</strong> ${currentUser.features.join(', ') || 'aucun'}</p>
    <p><strong>Dernière visite :</strong> ${new Date(currentUser.lastSeen).toLocaleString('fr-FR')}</p>
  `;
  userStats.innerHTML = `
    <div class="stat-pill">🏆 Meilleur score : ${currentUser.bestScore}</div>
    <div class="stat-pill">🎮 Sessions : ${currentUser.totalSessions}</div>
    <div class="stat-pill">🌍 Jeux visités : ${currentUser.gamesExplored}</div>
    <div class="stat-pill">✅ Statut : ${currentUser.forumApproved ? 'Validé' : 'En attente'}</div>
  `;

  gamesList.innerHTML = '';
  [
    { name: 'Click Quest Classic', link: 'classic/' },
    { name: 'Click Quest Worlds', link: 'worlds.html' },
    { name: 'Studio Creator', link: 'studio.html' }
  ].forEach((game) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${game.link}">${game.name}</a>`;
    gamesList.appendChild(li);
  });

  leaderboardList.innerHTML = users.slice(0, 5).map((user) => `<li>${user.username} — ${user.score} pts</li>`).join('');
  progressionList.innerHTML = [
    `Niveau actuel : ${currentUser.level}`,
    `XP : ${currentUser.xp}`,
    `Jeux créés : ${currentUser.createdGames?.length || 0}`,
    `Codes reçus : ${currentUser.giftCodesUsed.length}`
  ].map((item) => `<li>${item}</li>`).join('');
}

async function loadData() {
  const [usersResponse, codesResponse] = await Promise.all([
    fetch('/api/users'),
    fetch('/api/gift-codes')
  ]);
  users = await usersResponse.json();
  giftCodes = await codesResponse.json();
  if (currentUser) renderProfile();
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
  currentUser = data;
  localStorage.setItem('hub-active-user', username);
  await loadData();
  renderProfile();
  showHub();
}

async function registerUser(username, password, confirmPassword) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, confirmPassword })
  });
  const data = await response.json();
  if (!response.ok) {
    authMessage.textContent = data.error || 'Erreur.';
    return;
  }
  authMessage.textContent = data.message;
  setMode('login');
}

async function redeemCode() {
  if (!currentUser) return;
  const response = await fetch('/api/redeem-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser.username, code: codeInput.value })
  });
  const data = await response.json();
  giftMessage.textContent = response.ok ? `Code utilisé : ${data.features.join(', ') || 'bonus'}` : data.error;
  await loadData();
  currentUser = { ...currentUser, ...data };
  renderProfile();
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
redeemCodeButton.addEventListener('click', redeemCode);
logoutButton.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('hub-active-user');
  showAuth();
});

(async () => {
  const saved = localStorage.getItem('hub-active-user');
  if (saved) {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: saved, password: '' })
    });
    if (response.ok) {
      const data = await response.json();
      currentUser = data;
      await loadData();
      renderProfile();
      showHub();
    }
  }
})();
