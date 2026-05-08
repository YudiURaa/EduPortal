// ===== AUDIO.JS - Web Audio API Sound Engine =====

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initialized = false;
    this.volume = 1.0; // Base volume multiplier
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Boost volume for projector/classroom mode
  setVolume(v) {
    this.volume = Math.max(0, Math.min(3, v));
  }

  getVolume() {
    // Auto-boost in projector mode
    if (typeof EduProjector !== 'undefined' && EduProjector.isActive()) {
      return this.volume * 2.0;
    }
    return this.volume;
  }

  play(type) {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;

    switch (type) {
      case 'roll':
        this._playRoll(now);
        break;
      case 'land':
        this._playLand(now);
        break;
      case 'move':
        this._playMove(now);
        break;
      case 'correct':
        this._playCorrect(now);
        break;
      case 'wrong':
        this._playWrong(now);
        break;
      case 'snake':
        this._playSnake(now);
        break;
      case 'ladder':
        this._playLadder(now);
        break;
      case 'powerup':
        this._playPowerup(now);
        break;
      case 'win':
        this._playWin(now);
        break;
      case 'tick':
        this._playTick(now);
        break;
      case 'combo':
        this._playCombo(now);
        break;
      case 'click':
        this._playClick(now);
        break;
    }
  }

  _createOsc(type, freq, now) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    return { osc, gain };
  }

  // Dice rolling - white noise burst
  _playRoll(now) {
    const bufferSize = this.ctx.sampleRate * 0.8;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.8);
    filter.Q.setValueAtTime(2, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.8);
  }

  // Dice landing - thud
  _playLand(now) {
    const { osc, gain } = this._createOsc('sine', 150, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);

    // Impact noise
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const g2 = this.ctx.createGain();
    g2.gain.setValueAtTime(0.1, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    noise.connect(g2);
    g2.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.05);
  }

  // Piece move - blip
  _playMove(now) {
    const { osc, gain } = this._createOsc('sine', 300, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.06);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Correct answer - major chord arpeggio
  _playCorrect(now) {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const { osc, gain } = this._createOsc('sine', freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.1, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.3);
    });
  }

  // Wrong answer - dissonant
  _playWrong(now) {
    const { osc, gain } = this._createOsc('sawtooth', 200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.3);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.start(now);
    osc.stop(now + 0.35);

    const { osc: osc2, gain: gain2 } = this._createOsc('square', 150, now + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(60, now + 0.3);
    gain2.gain.setValueAtTime(0.04, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.3);
  }

  // Snake bite - slide down
  _playSnake(now) {
    const { osc, gain } = this._createOsc('sine', 800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.6);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.start(now);
    osc.stop(now + 0.6);

    // Hiss
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3 * Math.exp(-i / (bufferSize * 0.5));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4000, now);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.04, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    noise.connect(filter);
    filter.connect(g);
    g.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.4);
  }

  // Ladder climb - slide up
  _playLadder(now) {
    const { osc, gain } = this._createOsc('sine', 200, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc.start(now);
    osc.stop(now + 0.55);

    const { osc: osc2, gain: gain2 } = this._createOsc('triangle', 300, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.5);
    gain2.gain.setValueAtTime(0.05, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  }

  // Powerup get - sparkle
  _playPowerup(now) {
    const notes = [600, 900, 1200, 1500];
    notes.forEach((freq, i) => {
      const { osc, gain } = this._createOsc('triangle', freq, now + i * 0.06);
      gain.gain.setValueAtTime(0.08, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.2);
    });
  }

  // Win - fanfare
  _playWin(now) {
    const melody = [523, 659, 784, 1047, 784, 1047];
    const durations = [0.15, 0.15, 0.15, 0.3, 0.15, 0.4];
    let t = now;
    melody.forEach((freq, i) => {
      const { osc, gain } = this._createOsc('sine', freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + durations[i]);
      osc.start(t);
      osc.stop(t + durations[i]);

      // Harmony
      const { osc: osc2, gain: gain2 } = this._createOsc('triangle', freq * 1.25, t);
      gain2.gain.setValueAtTime(0.06, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + durations[i]);
      osc2.start(t);
      osc2.stop(t + durations[i]);

      t += durations[i];
    });
  }

  // Timer tick
  _playTick(now) {
    const { osc, gain } = this._createOsc('sine', 800, now);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Combo streak
  _playCombo(now) {
    const { osc, gain } = this._createOsc('triangle', 600, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.25);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // UI click
  _playClick(now) {
    const { osc, gain } = this._createOsc('sine', 600, now);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    osc.start(now);
    osc.stop(now + 0.03);
  }
}

// Global instance
const audio = new AudioEngine();
