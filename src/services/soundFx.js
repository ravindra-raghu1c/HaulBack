/**
 * Web Audio API synthesizer for UI sound feedback
 * Zero external audio files required
 */

class SoundFx {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted before user interaction
    }
  }

  bidPlaced() {
    this.playTone(520, 'sine', 0.1, 0.08);
    setTimeout(() => this.playTone(780, 'sine', 0.2, 0.08), 80);
  }

  bidAccepted() {
    this.playTone(440, 'triangle', 0.12, 0.1);
    setTimeout(() => this.playTone(554.37, 'triangle', 0.12, 0.1), 100);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.25, 0.12), 200);
  }

  radarPing() {
    this.playTone(880, 'sine', 0.08, 0.04);
  }

  engineIgnite() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      // Low engine hum ramp
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(45, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.35);
      osc.frequency.exponentialRampToValueAtTime(75, this.ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
    } catch {
      // Audio fallback
    }
  }

  alertNotification() {
    this.playTone(600, 'sine', 0.12, 0.07);
    setTimeout(() => this.playTone(900, 'sine', 0.18, 0.07), 120);
  }
}

export const soundFx = new SoundFx();
export default soundFx;
