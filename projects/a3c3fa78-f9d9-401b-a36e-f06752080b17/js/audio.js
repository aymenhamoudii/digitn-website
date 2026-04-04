/**
 * Audio Engine
 * Manages sound effects using the Web Audio API
 */

class AudioEngine {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = {
      start: { frequency: 440, type: 'sine', duration: 0.2 },
      crash: { frequency: 100, type: 'sawtooth', duration: 0.5 },
      upgrade: { frequency: 880, type: 'triangle', duration: 0.1 }
    };
    
    // Resume audio context on first interaction
    window.addEventListener('mousedown', () => this.resume());
    window.addEventListener('keydown', () => this.resume());
  }

  resume() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(name) {
    if (this.ctx.state !== 'running') return;
    
    const sound = this.sounds[name];
    if (!sound) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = sound.type;
    osc.frequency.setValueAtTime(sound.frequency, this.ctx.currentTime);
    
    // Frequency slide for crash
    if (name === 'crash') {
      osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + sound.duration);
    }
    
    // Frequency slide for start
    if (name === 'start') {
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + sound.duration);
    }

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + sound.duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + sound.duration);
  }
}

// Global audio instance
const audio = new AudioEngine();
