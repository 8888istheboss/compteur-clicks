const ACTIVE_USER_KEY = 'counter-demo-active-user';

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
const bestScoreElement = document.getElementById('bestScore');
const clickButton = document.getElementById('clickButton');
const resetButton = document.getElementById('resetButton');
const logoutButton = document.getElementById('logoutButton');
const leaderboardList = document.getElementById('leaderboardList');

let users = [];
let currentUser = null;
let currentScore = 0;
let mode = 'login';

async function loadLeaderboard() {
  const response = await fetch('/api/users');
  users = await response.json();
  if (currentUser) {
    renderLeaderboard();
  }
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
  if (!currentUser) {
    authPanel.classList.remove('hidden');
    gamePanel.classList.add('hidden');
    return;
  }

  authPanel.classList.add('hidden');
  gamePanel.classList.remove('hidden');
  playerName.textContent = currentUser.username;
  counterElement.textContent = currentScore;
  bestScoreElement.textContent = currentUser.bestScore;
  renderLeaderboard();
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
    item.className = user.username === currentUser?.username ? 'highlight' : '';
    item.innerHTML = `<span>#${index + 1}</span> <strong>${user.username}</strong> — ${user.bestScore} points`;
    leaderboardList.appendChild(item);
  });
}

async function saveCurrentScore() {
  if (!currentUser) return;
  const response = await fetch('/api/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: currentUser.username, score: currentScore })
  });
  const data = await response.json();
  currentUser.bestScore = data.bestScore;
  bestScoreElement.textContent = currentUser.bestScore;
  renderLeaderboard();
  saveMessage.textContent = 'Score sauvegardé !';
  setTimeout(() => {
    saveMessage.textContent = 'Votre score est sauvegardé automatiquement.';
  }, 1200);
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

  currentUser = { username: data.username, bestScore: data.bestScore };
  currentScore = 0;
  localStorage.setItem(ACTIVE_USER_KEY, currentUser.username);
  await loadLeaderboard();
  renderGame();
  saveMessage.textContent = 'Bienvenue !';
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
  currentScore += 1;
  counterElement.textContent = currentScore;
  saveCurrentScore();
});

resetButton.addEventListener('click', () => {
  currentScore = 0;
  counterElement.textContent = currentScore;
  saveMessage.textContent = 'Le score courant a été réinitialisé.';
  setTimeout(() => {
    saveMessage.textContent = 'Votre score est sauvegardé automatiquement.';
  }, 1200);
});

logoutButton.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem(ACTIVE_USER_KEY);
  renderGame();
  authMessage.textContent = 'Vous êtes déconnecté.';
});

async function init() {
  await loadLeaderboard();
  const autoLogin = localStorage.getItem(ACTIVE_USER_KEY);
  if (autoLogin) {
    const rememberedUser = users.find((entry) => entry.username === autoLogin);
    if (rememberedUser) {
      currentUser = { username: rememberedUser.username, bestScore: rememberedUser.bestScore };
      currentScore = 0;
      renderGame();
    } else {
      renderGame();
    }
  } else {
    renderGame();
  }
  setMode('login');
}

init();
