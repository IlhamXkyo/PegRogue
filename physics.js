/**
 * PegRogue // 2D Tactile Physics Engine & Particle Simulation
 */

class PhysicsBoard {
  constructor(canvas, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.audio = audio;

    this.width = canvas.width;
    this.height = canvas.height;

    // Gravity & Physics Constants
    this.gravity = 680; // px/s^2
    this.restitution = 0.72; // bounce factor

    // Board Entities
    this.pegs = [];
    this.orbs = []; // Active orbs in motion
    this.buckets = [];
    this.particles = [];
    this.popups = [];

    // Aiming
    this.aimAngle = Math.PI / 2; // Aim pointing downwards
    this.launcherPos = { x: this.width / 2, y: 45 };
    this.isAiming = true;

    // Moving Buckets
    this.bucketOffset = 0;
    this.bucketSpeed = 40;

    // Screen Shake
    this.screenShake = 0;

    // Safeguards against infinite loops
    this.refreshesThisDrop = 0;
    this.maxSimultaneousOrbs = 6;

    this.initBuckets();
    this.generateBoard();
  }

  initBuckets() {
    this.buckets = [
      { mult: 1, color: '#94a3b8', label: 'x1' },
      { mult: 2, color: '#38bdf8', label: 'x2' },
      { mult: 10, color: '#ffd700', label: 'x10' },
      { mult: 5, color: '#a855f7', label: 'x5' },
      { mult: 2, color: '#38bdf8', label: 'x2' },
      { mult: 1, color: '#94a3b8', label: 'x1' }
    ];
  }

  generateBoard() {
    this.pegs = [];
    const rows = 11;
    const spacingY = 46;
    const startY = 110;

    for (let r = 0; r < rows; r++) {
      const isOdd = r % 2 === 1;
      const cols = isOdd ? 9 : 10;
      const spacingX = this.width / (cols + 1);

      for (let c = 0; c < cols; c++) {
        const x = spacingX * (c + 1) + (Math.random() - 0.5) * 6;
        const y = startY + r * spacingY + (Math.random() - 0.5) * 4;

        // Determine peg type
        let type = 'standard';
        const rand = Math.random();
        if (rand < 0.12) type = 'crit';
        else if (rand < 0.17) type = 'bomb';
        else if (rand < 0.20) type = 'refresh';

        this.pegs.push({
          x: x,
          y: y,
          radius: 8.5,
          type: type,
          active: true,
          hit: false,
          scale: 1.0,
          lightPulse: 0
        });
      }
    }
  }

  refreshAllPegs() {
    if (this.refreshesThisDrop >= 2) {
      this.addPopup(this.width / 2, this.height / 2, 'MAX REFRESHEs REACHED', '#94a3b8', 16);
      return;
    }
    this.refreshesThisDrop++;
    this.pegs.forEach((p) => {
      // Repopulate standard and bomb pegs, but do not re-trigger refresh pegs in the same chain
      if (p.type !== 'refresh') {
        p.active = true;
        p.hit = false;
        p.scale = 1.3;
      }
    });
    this.addPopup(this.width / 2, this.height / 2, `BOARD REFRESHED! (${this.refreshesThisDrop}/2)`, '#22c55e', 22);
    this.audio.playRefresh();
  }

  spawnOrb(archetype = 'standard', relicModifiers = {}) {
    this.refreshesThisDrop = 0; // Reset refresh counter for new drop
    const speed = archetype.speed || 550;
    const vx = Math.cos(this.aimAngle) * speed;
    const vy = Math.sin(this.aimAngle) * speed;

    const orb = {
      x: this.launcherPos.x,
      y: this.launcherPos.y,
      vx: vx,
      vy: vy,
      radius: archetype.radius || 10,
      mass: archetype.mass || 1.0,
      bounciness: (archetype.bounciness || this.restitution) * (relicModifiers.rubberCoat ? 1.25 : 1.0),
      archetype: archetype,
      trail: [],
      pierceRemaining: archetype.pierce || 0,
      active: true,
      lifetime: 0
    };

    this.orbs.push(orb);
    this.isAiming = false;
    this.audio.resetCombo();
  }

  spawnSplitOrb(x, y, archetype = 'standard', relicModifiers = {}) {
    if (this.orbs.length >= this.maxSimultaneousOrbs) return;

    const angle = (Math.random() - 0.5) * Math.PI * 0.7 - Math.PI / 2;
    const speed = 260 + Math.random() * 120;

    const orb = {
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 7.5,
      mass: 0.8,
      bounciness: (archetype.bounciness || this.restitution) * (relicModifiers.rubberCoat ? 1.2 : 0.95),
      archetype: archetype,
      trail: [],
      pierceRemaining: 0,
      active: true,
      lifetime: 0
    };

    this.orbs.push(orb);
  }

  setAim(targetX, targetY) {
    const dx = targetX - this.launcherPos.x;
    const dy = targetY - this.launcherPos.y;
    // Limit angle downward
    const angle = Math.atan2(dy, dx);
    this.aimAngle = Math.max(0.2, Math.min(Math.PI - 0.2, angle));
  }

  addPopup(x, y, text, color = '#ffd700', size = 16) {
    // Keep max 10 popups active at once to avoid screen flooding
    if (this.popups.length > 10) {
      this.popups.shift();
    }
    this.popups.push({
      x: x,
      y: y,
      text: text,
      color: color,
      size: size,
      alpha: 1.0,
      life: 0,
      maxLife: 0.65
    });
  }

  createSparks(x, y, color = '#ffd700', count = 8) {
    if (this.particles.length > 45) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 120;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        radius: 1.5 + Math.random() * 2,
        color: color,
        alpha: 1.0,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.15
      });
    }
  }

  triggerBombBlast(bombX, bombY, relicModifiers) {
    this.screenShake = 12;
    this.audio.playBombBlast();

    const blastRadius = 75;
    this.addPopup(bombX, bombY, 'BOOM!', '#f43f5e', 22);

    // Shockwave ring particle
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      this.particles.push({
        x: bombX,
        y: bombY,
        vx: Math.cos(angle) * 160,
        vy: Math.sin(angle) * 160,
        radius: 3,
        color: '#f43f5e',
        alpha: 1.0,
        life: 0,
        maxLife: 0.5
      });
    }

    // Clear neighboring pegs in blast
    let clearedCount = 0;
    this.pegs.forEach((p) => {
      if (p.active) {
        const dx = p.x - bombX;
        const dy = p.y - bombY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= blastRadius) {
          p.active = false;
          clearedCount++;
          this.createSparks(p.x, p.y, '#f43f5e', 6);
        }
      }
    });

    return clearedCount;
  }

  update(dt, onPegHit, onBucketEnter, relicModifiers = {}) {
    const dtSub = dt / 2; // 2 sub-steps for smooth physics

    for (let step = 0; step < 2; step++) {
      // 1. Update Orbs
      for (let o = this.orbs.length - 1; o >= 0; o--) {
        const orb = this.orbs[o];

        // Apply gravity with anti-trap nudge
        orb.lifetime = (orb.lifetime || 0) + dtSub;
        let effGravity = this.gravity;
        if (orb.lifetime > 8) {
          effGravity += 350; // extra pull down to prevent perpetual horizontal loops
        }
        if (orb.lifetime > 14) {
          effGravity += 700;
          orb.vy = Math.max(orb.vy, 360); // guarantee descent to bucket
        }
        orb.vy += effGravity * dtSub;

        orb.x += orb.vx * dtSub;
        orb.y += orb.vy * dtSub;

        // Trail
        if (step === 0) {
          orb.trail.push({ x: orb.x, y: orb.y, alpha: 0.7 });
          if (orb.trail.length > 10) orb.trail.shift();
        }

        // Left & Right Wall Collisions
        if (orb.x - orb.radius < 12) {
          orb.x = 12 + orb.radius;
          orb.vx = -orb.vx * orb.bounciness;
          this.createSparks(orb.x, orb.y, '#94a3b8', 4);
        } else if (orb.x + orb.radius > this.width - 12) {
          orb.x = this.width - 12 - orb.radius;
          orb.vx = -orb.vx * orb.bounciness;
          this.createSparks(orb.x, orb.y, '#94a3b8', 4);
        }

        // Peg Collisions
        for (let p = 0; p < this.pegs.length; p++) {
          const peg = this.pegs[p];
          if (!peg.active) continue;

          const dx = orb.x - peg.x;
          const dy = orb.y - peg.y;
          const distSq = dx * dx + dy * dy;
          const minDist = orb.radius + peg.radius;

          if (distSq < minDist * minDist) {
            const dist = Math.sqrt(distSq) || 0.001;
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate
            orb.x = peg.x + nx * minDist;
            orb.y = peg.y + ny * minDist;

            // Reflect velocity along normal
            const dot = orb.vx * nx + orb.vy * ny;
            if (dot < 0) {
              const impulse = -(1 + orb.bounciness) * dot;
              orb.vx += nx * impulse;
              orb.vy += ny * impulse;
            }

            // Peg reaction
            peg.scale = 1.45;
            peg.lightPulse = 1.0;

            // Audio & Event
            this.audio.playPegHit(peg.type);
            this.createSparks(peg.x, peg.y, this.getPegColor(peg.type), 8);

            // Handle Peg Types
            if (peg.type === 'bomb') {
              peg.active = false;
              const cleared = this.triggerBombBlast(peg.x, peg.y, relicModifiers);
              onPegHit(peg, cleared);
            } else if (peg.type === 'refresh') {
              peg.active = false;
              this.refreshAllPegs();
              onPegHit(peg, 0);
            } else {
              peg.active = false;
              onPegHit(peg, 0);
            }

            this.screenShake = Math.max(this.screenShake, 3);
          }
        }

        // Bottom Buckets Collision Check
        const bucketY = this.height - 55;
        if (orb.y + orb.radius >= bucketY) {
          // Identify bucket slot
          const bucketW = this.width / this.buckets.length;
          const bIdx = Math.max(0, Math.min(this.buckets.length - 1, Math.floor(orb.x / bucketW)));
          const bucket = this.buckets[bIdx];

          this.audio.playBucketEnter(bucket.mult);
          this.addPopup(orb.x, bucketY - 20, `${bucket.label}!`, bucket.color, 24);
          this.createSparks(orb.x, bucketY, bucket.color, 16);

          onBucketEnter(bucket.mult);
          this.orbs.splice(o, 1);

          if (this.orbs.length === 0) {
            this.isAiming = true;
          }
        }
      }
    }

    // 2. Update Peg Scales & Pulses
    this.pegs.forEach((p) => {
      p.scale += (1.0 - p.scale) * Math.min(1, dt * 10);
      p.lightPulse = Math.max(0, p.lightPulse - dt * 4);
    });

    // 3. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life += dt;
      if (pt.life >= pt.maxLife) {
        this.particles.splice(i, 1);
      } else {
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy += 200 * dt;
        pt.alpha = 1 - pt.life / pt.maxLife;
      }
    }

    // 4. Update Popups
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const pop = this.popups[i];
      pop.life += dt;
      if (pop.life >= pop.maxLife) {
        this.popups.splice(i, 1);
      } else {
        pop.y -= 35 * dt;
        pop.alpha = 1 - pop.life / pop.maxLife;
      }
    }

    // 5. Update Screen Shake
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }
  }

  getPegColor(type) {
    if (type === 'crit') return '#38bdf8';
    if (type === 'bomb') return '#f43f5e';
    if (type === 'refresh') return '#22c55e';
    return '#d4af37';
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();
    // Screen Shake transform
    if (this.screenShake > 0) {
      const ox = (Math.random() - 0.5) * this.screenShake;
      const oy = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(ox, oy);
    }

    // 1. Draw Board Background Felt & Wooden Trim
    ctx.fillStyle = '#0a1610';
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle felt texture grid
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }

    // 2. Draw Multiplier Catch Buckets at Bottom
    const bucketW = this.width / this.buckets.length;
    const bucketY = this.height - 50;

    this.buckets.forEach((b, i) => {
      const bx = i * bucketW;
      // Bucket body
      ctx.fillStyle = '#111827';
      ctx.fillRect(bx + 4, bucketY, bucketW - 8, 45);

      // Bucket border with glow
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + 4, bucketY, bucketW - 8, 45);

      // Label
      ctx.fillStyle = b.color;
      ctx.font = 'bold 16px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.label, bx + bucketW / 2, bucketY + 22);
    });

    // 3. Draw Pegs
    this.pegs.forEach((peg) => {
      if (!peg.active) return;

      const r = peg.radius * peg.scale;
      const color = this.getPegColor(peg.type);

      // Glow halo on light pulse
      if (peg.lightPulse > 0) {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = peg.lightPulse * 0.4;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // Main Peg Body
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Metallic highlight
      ctx.beginPath();
      ctx.arc(peg.x - r * 0.3, peg.y - r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // 4. Draw Aiming Line (if aiming)
    if (this.isAiming && this.orbs.length === 0) {
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
      ctx.lineWidth = 2;

      // Draw trajectory curve
      ctx.beginPath();
      let simX = this.launcherPos.x;
      let simY = this.launcherPos.y;
      let simVx = Math.cos(this.aimAngle) * 550;
      let simVy = Math.sin(this.aimAngle) * 550;
      const simDt = 0.02;

      ctx.moveTo(simX, simY);
      for (let t = 0; t < 25; t++) {
        simVy += this.gravity * simDt;
        simX += simVx * simDt;
        simY += simVy * simDt;
        if (simX < 12 || simX > this.width - 12 || simY > this.height) break;
        ctx.lineTo(simX, simY);
      }
      ctx.stroke();
      ctx.restore();

      // Launcher Cannon Mount
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(this.launcherPos.x, this.launcherPos.y, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Draw Active Orbs & Motion Trails
    this.orbs.forEach((orb) => {
      // Trail
      for (let i = 0; i < orb.trail.length; i++) {
        const pt = orb.trail[i];
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, (orb.radius * 0.6) * (i / orb.trail.length), 0, Math.PI * 2);
        ctx.fillStyle = orb.archetype.trailColor || '#ffd700';
        ctx.globalAlpha = (i / orb.trail.length) * 0.35;
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Orb Body
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fillStyle = orb.archetype.color || '#ffffff';
      ctx.fill();

      // Glow highlight
      ctx.beginPath();
      ctx.arc(orb.x - orb.radius * 0.35, orb.y - orb.radius * 0.35, orb.radius * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });

    // 6. Draw Particles
    this.particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // 7. Draw Floating Popups
    this.popups.forEach((pop) => {
      ctx.font = `bold ${pop.size}px Outfit, sans-serif`;
      ctx.fillStyle = pop.color;
      ctx.globalAlpha = pop.alpha;
      ctx.textAlign = 'center';
      ctx.fillText(pop.text, pop.x, pop.y);
    });
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }
}

window.PhysicsBoard = PhysicsBoard;
