// Web Audio API Synthesizer for Retro Dan Sai Adventure Soundscapes
class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicInterval: any = null;
  private isMuted: boolean = false;
  private isSfxMuted: boolean = false;
  private currentTempo: number = 135; // Lively tempo for Phi Ta Khon dance

  constructor() {
    // Lazy initialisation on first interaction to respect browser auto-play policies
  }

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMusic(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
  }

  public toggleSfx(muted: boolean) {
    this.isSfxMuted = muted;
  }

  public playJump() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playAttack() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

    // Apply highpass filter for swish effect
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(120, this.ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public playCollect() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Traditional pentatonic arpeggio note (e.g. A5 -> E6)
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1318, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  public playHit() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Noise burst for explosion/hit
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + 0.15);
  }

  public playMenuClick() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.setValueAtTime(554, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  public playGameOver() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopMusic();

    const now = this.ctx.currentTime;
    const notes = [330, 294, 262, 196]; // Decending sad melody E -> D -> C -> G
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.15, now + idx * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.2 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.2);
      osc.stop(now + idx * 0.2 + 0.25);
    });
  }

  public playVictory() {
    if (this.isSfxMuted) return;
    this.initContext();
    if (!this.ctx) return;

    this.stopMusic();

    const now = this.ctx.currentTime;
    const notes = [523, 587, 659, 784, 880, 1047]; // Happy ascending pentatonic melody C -> D -> E -> G -> A -> C
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.15, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.2);
    });
  }

  public startMusic() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.musicInterval) {
      clearInterval(this.musicInterval);
    }

    let beat = 0;
    // Lively Isan Pentatonic scale notes (Am / C major: A, C, D, E, G)
    const melody = [
      440, 440, 523, 587, 659, 587, 523, 440, // Phase 1
      440, 587, 659, 784, 880, 784, 659, 587, // Phase 2
      659, 659, 587, 523, 440, 392, 440, 440, // Phase 3
      523, 587, 659, 880, 784, 659, 523, 440  // Phase 4
    ];

    const bassLine = [
      110, 110, 130, 110, 146, 146, 130, 110,
      110, 110, 130, 110, 146, 146, 164, 146
    ];

    const stepDuration = 60 / this.currentTempo / 2; // Eighth notes

    const playStep = () => {
      if (this.isMuted || !this.ctx) return;

      const now = this.ctx.currentTime;

      // 1. Kick/Drum Beat (Simulated Esarn Long Drum "Klong")
      if (beat % 4 === 0 || beat % 8 === 3 || beat % 8 === 6) {
        const drumOsc = this.ctx.createOscillator();
        const drumGain = this.ctx.createGain();
        drumOsc.type = 'sine';
        drumOsc.frequency.setValueAtTime(100, now);
        drumOsc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

        drumGain.gain.setValueAtTime(0.2, now);
        drumGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        drumOsc.connect(drumGain);
        drumGain.connect(this.ctx.destination);
        drumOsc.start(now);
        drumOsc.stop(now + 0.15);
      }

      // 2. Phin Melody (Lead Pluck)
      // Play note on specific steps for a catchy syncopated rhythm
      const rhythmPattern = [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0];
      if (rhythmPattern[beat % 16] === 1) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();

        // Plucky folk lute tone (Triangle + slight sawtooth mix / filtered sawtooth)
        leadOsc.type = 'triangle';
        const noteFreq = melody[beat % melody.length];
        leadOsc.frequency.setValueAtTime(noteFreq, now);

        // Add a fast vibrato/plucking slide common in Phin playing
        leadOsc.frequency.linearRampToValueAtTime(noteFreq * 1.02, now + 0.03);
        leadOsc.frequency.linearRampToValueAtTime(noteFreq, now + 0.08);

        leadGain.gain.setValueAtTime(0.08, now);
        leadGain.gain.exponentialRampToValueAtTime(0.005, now + 0.2);

        leadOsc.connect(leadGain);
        leadGain.connect(this.ctx.destination);

        leadOsc.start(now);
        leadOsc.stop(now + 0.22);
      }

      // 3. Bass line
      if (beat % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassLine[(beat / 2) % bassLine.length], now);

        bassGain.gain.setValueAtTime(0.1, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);

        bassOsc.start(now);
        bassOsc.stop(now + 0.3);
      }

      beat++;
    };

    // Trigger immediately
    playStep();
    this.musicInterval = setInterval(playStep, stepDuration * 1000);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

// Global single instance export
export const audio = new AudioEngine();
