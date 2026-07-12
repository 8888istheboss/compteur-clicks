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
const codeInput = document.getElementById('codeInput');
const redeemCodeButton = document.getElementById('redeemCodeButton');
const adminPanel = document.getElementById('adminPanel');
const adminCodeInput = document.getElementById('adminCodeInput');
const adminActionUser = document.getElementById('adminActionUser');
const adminActionType = document.getElementById('adminActionType');
const adminNotes = document.getElementById('adminNotes');
const adminButton = document.getElementById('adminButton');
const giftCodeInput = document.getElementById('giftCodeInput');
const giftLabelInput = document.getElementById('giftLabelInput');
const giftRewardInput = document.getElementById('giftRewardInput');
const giftFeatureInput = document.getElementById('giftFeatureInput');
const createGiftButton = document.getElementById('createGiftButton');
const forumList = document.getElementById('forumList');
const forumMessage = document.getElementById('forumMessage');
const forumPostButton = document.getElementById('forumPostButton');
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
    <p><strong>Sessions :</strong> ${currentUser.totalSessions}</p>
    <p><strong>Codes cadeaux utilisés :</strong> ${currentUser.giftCodesUsed.join(', ') || 'aucun'}</p>
    <p><strong>Fonctionnalités :</strong> ${currentUser.features.join(', ') || 'aucune'}</p>
    <p><strong>Dernière visite :</strong> ${new Date(currentUser.lastSeen).toLocaleString('fr-FR')}</p>
    <p><strong>Créé le :</strong> ${new Date(currentUser.createdAt).toLocaleString('fr-FR')}</p>
    <p><strong>Notes admin :</strong> ${currentUser.adminNotes || 'aucune'}</p>
  `;
  userStats.innerHTML = `
    <div class="stat-pill">🏆 Meilleur score : ${currentUser.bestScore}</div>
    <div class="stat-pill">🎮 Tentatives : ${currentUser.playAttempts}</div>
    <div class="stat-pill">🌍 Mondes visités : ${currentUser.gamesExplored}</div>
    <div class="stat-pill">✅ Forum : ${currentUser.forumApproved ? 'Validé' : 'En attente'}</div>
  `;
  gamesList.innerHTML = '';
  [
    { name: 'Click Quest Classic', link: 'classic/' },
    { name: 'Click Quest Worlds', link: 'worlds.html' },
    { name: 'Forum communautaire', link: '#forum' }
  ].forEach((game) => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${game.link}">${game.name}</a>`;
    gamesList.appendChild(li);
  });
}

function renderForum() {
  forumList.innerHTML = '';
  forumPosts.forEach((post) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${post.username}</strong> — ${post.message} <span class="micro">${new Date(post.createdAt).toLocaleString('fr-FR')}</span>`;
    forumList.appendChild(item);
  });
}

async function loadData() {
  const [usersResponse, codesResponse, forumResponse] = await Promise.all([
    fetch('/api/users'),
    fetch('/api/gift-codes'),
    fetch('/api/forum')
  ]);
  users = await usersResponse.json();
  giftCodes = await codesResponse.json();
  forumPosts = await forumResponse.json();
  renderForum();
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
  authMessage.textContent = response.ok ? `Code utilisé : ${data.features.join(', ') || 'bonus'}` : data.error;
  await loadData();
  currentUser = { ...currentUser, ...data };
  renderProfile();
}

async function adminAction() {
  const response = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: adminCodeInput.value,
      username: adminActionUser.value,
      action: adminActionType.value,
      notes: adminNotes.value
    })
  });
  const data = await response.json();
  authMessage.textContent = response.ok ? 'Action admin effectuée.' : data.error;
  currentUser = response.ok ? data : currentUser;
  await loadData();
  if (currentUser) renderProfile();
}

async function createGiftCode() {
  const response = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: adminCodeInput.value,
      username: currentUser?.username || 'admin',
      action: 'create-code',
      giftCode: giftCodeInput.value,
      label: giftLabelInput.value,
      reward: giftRewardInput.value,
      feature: giftFeatureInput.value
    })
  });
  const data = await response.json();
  authMessage.textContent = response.ok ? data.message : data.error;
  await loadData();
}

async function submitForumPost() {
  if (!currentUser) return;
  const response = await fetch('/api/forum', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser.username, message: forumMessage.value })
  });
  const data = await response.json();
  if (response.ok) {
    forumPosts = data;
    forumMessage.value = '';
    renderForum();
  } else {
    authMessage.textContent = data.error;
  }
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
adminButton.addEventListener('click', adminAction);
createGiftButton.addEventListener('click', createGiftCode);
forumPostButton.addEventListener('click', submitForumPost);
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
