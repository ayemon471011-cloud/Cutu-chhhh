/**
 * Audio Synthesizer using Web Audio API
 * No external sound files required - works 100% offline, reliable, zero latency.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: number | null = null;
  private musicStep: number = 0;

  constructor() {
    // Check saved mute preference
    const savedMute = localStorage.getItem('cutu_game_muted');
    if (savedMute !== null) {
      this.isMuted = savedMute === 'true';
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = this.isMuted ? 0 : 0.15;
      this.bgmGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.isMuted ? 0 : 0.28;
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('cutu_game_muted', String(this.isMuted));
    if (this.bgmGain && this.sfxGain) {
      this.bgmGain.gain.value = this.isMuted ? 0 : 0.15;
      this.sfxGain.gain.value = this.isMuted ? 0 : 0.28;
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('cutu_game_muted', String(this.isMuted));
    if (this.bgmGain && this.sfxGain) {
      this.bgmGain.gain.value = this.isMuted ? 0 : 0.15;
      this.sfxGain.gain.value = this.isMuted ? 0 : 0.28;
    }
  }

  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(680, t + 0.16);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playLand() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.08);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playSlide() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    // Soft gentle cartoon whoosh
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.22);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Bonk sound
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(320, t);
    osc1.frequency.exponentialRampToValueAtTime(120, t + 0.15);
    gain1.gain.setValueAtTime(0.25, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);

    osc1.start(t);
    osc1.stop(t + 0.18);

    // Cute dizzy star chime
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(600, t + 0.05);
    osc2.frequency.exponentialRampToValueAtTime(900, t + 0.2);
    gain2.gain.setValueAtTime(0.2, t + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);

    osc2.start(t + 0.05);
    osc2.stop(t + 0.25);
  }

  public playScoreDodge() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.06);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playButtPat() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Crisp cartoon pat / slap impact sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.07);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);

    // Cute squeaky pop overtone
    const pop = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    pop.type = 'sine';
    pop.frequency.setValueAtTime(680, t);
    pop.frequency.exponentialRampToValueAtTime(950, t + 0.04);
    pop.frequency.exponentialRampToValueAtTime(320, t + 0.08);

    popGain.gain.setValueAtTime(0.2, t);
    popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    pop.connect(popGain);
    popGain.connect(this.sfxGain);

    pop.start(t);
    pop.stop(t + 0.08);
  }

  public playKissSmooch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    // Cute pop/smooch "mwah!"
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.18);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);

    // Heart sparkle chime
    const sparkle = this.ctx.createOscillator();
    const sGain = this.ctx.createGain();
    sparkle.type = 'triangle';
    sparkle.frequency.setValueAtTime(1320, t + 0.05);
    sparkle.frequency.exponentialRampToValueAtTime(1760, t + 0.2);

    sGain.gain.setValueAtTime(0.2, t + 0.05);
    sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    sparkle.connect(sGain);
    sGain.connect(this.sfxGain);

    sparkle.start(t + 0.05);
    sparkle.stop(t + 0.25);
  }

  public playCaughtAlert() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.12);
    });
  }

  public playButton() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, t); // D5
    osc.frequency.setValueAtTime(880, t + 0.05); // A5

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public startBGM() {
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.initCtx();

    // Cute cheerful pastel melody loop: C - G - Am - F progression (notes in Hz)
    const melody = [
      523.25, 659.25, 783.99, 659.25, // C5, E5, G5, E5
      587.33, 698.46, 880.00, 698.46, // D5, F5, A5, F5
      659.25, 783.99, 987.77, 783.99, // E5, G5, B5, G5
      523.25, 783.99, 1046.50, 783.99 // C5, G5, C6, G5
    ];

    const bass = [261.63, 293.66, 329.63, 349.23]; // C4, D4, E4, F4

    this.musicStep = 0;
    const stepDuration = 240; // ms

    this.bgmIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.bgmGain || this.isMuted || !this.isBgmPlaying) return;

      const t = this.ctx.currentTime;
      const noteFreq = melody[this.musicStep % melody.length];

      // Soft music box bell oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, t);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(t);
      osc.stop(t + 0.22);

      // Warm subtle bass on every 4 steps
      if (this.musicStep % 4 === 0) {
        const bassFreq = bass[Math.floor(this.musicStep / 4) % bass.length];
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, t);

        bassGain.gain.setValueAtTime(0.12, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        bassOsc.connect(bassGain);
        bassGain.connect(this.bgmGain);

        bassOsc.start(t);
        bassOsc.stop(t + 0.4);
      }

      this.musicStep++;
    }, stepDuration);
  }

  public stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }
}

export const soundManager = new SoundManager();
