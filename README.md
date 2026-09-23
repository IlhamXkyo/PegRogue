# PegRogue

A 2D physics-based pachinko roguelike game built with HTML5 Canvas.

PegRogue combines pachinko drop mechanics with deckbuilding progression. Players launch orbs into randomized pegboards to hit target score quotas, purchasing specialized orbs and passive relics between rounds.

## Gameplay Mechanics

1. **Aim and Launch**: Position the trajectory guide and launch the orb into the board.
2. **Peg Interactions**:
   - Standard pegs add baseline points.
   - Crit pegs increase round score multipliers.
   - Bomb pegs detonate, clearing nearby clusters.
   - Refresh pegs restore previously cleared pegs on the board.
3. **Score Buckets**: Orbs falling into bottom buckets multiply the drop score based on bucket difficulty.
4. **Relics and Upgrades**: Visit the floor shop between rounds to modify orb mass, elasticity, and multiplier chains.

## Running Locally

Clone the repository and open `index.html` in your browser:

```bash
git clone https://github.com/IlhamXkyo/PegRogue.git
cd PegRogue
python -m http.server 8000
```

Open `http://localhost:8000`.

## Tech Stack

- HTML5 Canvas
- Vanilla JavaScript
- Web Audio API

## License

MIT License. See LICENSE for details.
