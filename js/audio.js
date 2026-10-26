/**
 * PegRogue // Procedural Web Audio Engine & Ascending Chime Generator
 * Delivers crisp tactile dopamine feedback for every bounce.
 */

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;

    // Pentatonic Scale (C Major Pentatonic across 4 octaves)
    // C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6, D6, E6, G6, A6, C7
    this.scale = [
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99, 880.00,
      1046.50, 1174.66, 1318.51, 1567.98, 1760.00,
      2093.00
    ];

    this.consecutiveHits = 0;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  resetCombo() {
    this.consecutiveHits = 0;
  }

  playPegHit(pegType = 'standard') {
    if (!this.ctx || this.isMuted) return;

    // Increment combo pitch
    const noteIdx = Math.min(this.consecutiveHits, this.scale.length - 1);
    const freq = this.scale[noteIdx];
    this.consecutiveHits++;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Sound timbre by peg type
    if (pegType === 'crit') {
      osc.type = 'triangle';
      // Harmonic octave overtone
      this.playHarmonic(freq * 2, now, 0.08);
    } else {
      osc.type = 'sine';
    }

    osc.frequency.setValueAtTime(freq, now);

    // Envelope: sharp pluck attack + natural bell decay
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.38);
  }

  playHarmonic(freq, time, vol) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.28);
  }

  playBombBlast() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.45);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.52);
  }

  playRefresh() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Ascending 3-tone chime (G5 -> C6 -> E6)
    [783.99, 1046.50, 1318.51].forEach((freq, i) => {
      const t = now + i * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.28);
    });
  }

  playBucketEnter(multiplier) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Resonant woody thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(110 + multiplier * 20, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.3);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  playCoin() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    // Pleasant 2-tone cash clink
    [1318.51, 1975.53].forEach((f, idx) => {
      const t = now + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  toggleMute() {
    if (!this.ctx) return false;
    this.isMuted = !this.isMuted;
    this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    return !this.isMuted;
  }
}

window.AudioSystem = AudioSystem;
