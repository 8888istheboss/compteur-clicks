const animals = Array.from(document.querySelectorAll('.animal'));
const feedBtn = document.getElementById('feedBtn');
const healBtn = document.getElementById('healBtn');
const playBtn = document.getElementById('playBtn');
const gameMessage = document.getElementById('gameMessage');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const hungerEl = document.getElementById('hunger');
const healthEl = document.getElementById('health');
const happinessEl = document.getElementById('happiness');

let selectedAction = 'feed';
let stats = {
  score: 0,
  level: 1,
  hunger: 100,
  health: 100,
  happiness: 100
};

function updateStats() {
  scoreEl.textContent = `Score : ${stats.score}`;
  levelEl.textContent = `Niveau : ${stats.level}`;
  hungerEl.textContent = `Faim : ${stats.hunger}`;
  healthEl.textContent = `Santé : ${stats.health}`;
  happinessEl.textContent = `Joyeux : ${stats.happiness}`;
}

function levelUpCheck() {
  while (stats.score >= stats.level * 120) {
    stats.level += 1;
  }
}

function applyAction(animalType) {
  if (selectedAction === 'feed') {
    stats.hunger = Math.min(100, stats.hunger + 24);
    stats.happiness = Math.min(100, stats.happiness + 10);
    stats.score += 18;
    gameMessage.textContent = `Vous avez nourri ${animalType}.`;
  } else if (selectedAction === 'heal') {
    stats.health = Math.min(100, stats.health + 22);
    stats.happiness = Math.min(100, stats.happiness + 6);
    stats.score += 16;
    gameMessage.textContent = `Vous avez soigné ${animalType}.`;
  } else {
    stats.happiness = Math.min(100, stats.happiness + 16);
    stats.hunger = Math.max(0, stats.hunger - 8);
    stats.score += 20;
    gameMessage.textContent = `Vous avez joué avec ${animalType}.`;
  }

  stats.hunger = Math.max(0, stats.hunger - 4);
  stats.health = Math.max(0, stats.health - 2);
  stats.happiness = Math.max(0, stats.happiness - 3);
  levelUpCheck();
  updateStats();
}

animals.forEach((animal) => {
  animal.addEventListener('click', () => {
    applyAction(animal.dataset.animal);
  });
});

feedBtn.addEventListener('click', () => {
  selectedAction = 'feed';
  gameMessage.textContent = 'Action sélectionnée : nourrir.';
});

healBtn.addEventListener('click', () => {
  selectedAction = 'heal';
  gameMessage.textContent = 'Action sélectionnée : soigner.';
});

playBtn.addEventListener('click', () => {
  selectedAction = 'play';
  gameMessage.textContent = 'Action sélectionnée : jouer.';
});

setInterval(() => {
  stats.hunger = Math.max(0, stats.hunger - 2);
  stats.health = Math.max(0, stats.health - 1);
  stats.happiness = Math.max(0, stats.happiness - 2);
  updateStats();
}, 2000);

updateStats();
