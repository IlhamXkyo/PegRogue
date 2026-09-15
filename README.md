# 🔮 PEGROGUE // Physics Roguelike Pachinko & Relic Deckbuilder

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)
[![HTML5 Canvas](https://img.shields.io/badge/Render-HTML5_Canvas-22c55e.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
[![Web Audio API](https://img.shields.io/badge/Audio-Procedural_Chimes-38bdf8.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

> **PegRogue** is an addictive, tactile 2D physics roguelike combining the pinball chaos of **Peglin** with the synergistic deckbuilding and dopamine scoring of **Balatro**. Built with high-performance HTML5 Canvas and pure procedural Web Audio chimes.

---

## 🕹️ How to Play

1. **Aim & Trajectory**: Move your mouse or touch cursor to aim the trajectory prediction guide.
2. **Launch Orb**: Click or tap to launch your orb into the pinboard.
3. **Chain Multipliers**:
   - Each peg struck increases your points.
   - **Crit Pegs (★)** boost your round multiplier (`+x0.5` or `+x1.0`).
   - **Bomb Pegs (💣)** explode, detonating nearby peg clusters.
   - **Refresh Pegs (⟳)** repopulate all pegs on the board.
4. **Multiplier Buckets**: Drop into moving buckets at the bottom (`x1`, `x2`, `x5`, `x10`) to multiply your entire drop value!
5. **Beat the Blind**: Reach the required quota before running out of orbs in your satchel.
6. **Merchant Bazaar**: Visit the shop between floors to buy game-changing Relics and specialized Orbs.

---

## 🔮 Orb Classes

- **Standard Orb**: Reliable balanced mass and elasticity.
- **Dagger Orb**: High kinetic velocity; slices smoothly through dense clusters.
- **Volt Orb**: Conducts electric spark bursts to nearby pegs on impact.
- **Heavy Boulder**: High-mass kinetic wrecker; crushes through obstacles with brute momentum.

---

## 🃏 Synergistic Relics

- 🎾 **Rubber Coating**: +35% Orb bounciness & velocity.
- ★ **Crit Surge**: Crit Pegs grant `+x1.0` multiplier instead of `+x0.5`.
- 🪙 **Golden Touch**: Earn +1 Coin for every 8 pegs struck in a drop.
- 💣 **Blast Powder**: Bomb detonation blast radius increased by +40%.
- 🔮 **Splitter Core**: Hitting a Crit peg has a 50% chance to split the orb into 2 simultaneous orbs!

---

## 🎵 Dynamic Chime Audio ("Juice")

- **Ascending Musical Chimes**: Every sequential peg hit ascends through a harmonic pentatonic scale, creating an organic crescendo of musical dopamine during cascading chain reactions.
- **Zero External Audio Files**: 100% synthesized in real time via the **Web Audio API**.

---

## 🚀 Quick Start Locally

```bash
git clone https://github.com/IlhamXkyo/PegRogue.git
cd PegRogue

# Run local web server with Python:
python -m http.server 8080

# Or with Node:
npx serve
```

Open `http://localhost:8080` in your web browser.

---

## 🌐 Deploy to GitHub Pages

1. Navigate to **Settings** > **Pages** in your GitHub repository.
2. Set **Source** to `Deploy from a branch`.
3. Choose branch `main` and folder `/ (root)`.
4. Click **Save**. The game will be live at:
   `https://ilhamxkyo.github.io/PegRogue/`

---

## 📜 License

MIT License. See `LICENSE` for details.

Crafted by [IlhamXkyo](https://github.com/IlhamXkyo).
