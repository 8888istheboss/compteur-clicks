const authPanel = document.getElementById('authPanel');
const hubPanel = document.getElementById('hubPanel');
const authForm = document.getElementById('authForm');
const loginModeBtn = document.getElementById('loginModeBtn');
const registerModeBtn = document.getElementById('registerModeBtn');
const authMessage = document.getElementById('authMessage');
const confirmPasswordInput = document.getElementById('confirmPassword');
const confirmPasswordLabel = document.getElementById('confirmPasswordLabel');
const playerName = document.getElementById('playerName');
const playerProfile = document.getElementById('playerProfile');
const creatorPanel = document.getElementById('creatorPanel');
const gameList = document.getElementById('gameList');
const communityList = document.getElementById('communityList');
const promptInput = document.getElementById('promptInput');
const createGameButton = document.getElementById('createGameButton');
const accessCodeInput = document.getElementById('accessCodeInput');
const unlockButton = document.getElementById('unlockButton');
const adminCodeInput = document.getElementById('adminCodeInput');
const adminActionUser = document.getElementById('adminActionUser');
const adminActionType = document.getElementById('adminActionType');
const adminNotes = document.getElementById('adminNotes');
const adminButton = document.getElementById('adminButton');
const codeNameInput = document.getElementById('codeNameInput');
const codeTypeInput = document.getElementById('codeTypeInput');
const codeValueInput = document.getElementById('codeValueInput');
const createCodeButton = document.getElementById('createCodeButton');
const forumList = document.getElementById('forumList');
const forumMessage = document.getElementById('forumMessage');
const forumPostButton = document.getElementById('forumPostButton');
const logoutButton = document.getElementById('logoutButton');

let mode = 'login';
let currentUser = null;
let users = [];
let codes = [];
let posts = [];

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

function renderUserProfile() {
  if (!currentUser) return;
  playerName.textContent = currentUser.username;
  playerProfile.innerHTML = `
    <h3>${currentUser.username}</h3>
    <p><strong>Statut :</strong> ${currentUser.status}</p>
    <p><strong>Points cumulés :</strong> ${currentUser.score}</p>
    <p><strong>XP :</strong> ${currentUser.xp}</p>
    <p><strong>Niveau :</strong> ${currentUser.level}</p>
    <p><strong>Jeux créés :</strong> ${currentUser.createdGames?.length || 0}/5</p>
    <p><strong>Codes activés :</strong> ${currentUser.features?.join(', ') || 'aucun'}</p>
    <p><strong>Dernière activité :</strong> ${new Date(currentUser.lastSeen).toLocaleString('fr-FR')}</p>
    <p><strong>Validation forum :</strong> ${currentUser.forumApproved ? 'Validé' : 'En attente'}</p>
  `;
}

function renderGames() {
  gameList.innerHTML = '';
  const createdGames = currentUser?.createdGames || [];
  if (createdGames.length === 0) {
    gameList.innerHTML = '<li>Aucun jeu créé pour le moment.</li>';
    return;
  }
  createdGames.forEach((game) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${game.name}</strong> — ${game.prompt} <span class="micro">${game.status}</span>`;
    gameList.appendChild(item);
  });
}

function renderCommunity() {
  communityList.innerHTML = '';
  users.forEach((user) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${user.username}</strong> — ${user.score} pts • ${user.createdGames?.length || 0} jeux • ${user.status}`;
    communityList.appendChild(item);
  });
}

function renderForum() {
  forumList.innerHTML = '';
  posts.forEach((post) => {
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
  codes = await codesResponse.json();
  posts = await forumResponse.json();
  renderCommunity();
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
  localStorage.setItem('community-active-user', username);
  await loadData();
  renderUserProfile();
  renderGames();
  showHub();
}

async function registerUser(username, password, confirmPassword) {
  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, confirmPassword })
  });
  const data = await response.json();
  authMessage.textContent = response.ok ? data.message : data.error;
  if (response.ok) setMode('login');
}

async function unlockAccess() {
  const response = await fetch('/api/redeem-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser.username, code: accessCodeInput.value })
  });
  const data = await response.json();
  if (response.ok) {
    currentUser = data;
    renderUserProfile();
    authMessage.textContent = 'Code activé.';
  } else {
    authMessage.textContent = data.error;
  }
}

async function createGame() {
  if (!currentUser || !promptInput.value) return;
  if ((currentUser.createdGames?.length || 0) >= 5) {
    authMessage.textContent = 'Vous avez déjà atteint la limite de 5 jeux.';
    return;
  }
  const response = await fetch('/api/create-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser.username, prompt: promptInput.value })
  });
  const data = await response.json();
  if (response.ok) {
    currentUser = data;
    renderUserProfile();
    renderGames();
    promptInput.value = '';
    authMessage.textContent = 'Votre jeu a été ajouté à la file de création.';
  } else {
    authMessage.textContent = data.error;
  }
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
  authMessage.textContent = response.ok ? 'Action admin appliquée.' : data.error;
  await loadData();
}

async function createCode() {
  const response = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: adminCodeInput.value,
      username: currentUser?.username || 'admin',
      action: 'create-code',
      giftCode: codeNameInput.value,
      label: codeNameInput.value,
      reward: codeValueInput.value,
      feature: codeTypeInput.value
    })
  });
  const data = await response.json();
  authMessage.textContent = response.ok ? data.message : data.error;
  await loadData();
}

async function postForum() {
  const response = await fetch('/api/forum', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser.username, message: forumMessage.value })
  });
  const data = await response.json();
  if (response.ok) {
    posts = data;
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
  if (mode === 'login') loginUser(username, password);
  else registerUser(username, password, confirmPassword);
});
createGameButton.addEventListener('click', createGame);
unlockButton.addEventListener('click', unlockAccess);
adminButton.addEventListener('click', adminAction);
createCodeButton.addEventListener('click', createCode);
forumPostButton.addEventListener('click', postForum);
logoutButton.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('community-active-user');
  showAuth();
});

(async () => {
  const saved = localStorage.getItem('community-active-user');
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
      renderUserProfile();
      renderGames();
      showHub();
    }
  }
})();
