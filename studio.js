const studioForm = document.getElementById('studioForm');
const promptInput = document.getElementById('promptInput');
const studioMessage = document.getElementById('studioMessage');
const previewFrame = document.getElementById('previewFrame');
const previewLink = document.getElementById('previewLink');
const gameLibrary = document.getElementById('gameLibrary');
const gameCount = document.getElementById('gameCount');

let generatedGames = [];

const templates = [
  {
    name: 'Cosmos Rush',
    theme: 'space',
    html: `<div class="template-card space"><h1>Cosmos Rush</h1><p>Collecte les étoiles et évite les météores.</p><button>Jouer</button></div>`
  },
  {
    name: 'Lumière Puzzle',
    theme: 'puzzle',
    html: `<div class="template-card puzzle"><h1>Lumière Puzzle</h1><p>Enchaîne les formes pour révéler la séquence.</p><button>Jouer</button></div>`
  },
  {
    name: 'Mystery Loop',
    theme: 'mystery',
    html: `<div class="template-card mystery"><h1>Mystery Loop</h1><p>Le labyrinthe se déplace à chaque tour.</p><button>Jouer</button></div>`
  },
  {
    name: 'Nova Clicker',
    theme: 'clicker',
    html: `<div class="template-card clicker"><h1>Nova Clicker</h1><p>Enchaîne les clics pour charger la supernova.</p><button>Jouer</button></div>`
  }
];

function renderLibrary() {
  gameCount.textContent = generatedGames.length;
  if (!generatedGames.length) {
    gameLibrary.innerHTML = '<div class="empty-state">Aucune création pour le moment. Lancez-vous avec un prompt.</div>';
    return;
  }

  gameLibrary.innerHTML = generatedGames.map((game, index) => `
    <article class="game-card">
      <div>
        <p class="eyebrow">Jeu ${index + 1}</p>
        <h3>${game.title}</h3>
        <p>${game.description}</p>
      </div>
      <div class="game-card-actions">
        <a class="button primary small" href="${game.url}" target="_blank" rel="noreferrer">Tester</a>
      </div>
    </article>
  `).join('');
}

function chooseTemplate(prompt) {
  const normalized = prompt.trim().toLowerCase();
  if (normalized.includes('puzzle') || normalized.includes('lumière')) return templates[1];
  if (normalized.includes('myst') || normalized.includes('énig')) return templates[2];
  if (normalized.includes('space') || normalized.includes('cosmos') || normalized.includes('étoile')) return templates[0];
  return templates[3];
}

function createGameFromPrompt(prompt) {
  const template = chooseTemplate(prompt);
  const title = template.name;
  const description = `Version générée automatiquement à partir du prompt : “${prompt.trim()}”.`;
  const url = `./classic/index.html?mode=${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}`;
  return { title, description, url, template };
}

async function generateGame(event) {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) {
    studioMessage.textContent = 'Renseignez un prompt pour générer un jeu.';
    return;
  }

  studioMessage.textContent = 'Génération en cours...';
  const game = createGameFromPrompt(prompt);
  generatedGames.unshift(game);
  renderLibrary();
  previewFrame.srcdoc = `
    <style>
      body { margin:0; font-family: Inter, sans-serif; display:grid; place-items:center; min-height:100vh; background: radial-gradient(circle at top, #22c55e, #0f172a); color:white; }
      .template-card { padding: 2rem; border-radius: 24px; background: rgba(2,6,23,.75); box-shadow: 0 20px 60px rgba(0,0,0,.3); text-align:center; max-width: 420px; }
      .template-card.space { background: linear-gradient(135deg, #0f172a, #1d4ed8); }
      .template-card.puzzle { background: linear-gradient(135deg, #7c3aed, #0f766e); }
      .template-card.mystery { background: linear-gradient(135deg, #111827, #ef4444); }
      .template-card.clicker { background: linear-gradient(135deg, #fb923c, #facc15); color:#111827; }
      button { padding: .8rem 1.2rem; border:none; border-radius:999px; background: linear-gradient(135deg,#22c55e,#14b8a6); color:white; font-weight:700; }
    </style>
    ${game.template.html}
  `;
  previewLink.href = game.url;
  previewLink.classList.remove('hidden');
  studioMessage.textContent = 'Mini-jeu généré avec succès.';
  promptInput.value = '';
  try {
    await fetch('/api/create-game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: localStorage.getItem('hub-active-user') || 'studio', prompt })
    });
  } catch {
    // silent fallback
  }
}

studioForm.addEventListener('submit', generateGame);
renderLibrary();
