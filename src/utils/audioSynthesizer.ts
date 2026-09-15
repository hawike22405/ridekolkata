// Web Audio API generator for ambient Kolkata street soundscape
class AmbientSoundscape {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private gainNode: GainNode | null = null;
  private intervalId: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play() {
    this.initContext();
    if (!this.ctx || this.isPlaying) return;
    this.isPlaying = true;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.18, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    // Warm atmospheric drone (binaural Ghat waves frequency)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(165, this.ctx.currentTime); // E3

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(450, this.ctx.currentTime);

    osc1.connect(droneFilter);
    osc2.connect(droneFilter);
    droneFilter.connect(this.gainNode);

    osc1.start();
    osc2.start();

    // Periodic Kolkata Tram Bell "Ting-Ting" synthesis
    const playTramBell = () => {
      if (!this.ctx || !this.gainNode || !this.isPlaying) return;
      const now = this.ctx.currentTime;
      [0, 0.14].forEach((delay) => {
        if (!this.ctx || !this.gainNode) return;
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(1760, now + delay); // A6 bright brass bell
        bellGain.gain.setValueAtTime(0, now + delay);
        bellGain.gain.linearRampToValueAtTime(0.2, now + delay + 0.01);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);

        bellOsc.connect(bellGain);
        bellGain.connect(this.gainNode);
        bellOsc.start(now + delay);
        bellOsc.stop(now + delay + 0.5);
      });
    };

    // Trigger tram bell every 6-9 seconds
    this.intervalId = window.setInterval(playTramBell, 7000);
    playTramBell();
  }

  public stop() {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      setTimeout(() => {
        this.isPlaying = false;
        if (this.intervalId) clearInterval(this.intervalId);
      }, 500);
    } else {
      this.isPlaying = false;
      if (this.intervalId) clearInterval(this.intervalId);
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const ambientSound = new AmbientSoundscape();
