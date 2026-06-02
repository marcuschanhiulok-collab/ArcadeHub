export type SoundType = 'jump' | 'explosion' | 'coin' | 'shoot' | 'hit' | 'blip' | 'gameover' | 'simon0' | 'simon1' | 'simon2' | 'simon3';

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  play(type: SoundType) {
    if (this.isMuted) return;
    
    try {
      const ctx = this.getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const t = ctx.currentTime;

      switch (type) {
        case 'jump':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, t);
          osc.frequency.exponentialRampToValueAtTime(600, t + 0.1);
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.2);
          osc.start(t);
          osc.stop(t + 0.2);
          break;
        case 'shoot':
          osc.type = 'square';
          osc.frequency.setValueAtTime(800, t);
          osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
          gain.gain.setValueAtTime(0.02, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.15);
          osc.start(t);
          osc.stop(t + 0.15);
          break;
        case 'explosion':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(100, t);
          osc.frequency.exponentialRampToValueAtTime(10, t + 0.3);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.3);
          break;
        case 'coin':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000, t);
          osc.frequency.setValueAtTime(1500, t + 0.1);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.3);
          osc.start(t);
          osc.stop(t + 0.3);
          break;
        case 'hit':
          osc.type = 'square';
          osc.frequency.setValueAtTime(150, t);
          osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
          gain.gain.setValueAtTime(0.03, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.1);
          osc.start(t);
          osc.stop(t + 0.1);
          break;
        case 'blip':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, t);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.05);
          osc.start(t);
          osc.stop(t + 0.05);
          break;
        case 'gameover':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, t);
          osc.frequency.linearRampToValueAtTime(100, t + 0.5);
          gain.gain.setValueAtTime(0.05, t);
          gain.gain.linearRampToValueAtTime(0.001, t + 0.5);
          osc.start(t);
          osc.stop(t + 0.5);
          break;
        case 'simon0': // Green
          osc.type = 'sine';
          osc.frequency.setValueAtTime(415.3, t); // G#4
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.5);
          osc.start(t);
          osc.stop(t + 0.5);
          break;
        case 'simon1': // Red
          osc.type = 'sine';
          osc.frequency.setValueAtTime(311.13, t); // D#4
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.5);
          osc.start(t);
          osc.stop(t + 0.5);
          break;
        case 'simon2': // Yellow
          osc.type = 'sine';
          osc.frequency.setValueAtTime(254, t); // Approx C4
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.5);
          osc.start(t);
          osc.stop(t + 0.5);
          break;
        case 'simon3': // Blue
          osc.type = 'sine';
          osc.frequency.setValueAtTime(207.65, t); // G#3
          gain.gain.setValueAtTime(0.1, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.5);
          osc.start(t);
          osc.stop(t + 0.5);
          break;
      }
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }
}

export const soundManager = new SoundManager();
