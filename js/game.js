/**
 * PegRogue // Game Controller, Relics & Roguelike Progression
 */

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('pachinko-canvas');
    this.audio = new AudioSystem();
    this.board = new PhysicsBoard(this.canvas, this.audio);

    // UI Elements
    this.uiFloorTitle = document.getElementById('ui-floor-title');
    this.uiTargetScore = document.getElementById('ui-target-score');
    this.uiRoundScore = document.getElementById('ui-round-score');
    this.uiNeededScore = document.getElementById('ui-needed-score');
    this.uiProgressFill = document.getElementById('ui-progress-fill');
    this.uiOrbSatchel = document.getElementById('ui-orb-satchel');
    this.uiOrbsLeft = document.getElementById('ui-orbs-left');
    this.uiRelicList = document.getElementById('ui-relic-list');
    this.uiRelicCount = document.getElementById('ui-relic-count');
    this.uiGold = document.getElementById('ui-gold');
    this.uiPegHits = document.getElementById('ui-peg-hits');
    this.uiMultVal = document.getElementById('ui-mult-val');
    this.uiDropVal = document.getElementById('ui-drop-val');
    this.uiActiveOrbName = document.getElementById('ui-active-orb-name');
    this.uiActiveOrbDesc = document.getElementById('ui-active-orb-desc');
    this.uiBestScore = document.getElementById('ui-best-score');

    // Modals
    this.modalShop = document.getElementById('modal-shop');
    this.shopGoldVal = document.getElementById('shop-gold-val');
    this.shopItemsContainer = document.getElementById('shop-items-container');
    this.btnNextFloor = document.getElementById('btn-next-floor');
    this.modalGameover = document.getElementById('modal-gameover');
    this.goFloors = document.getElementById('go-floors');
    this.goTotalScore = document.getElementById('go-total-score');
    this.goMaxMult = document.getElementById('go-max-mult');
    this.btnRestart = document.getElementById('btn-restart');

    // Progression State
    this.floor = 1;
    this.gold = 15;
    this.roundScore = 0;
    this.targetScore = 500;
    this.totalScore = 0;
    this.bestScore = parseInt(localStorage.getItem('pegrogue_best') || '0', 10);
    this.maxMultiplierAchieved = 1.0;

    // Drop tracking
    this.currentDropHits = 0;
    this.currentDropMult = 1.0;
    this.currentDropBasePoints = 0;

    // Orb Archetypes Catalog
    this.orbArchetypes = {
      standard: {
        id: 'standard',
        name: 'Standard Orb',
        desc: 'Balanced weight and elasticity.',
        color: '#f8fafc',
        trailColor: '#ffd700',
        radius: 9.5,
        mass: 1.0,
        bounciness: 0.72
      },
      dagger: {
        id: 'dagger',
        name: 'Dagger Orb',
        desc: 'High velocity, pierces cleanly through pegs.',
        color: '#38bdf8',
        trailColor: '#0284c7',
        radius: 8.0,
        speed: 680,
        bounciness: 0.85
      },
      volt: {
        id: 'volt',
        name: 'Volt Orb',
        desc: 'Zaps electric sparks to nearby pegs.',
        color: '#fde047',
        trailColor: '#eab308',
        radius: 9.0,
        bounciness: 0.75
      },
      boulder: {
        id: 'boulder',
        name: 'Heavy Boulder',
        desc: 'Crushes through clusters with massive momentum.',
        color: '#a1a1aa',
        trailColor: '#52525b',
        radius: 13.0,
        mass: 2.2,
        bounciness: 0.55
      }
    };

    // Starting Satchel
    this.satchel = ['standard', 'dagger', 'standard', 'volt'];
    this.currentSatchelIdx = 0;

    // Relics Collection
    this.relicsCatalog = [
      { id: 'rubberCoat', name: 'Rubber Coating', icon: '🎾', desc: '+35% Orb bounciness & velocity.', cost: 8 },
      { id: 'critSurge', name: 'Crit Surge', icon: '★', desc: 'Crit Pegs give +x1.0 Mult instead of +x0.5.', cost: 10 },
      { id: 'goldenTouch', name: 'Golden Touch', icon: '🪙', desc: 'Earn +1 Coin for every 8 pegs hit.', cost: 9 },
      { id: 'dynamiteFactory', name: 'Blast Powder', icon: '💣', desc: 'Bombs blast radius increased by +40%.', cost: 11 },
      { id: 'multiballPrism', name: 'Splitter Core', icon: '🔮', desc: 'Crit pegs duplicate your orb into 2!', cost: 14 }
    ];

    this.activeRelics = [];

    this.init();
  }

  init() {
    this.setupListeners();
    this.updateUI();
    this.updateSatchelUI();

    // Start Animation Loop
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  setupListeners() {
    // Mouse Aim & Launch
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
      this.board.setAim(x, y);
    });

    this.canvas.addEventListener('click', () => {
      this.audio.init();
      if (this.board.isAiming && this.satchel.length > 0) {
        this.launchNextOrb();
      }
    });

    // Touch Support
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
      const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
      this.board.setAim(x, y);
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.audio.init();
      if (this.board.isAiming && this.satchel.length > 0) {
        this.launchNextOrb();
      }
    }, { passive: false });

    // Keyboard Shortcuts (R to Discard Orb)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyR' || e.key === 'r' || e.key === 'R') {
        this.discardCurrentOrb();
      }
    });

    // Shop Next Floor Button
    this.btnNextFloor.addEventListener('click', () => {
      this.modalShop.classList.remove('active');
      this.startNextFloor();
    });

    // Game Over Restart
    this.btnRestart.addEventListener('click', () => {
      this.modalGameover.classList.remove('active');
      this.restartRun();
    });
  }

  discardCurrentOrb() {
    if (!this.board.isAiming || this.satchel.length <= 1) return;
    this.satchel.shift();
    if (this.audio && typeof this.audio.playTone === 'function') {
      this.audio.playTone(220, 0.08, 'sawtooth');
    }
    this.updateSatchelUI();
  }

  launchNextOrb() {
    if (this.satchel.length === 0) return;

    const orbTypeKey = this.satchel.shift();
    const archetype = this.orbArchetypes[orbTypeKey] || this.orbArchetypes.standard;

    // Reset drop stats
    this.currentDropHits = 0;
    this.currentDropMult = 1.0;
    this.currentDropBasePoints = 0;
    this.updateDropTicker();

    // Spawn orb with active relic modifiers
    const modifiers = this.getRelicModifiers();
    this.board.spawnOrb(archetype, modifiers);

    this.updateSatchelUI();
  }

  getRelicModifiers() {
    const mod = {};
    this.activeRelics.forEach((r) => {
      mod[r.id] = true;
    });
    return mod;
  }

  onPegHit(peg, clearedBonusCount = 0) {
    this.currentDropHits += 1 + clearedBonusCount;

    // Base point values
    let points = 10;
    if (peg.type === 'crit') {
      points = 25;
      const critAdd = this.hasRelic('critSurge') ? 1.0 : 0.5;
      this.currentDropMult += critAdd;
      this.board.addPopup(peg.x, peg.y - 15, `+${critAdd}x CRIT!`, '#38bdf8', 18);

      // Splitter Core Relic Check: spawn split orb at collision point with active orb cap
      if (this.hasRelic('multiballPrism') && Math.random() < 0.4 && this.board.orbs.length < 5) {
        this.board.spawnSplitOrb(peg.x, peg.y, this.orbArchetypes.standard, this.getRelicModifiers());
        this.board.addPopup(peg.x, peg.y + 15, 'SPLIT!', '#ffd700', 16);
      }
    } else if (peg.type === 'bomb') {
      points = 40 + clearedBonusCount * 15;
    } else if (peg.type === 'refresh') {
      points = 30;
    }

    this.currentDropBasePoints += points;
    this.maxMultiplierAchieved = Math.max(this.maxMultiplierAchieved, this.currentDropMult);

    // Golden Touch Relic Check
    if (this.hasRelic('goldenTouch') && this.currentDropHits % 8 === 0) {
      this.gold += 1;
      this.audio.playCoin();
      this.board.addPopup(this.board.launcherPos.x, 80, '+1 🪙', '#ffd700', 18);
      this.updateUI();
    }

    this.updateDropTicker();
  }

  onBucketEnter(bucketMultiplier) {
    const finalMultiplier = this.currentDropMult * bucketMultiplier;
    const dropTotalScore = Math.round(this.currentDropBasePoints * finalMultiplier);

    this.roundScore += dropTotalScore;
    this.totalScore += dropTotalScore;

    // Update progress bar
    const progress = Math.min(100, (this.roundScore / this.targetScore) * 100);
    this.uiProgressFill.style.width = `${progress}%`;
    this.uiRoundScore.textContent = this.roundScore.toLocaleString();

    // Check Blind Quota Cleared!
    if (this.roundScore >= this.targetScore) {
      setTimeout(() => {
        this.openShop();
      }, 700);
      return;
    }

    // If out of orbs and didn't reach target -> Game Over
    if (this.satchel.length === 0 && this.board.orbs.length === 0) {
      setTimeout(() => {
        this.gameOver();
      }, 700);
    }
  }

  hasRelic(id) {
    return this.activeRelics.some((r) => r.id === id);
  }

  openShop() {
    this.audio.playRefresh();
    this.gold += 10 + this.floor * 2; // Floor completion reward
    this.shopGoldVal.textContent = this.gold;

    // Build Shop Items (3 Random Relics/Orbs)
    this.shopItemsContainer.innerHTML = '';

    // Available unowned relics
    const availableRelics = this.relicsCatalog.filter((r) => !this.hasRelic(r.id));
    // Pick 2 relics
    const pickedRelics = availableRelics.sort(() => 0.5 - Math.random()).slice(0, 2);

    pickedRelics.forEach((relic) => {
      const card = document.createElement('div');
      card.className = 'shop-card';
      card.innerHTML = `
        <div class="card-top">
          <span class="card-icon">${relic.icon}</span>
          <span class="card-cost">${relic.cost} 🪙</span>
        </div>
        <div class="card-title">${relic.name}</div>
        <div class="card-effect">${relic.desc}</div>
        <button class="btn-buy" ${this.gold < relic.cost ? 'disabled' : ''}>BUY RELIC</button>
      `;

      card.querySelector('.btn-buy').addEventListener('click', () => {
        if (this.gold >= relic.cost) {
          this.gold -= relic.cost;
          this.shopGoldVal.textContent = this.gold;
          this.activeRelics.push(relic);
          this.audio.playCoin();
          card.classList.add('bought');
          card.querySelector('.btn-buy').textContent = 'ACQUIRED';
          this.updateRelicsUI();
          this.updateUI();
        }
      });

      this.shopItemsContainer.appendChild(card);
    });

    // Pick 1 Special Orb to add to Satchel (Boulder or Dagger or Volt)
    const orbChoices = [this.orbArchetypes.boulder, this.orbArchetypes.dagger, this.orbArchetypes.volt];
    const pickedOrb = orbChoices[Math.floor(Math.random() * orbChoices.length)];
    const orbCost = 7;

    const orbCard = document.createElement('div');
    orbCard.className = 'shop-card';
    orbCard.innerHTML = `
      <div class="card-top">
        <span class="card-icon">🔮</span>
        <span class="card-cost">${orbCost} 🪙</span>
      </div>
      <div class="card-title">${pickedOrb.name}</div>
      <div class="card-effect">${pickedOrb.desc} (Adds to Satchel)</div>
      <button class="btn-buy" ${this.gold < orbCost ? 'disabled' : ''}>ADD ORB</button>
    `;

    orbCard.querySelector('.btn-buy').addEventListener('click', () => {
      if (this.gold >= orbCost) {
        this.gold -= orbCost;
        this.shopGoldVal.textContent = this.gold;
        this.satchel.push(pickedOrb.id);
        this.audio.playCoin();
        orbCard.classList.add('bought');
        orbCard.querySelector('.btn-buy').textContent = 'ACQUIRED';
        this.updateSatchelUI();
        this.updateUI();
      }
    });

    this.shopItemsContainer.appendChild(orbCard);
    this.modalShop.classList.add('active');
  }

  startNextFloor() {
    this.floor++;
    this.roundScore = 0;
    // Scale target quota
    this.targetScore = Math.round(500 * Math.pow(1.65, this.floor - 1));

    // Refill standard orbs if running low
    while (this.satchel.length < 4) {
      this.satchel.push('standard');
    }

    this.board.generateBoard();
    this.updateUI();
    this.updateSatchelUI();
  }

  gameOver() {
    if (this.totalScore > this.bestScore) {
      this.bestScore = this.totalScore;
      localStorage.setItem('pegrogue_best', this.bestScore.toString());
    }

    this.goFloors.textContent = `Floor ${this.floor}`;
    this.goTotalScore.textContent = this.totalScore.toLocaleString();
    this.goMaxMult.textContent = `x${this.maxMultiplierAchieved.toFixed(1)}`;
    this.modalGameover.classList.add('active');
  }

  restartRun() {
    this.floor = 1;
    this.gold = 15;
    this.roundScore = 0;
    this.targetScore = 500;
    this.totalScore = 0;
    this.maxMultiplierAchieved = 1.0;
    this.activeRelics = [];
    this.satchel = ['standard', 'dagger', 'standard', 'volt'];

    this.board.generateBoard();
    this.updateUI();
    this.updateRelicsUI();
    this.updateSatchelUI();
  }

  updateDropTicker() {
    this.uiPegHits.textContent = this.formatNumber(this.currentDropHits);
    this.uiMultVal.textContent = `x${this.currentDropMult.toFixed(1)}`;
    const estimatedValue = Math.round(this.currentDropBasePoints * this.currentDropMult);
    this.uiDropVal.textContent = this.formatNumber(estimatedValue);
  }

  updateSatchelUI() {
    this.uiOrbSatchel.innerHTML = '';
    this.uiOrbsLeft.textContent = this.satchel.length;

    this.satchel.forEach((orbKey) => {
      const pill = document.createElement('div');
      pill.className = `orb-pill ${orbKey}`;
      pill.title = this.orbArchetypes[orbKey]?.name || 'Orb';
      this.uiOrbSatchel.appendChild(pill);
    });

    // Update active ready orb badge
    const nextOrbKey = this.satchel[0] || 'standard';
    const nextArchetype = this.orbArchetypes[nextOrbKey];
    if (nextArchetype) {
      this.uiActiveOrbName.textContent = nextArchetype.name;
      this.uiActiveOrbDesc.textContent = nextArchetype.desc;
    }
  }

  updateRelicsUI() {
    this.uiRelicList.innerHTML = '';
    this.uiRelicCount.textContent = this.activeRelics.length;

    for (let i = 0; i < 5; i++) {
      if (i < this.activeRelics.length) {
        const relic = this.activeRelics[i];
        const slot = document.createElement('div');
        slot.className = 'relic-slot';
        slot.innerHTML = `<span class="icon">${relic.icon}</span><span>${relic.name}</span>`;
        slot.title = relic.desc;
        this.uiRelicList.appendChild(slot);
      } else {
        const empty = document.createElement('div');
        empty.className = 'relic-empty-slot';
        empty.textContent = 'EMPTY';
        this.uiRelicList.appendChild(empty);
      }
    }
  }

  formatNumber(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    return n.toLocaleString();
  }

  updateUI() {
    this.uiFloorTitle.textContent = `FLOOR ${this.floor} // ANTE ${Math.ceil(this.floor / 3)}`;
    this.uiTargetScore.textContent = this.formatNumber(this.targetScore);
    this.uiRoundScore.textContent = this.formatNumber(this.roundScore);
    this.uiNeededScore.textContent = `/ ${this.formatNumber(this.targetScore)} pts`;
    this.uiGold.textContent = this.formatNumber(this.gold);
    this.uiBestScore.textContent = `${this.formatNumber(this.bestScore)} pts`;
    const progress = Math.min(100, (this.roundScore / this.targetScore) * 100);
    this.uiProgressFill.style.width = `${progress}%`;
  }

  loop(currentTime) {
    requestAnimationFrame(this.loop);

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
    this.lastTime = currentTime;

    // Update physics board
    this.board.update(
      dt,
      (peg, bonus) => this.onPegHit(peg, bonus),
      (mult) => this.onBucketEnter(mult),
      this.getRelicModifiers()
    );

    // Render 2D canvas
    this.board.render();
  }
}

// Launch on load
document.addEventListener('DOMContentLoaded', () => {
  new GameEngine();
});
