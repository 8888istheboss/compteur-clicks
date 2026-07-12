const adminLoginForm = document.getElementById('adminLoginForm');
const adminUsername = document.getElementById('adminUsername');
const adminPassword = document.getElementById('adminPassword');
const adminMessage = document.getElementById('adminMessage');
const adminPanel = document.getElementById('adminPanel');
const adminLogout = document.getElementById('adminLogout');
const adminActionUser = document.getElementById('adminActionUser');
const adminActionType = document.getElementById('adminActionType');
const adminNotes = document.getElementById('adminNotes');
const adminButton = document.getElementById('adminButton');
const giftCodeInput = document.getElementById('giftCodeInput');
const giftLabelInput = document.getElementById('giftLabelInput');
const giftRewardInput = document.getElementById('giftRewardInput');
const giftFeatureInput = document.getElementById('giftFeatureInput');
const createGiftButton = document.getElementById('createGiftButton');

function isAdminSession() {
  return sessionStorage.getItem('clickquest-admin') === 'true';
}

function showAdminPanel() {
  adminPanel.classList.remove('hidden');
}

function hideAdminPanel() {
  adminPanel.classList.add('hidden');
}

adminLoginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (adminUsername.value === '8888istheboss' && adminPassword.value === '8888') {
    sessionStorage.setItem('clickquest-admin', 'true');
    adminMessage.textContent = 'Connexion admin réussie.';
    showAdminPanel();
  } else {
    adminMessage.textContent = 'Identifiant ou mot de passe incorrect.';
  }
});

adminLogout.addEventListener('click', () => {
  sessionStorage.removeItem('clickquest-admin');
  hideAdminPanel();
  adminMessage.textContent = 'Déconnecté.';
});

adminButton.addEventListener('click', async () => {
  const response = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: '8888',
      username: adminActionUser.value,
      action: adminActionType.value,
      notes: adminNotes.value
    })
  });
  const data = await response.json();
  adminMessage.textContent = response.ok ? 'Action appliquée.' : data.error;
});

createGiftButton.addEventListener('click', async () => {
  const response = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: '8888',
      username: 'admin',
      action: 'create-code',
      giftCode: giftCodeInput.value,
      label: giftLabelInput.value,
      reward: giftRewardInput.value,
      feature: giftFeatureInput.value
    })
  });
  const data = await response.json();
  adminMessage.textContent = response.ok ? data.message : data.error;
});

if (isAdminSession()) {
  showAdminPanel();
}
