const worlds = [
  {
    id: 'forgeron',
    name: 'Forgeron Fantasy',
    emoji: '⚒️',
    baseClick: 'fabriquer une épée',
    description: 'Clique pour fabriquer des épées et acheter des forges.',
    cards: [
      { id: 'apprenti', name: 'Apprenti', emoji: '👨‍🏭', cost: 20, gain: 0.5, type: 'auto' },
      { id: 'forge', name: 'Forge automatique', emoji: '🔥', cost: 120, gain: 2.5, type: 'auto' },
      { id: 'dragon', name: 'Dragon chauffeur', emoji: '🐉', cost: 700, gain: 10, type: 'auto' }
    ]
  },
  {
    id: 'pizza',
    name: 'Empire de Pizza',
    emoji: '🍕',
    baseClick: 'préparer une pizza',
    description: 'Préparez des pizzas, ouvrez des restaurants et débloquez des recettes.',
    cards: [
      { id: 'cuisinier', name: 'Cuisinier', emoji: '👨‍🍳', cost: 25, gain: 0.6, type: 'auto' },
      { id: 'restaurant', name: 'Restaurant', emoji: '🏪', cost: 140, gain: 3, type: 'auto' },
      { id: 'franchise', name: 'Franchise', emoji: '🌍', cost: 800, gain: 12, type: 'auto' }
    ]
  },
  {
    id: 'ia',
    name: 'Évolution d’une IA',
    emoji: '🤖',
    baseClick: 'entraîner une IA',
    description: 'Entraînez des modèles et achetez des centres de données.',
    cards: [
      { id: 'gpu', name: 'GPU', emoji: '💻', cost: 30, gain: 0.7, type: 'auto' },
      { id: 'data', name: 'Centre de données', emoji: '🏢', cost: 180, gain: 4, type: 'auto' },
      { id: 'satellite', name: 'Satellite', emoji: '🛰️', cost: 900, gain: 15, type: 'auto' }
    ]
  },
  {
    id: 'space',
    name: 'Mineur Spatial',
    emoji: '🚀',
    baseClick: 'extraire un minerai',
    description: 'Explorez des planètes et construisez des stations.',
    cards: [
      { id: 'robot', name: 'Robot mineur', emoji: '🤖', cost: 35, gain: 0.8, type: 'auto' },
      { id: 'station', name: 'Station spatiale', emoji: '🛰️', cost: 200, gain: 5, type: 'auto' },
      { id: 'meteorite', name: 'Minerai extraterrestre', emoji: '💎', cost: 1000, gain: 18, type: 'auto' }
    ]
  },
  {
    id: 'mage',
    name: 'Magicien',
    emoji: '🧙',
    baseClick: 'lancer un sort',
    description: 'Gagnez du mana, achetez des grimoires et des familiers.',
    cards: [
      { id: 'grimoire', name: 'Grimoire', emoji: '📖', cost: 40, gain: 1, type: 'auto' },
      { id: 'tour', name: 'Tour de magie', emoji: '🏰', cost: 220, gain: 6, type: 'auto' },
      { id: 'familiers', name: 'Familiers', emoji: '🦊', cost: 1100, gain: 20, type: 'auto' }
    ]
  },
  {
    id: 'virus',
    name: 'Virus Informatique',
    emoji: '💻',
    baseClick: 'infecter un ordinateur',
    description: 'Étendez votre réseau avec humour et malice.',
    cards: [
      { id: 'botnet', name: 'Botnet', emoji: '🕸️', cost: 45, gain: 1.1, type: 'auto' },
      { id: 'exploit', name: 'Exploit', emoji: '🧪', cost: 240, gain: 6.5, type: 'auto' },
      { id: 'worm', name: 'Ver réseau', emoji: '🪱', cost: 1200, gain: 22, type: 'auto' }
    ]
  },
  {
    id: 'garden',
    name: 'Jardin Magique',
    emoji: '🌱',
    baseClick: 'faire pousser une plante',
    description: 'Faites fleurir des jardins et débloquez des forêts enchantées.',
    cards: [
      { id: 'jardinier', name: 'Jardinier', emoji: '🪴', cost: 28, gain: 0.7, type: 'auto' },
      { id: 'fleur', name: 'Fleur rare', emoji: '🌸', cost: 150, gain: 3.5, type: 'auto' },
      { id: 'foret', name: 'Forêt enchantée', emoji: '🌳', cost: 850, gain: 14, type: 'auto' }
    ]
  },
  {
    id: 'cats',
    name: 'Empire des Chats',
    emoji: '🐱',
    baseClick: 'caresser un chat',
    description: 'Collectez des pièces grâce aux chats et à leurs cafés.',
    cards: [
      { id: 'jouet', name: 'Jouet', emoji: '🧶', cost: 22, gain: 0.6, type: 'auto' },
      { id: 'cafe', name: 'Café à chats', emoji: '☕', cost: 130, gain: 3.2, type: 'auto' },
      { id: 'palais', name: 'Palais félin', emoji: '🏰', cost: 750, gain: 11, type: 'auto' }
    ]
  },
  {
    id: 'robots',
    name: 'Fabrique de Robots',
    emoji: '🤖',
    baseClick: 'assembler un robot',
    description: 'Construisez des robots qui fabriquent d’autres robots.',
    cards: [
      { id: 'robot1', name: 'Robot de base', emoji: '🔧', cost: 35, gain: 0.8, type: 'auto' },
      { id: 'robot2', name: 'Robot avancé', emoji: '⚙️', cost: 200, gain: 5, type: 'auto' },
      { id: 'robot3', name: 'Robot de génération 3', emoji: '🦾', cost: 1100, gain: 19, type: 'auto' }
    ]
  },
  {
    id: 'medieval',
    name: 'Royaume Médiéval',
    emoji: '👑',
    baseClick: 'récolter des impôts',
    description: 'Étendez votre royaume, vos châteaux et vos armées.',
    cards: [
      { id: 'village', name: 'Village', emoji: '🏘️', cost: 32, gain: 0.75, type: 'auto' },
      { id: 'chateau', name: 'Château', emoji: '🏰', cost: 180, gain: 4.5, type: 'auto' },
      { id: 'armee', name: 'Armée', emoji: '⚔️', cost: 950, gain: 16, type: 'auto' }
    ]
  }
];

const worldMenu = document.getElementById('worldMenu');
const worldPointsElement = document.getElementById('worldPoints');
const worldNameElement = document.getElementById('worldName');
const worldLevelText = document.getElementById('worldLevelText');
const worldProgressFill = document.getElementById('worldProgressFill');
const clickPowerValue = document.getElementById('clickPowerValue');
const activeSkillText = document.getElementById('activeSkillText');
const prestigeDisplay = document.getElementById('prestigeDisplay');
const clickWorldButton = document.getElementById('clickWorldButton');
const activateSkillButton = document.getElementById('activateSkillButton');
const prestigeButton = document.getElementById('prestigeButton');
const worldCardList = document.getElementById('worldCardList');
const bonusList = document.getElementById('bonusList');
const eventList = document.getElementById('eventList');

let state = {
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

function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);
}

function getCurrentWorld() {
  return worlds[state.currentWorldIndex];
}

function getClickPower() {
  const base = 1 + state.prestige * 0.5 + (state.ownedCards[getCurrentWorld().id] ? 0 : 0);
  return state.activeSkill ? base * 10 : base;
}

function renderWorldsMenu() {
  worldMenu.innerHTML = '';
  worlds.forEach((world, index) => {
    const button = document.createElement('button');
    button.className = index === state.currentWorldIndex ? 'primary small' : 'secondary small';
    button.textContent = `${world.emoji} ${world.name}`;
    button.addEventListener('click', () => {
      state.currentWorldIndex = index;
      render();
    });
    worldMenu.appendChild(button);
  });
}

function renderCards() {
  const world = getCurrentWorld();
  worldCardList.innerHTML = '';
  world.cards.forEach((card) => {
    const count = state.ownedCards[card.id] || 0;
    const item = document.createElement('div');
    item.className = 'shop-card';
    item.innerHTML = `
      <div>
        <strong>${card.emoji} ${card.name}</strong>
        <div class="meta">+${card.gain}/s • possédé : ${count}</div>
      </div>
      <button class="primary" data-card="${card.id}" data-cost="${card.cost}">Acheter ${card.cost}</button>
    `;
    worldCardList.appendChild(item);
  });
}

function renderBonuses() {
  bonusList.innerHTML = '';
  const bonuses = [
    { label: '⭐ Prestige', detail: 'Recommencer avec un bonus permanent' },
    { label: '🎲 Événements', detail: 'Météorite, coffre, marchand' },
    { label: '🏆 Succès', detail: 'Récompenses à débloquer' },
    { label: '🎁 Récompense quotidienne', detail: state.dailyRewardClaimed ? 'Réclamée' : 'Disponible' },
    { label: '🌍 Mondes', detail: `${worlds.length} mondes` }
  ];
  bonuses.forEach((bonus) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${bonus.label}</strong> — ${bonus.detail}`;
    bonusList.appendChild(li);
  });
}

function renderEvents() {
  eventList.innerHTML = '';
  const events = state.events.slice(-5).reverse();
  if (events.length === 0) {
    eventList.innerHTML = '<li>Aucun événement pour le moment.</li>';
    return;
  }
  events.forEach((event) => {
    const li = document.createElement('li');
    li.textContent = event;
    eventList.appendChild(li);
  });
}

function render() {
  const world = getCurrentWorld();
  const progress = Math.min(100, (state.points % 100) / 100 * 100);

  worldPointsElement.textContent = formatNumber(state.points);
  worldNameElement.textContent = `${world.emoji} ${world.name}`;
  worldLevelText.textContent = `Niveau ${Math.floor(state.points / 100) + 1}`;
  worldProgressFill.style.width = `${progress}%`;
  clickPowerValue.textContent = formatNumber(getClickPower());
  activeSkillText.textContent = state.activeSkill ? 'x10 actif' : 'Aucune';
  prestigeDisplay.textContent = state.prestige;
  renderWorldsMenu();
  renderCards();
  renderBonuses();
  renderEvents();
}

function purchaseCard(cardId) {
  const world = getCurrentWorld();
  const card = world.cards.find((entry) => entry.id === cardId);
  if (!card) return;
  const cost = card.cost;
  if (state.points < cost) return;
  state.points -= cost;
  state.ownedCards[card.id] = (state.ownedCards[card.id] || 0) + 1;
  state.events.unshift(`${card.name} acheté dans ${world.name}`);
  render();
}

function triggerRandomEvent() {
  const events = [
    '☄️ Météorite : +40 points',
    '🧰 Coffre : +70 points',
    '🛍️ Marchand : +25 points',
    '✨ Bonus de monde : +30 points'
  ];
  const picked = events[Math.floor(Math.random() * events.length)];
  const amount = Number(picked.match(/\+\d+/)?.[0].replace('+', '')) || 0;
  state.points += amount;
  state.events.unshift(picked);
  render();
}

function activateSkill() {
  state.activeSkill = 'x10';
  state.skillTimer = 30;
  state.events.unshift('⚡ Compétence active : x10 pendant 30 secondes');
  render();
}

function claimDailyReward() {
  if (state.dailyRewardClaimed) return;
  state.points += 100;
  state.dailyRewardClaimed = true;
  state.events.unshift('🎁 Récompense quotidienne : +100 points');
  render();
}

function prestige() {
  if (state.points < 500) return;
  state.prestige += 1;
  state.points = 0;
  state.ownedCards = {};
  state.events.unshift('🌟 Prestige activé : bonus permanent ajouté');
  render();
}

function tick() {
  const world = getCurrentWorld();
  let gain = 0;
  Object.entries(state.ownedCards).forEach(([cardId, count]) => {
    const cardDef = world.cards.find((entry) => entry.id === cardId);
    if (cardDef) gain += cardDef.gain * count;
  });
  state.points += gain / 10;
  if (state.skillTimer > 0) {
    state.skillTimer -= 1 / 10;
    if (state.skillTimer <= 0) {
      state.activeSkill = null;
      render();
    }
  }
  render();
}

clickWorldButton.addEventListener('click', () => {
  state.points += getClickPower();
  render();
});

activateSkillButton.addEventListener('click', activateSkill);
prestigeButton.addEventListener('click', prestige);
worldCardList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-card]');
  if (!button) return;
  purchaseCard(button.dataset.card);
});
bonusList.addEventListener('click', (event) => {
  const target = event.target.closest('li');
  if (!target) return;
  claimDailyReward();
});
setInterval(() => {
  tick();
  if (Math.random() < 0.08) triggerRandomEvent();
}, 100);

render();
