// Web Audio API ambient background music synthesizer for ads and podcasts

class AmbientMixer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentStyle = 'upbeat';
  private gainNode: GainNode | null = null;
  private timerId: any = null;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.15; // standard ambient background volume
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(val, this.ctx.currentTime, 0.1);
    }
  }

  public play(style = 'upbeat') {
    this.init();
    this.stop(); // Clear prior interval
    this.isPlaying = true;
    this.currentStyle = style;

    if (!this.ctx || !this.gainNode) return;

    if (style === 'upbeat') {
      this.startUpbeatBeat();
    } else if (style === 'podcast_chill') {
      this.startPodcastAmbient();
    } else if (style === 'cinematic') {
      this.startCinematicPad();
    } else {
      this.startCorporateSynth();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private startUpbeatBeat() {
    if (!this.ctx || !this.gainNode) return;
    let step = 0;
    const tempoMs = 250; // 120 BPM 16th notes

    this.timerId = setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.gainNode) return;
      const t = this.ctx.currentTime;

      // Kick drum on 0, 4, 8, 12
      if (step % 4 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.15);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + 0.15);
      }

      // Hi-hat on every step
      if (step % 2 === 1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(8000, t);
        gain.gain.setValueAtTime(0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + 0.05);
      }

      // Marimba/Chime note
      const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
      if (step % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const note = notes[(step / 2) % notes.length];
        osc.frequency.setValueAtTime(note, t);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start(t);
        osc.stop(t + 0.3);
      }

      step = (step + 1) % 16;
    }, tempoMs);
  }

  private startPodcastAmbient() {
    if (!this.ctx || !this.gainNode) return;
    const chord = [130.81, 196.0, 246.94, 329.63]; // C3, G3, B3, E4 (Cmaj7 sound)

    const oscs = chord.map((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
      gain.gain.setValueAtTime(0.03, this.ctx!.currentTime);
      osc.connect(gain);
      gain.connect(this.gainNode!);
      osc.start();
      return { osc, gain };
    });

    this.timerId = setInterval(() => {
      // Gentle pitch swell
      if (!this.ctx) return;
      oscs.forEach(({ osc }, i) => {
        osc.frequency.setTargetAtTime(chord[i] + (Math.random() * 2 - 1), this.ctx!.currentTime, 1);
      });
    }, 2000);
  }

  private startCinematicPad() {
    if (!this.ctx || !this.gainNode) return;
    const freqs = [65.41, 98.0, 130.81]; // C2, G2, C3
    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
      gain.gain.setValueAtTime(0.02, this.ctx!.currentTime);
      osc.connect(gain);
      gain.connect(this.gainNode!);
      osc.start();
    });
  }

  private startCorporateSynth() {
    if (!this.ctx || !this.gainNode) return;
    let step = 0;
    const arpeggio = [261.63, 329.63, 392.00, 493.88, 523.25];
    this.timerId = setInterval(() => {
      if (!this.isPlaying || !this.ctx || !this.gainNode) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(arpeggio[step % arpeggio.length], t);
      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.gainNode);
      osc.start(t);
      osc.stop(t + 0.2);
      step++;
    }, 200);
  }
}

export const ambientMixer = typeof window !== 'undefined' ? new AmbientMixer() : null;
