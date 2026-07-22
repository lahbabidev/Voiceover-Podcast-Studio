'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Music, Volume2, VolumeX, Play, Pause, Sparkles } from 'lucide-react';

interface MusicTrack {
  id: string;
  nameAr: string;
  genre: string;
  bpm: number;
  type: 'upbeat' | 'lofi' | 'cinematic' | 'acoustic';
}

const TRACKS: MusicTrack[] = [
  { id: 'upbeat', nameAr: 'إيقاع إعلاني حماسي (Upbeat Commercial Beat)', genre: 'Commercial Ad', bpm: 120, type: 'upbeat' },
  { id: 'lofi', nameAr: 'موسيقى بودكاست هادئة (Lofi Chill Beat)', genre: 'Podcast / Relax', bpm: 85, type: 'lofi' },
  { id: 'cinematic', nameAr: 'أجواء سينمائية درامية (Cinematic Ambient)', genre: 'Dramatic Promo', bpm: 70, type: 'cinematic' },
  { id: 'acoustic', nameAr: 'أنغام جيتار دافئة (Acoustic Folk)', genre: 'Warm Storytelling', bpm: 95, type: 'acoustic' },
];

export function BackgroundMusicMixer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MusicTrack>(TRACKS[0]);
  const [volume, setVolume] = useState(0.25);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<any>(null);

  const stopAudio = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const playSynthesizedLoop = () => {
    stopAudio();

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);

    let step = 0;
    const intervalTime = (60 / selectedTrack.bpm / 2) * 1000; // eighth notes

    // Musical Chords frequencies (in Hz)
    const chordsMap: Record<string, number[][]> = {
      upbeat: [
        [261.63, 329.63, 392.00], // C
        [293.66, 349.23, 440.00], // Dm
        [349.23, 440.00, 523.25], // F
        [196.00, 246.94, 293.66], // G
      ],
      lofi: [
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [130.81, 164.81, 196.00, 246.94], // Cmaj7
        [164.81, 196.00, 246.94, 293.66], // Em7
      ],
      cinematic: [
        [110.00, 164.81, 220.00], // Low A pad
        [130.81, 196.00, 261.63], // Low C pad
        [87.31, 130.81, 174.61],  // Low F pad
        [98.00, 146.83, 196.00],  // Low G pad
      ],
      acoustic: [
        [196.00, 246.94, 293.66], // G
        [164.81, 196.00, 246.94], // Em
        [130.81, 164.81, 196.00], // C
        [146.83, 220.00, 293.66], // D
      ],
    };

    const currentChords = chordsMap[selectedTrack.type] || chordsMap.upbeat;

    intervalRef.current = setInterval(() => {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;

      const now = ctx.currentTime;
      const chordIndex = Math.floor(step / 8) % currentChords.length;
      const chord = currentChords[chordIndex];

      // Soft synth tone
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = selectedTrack.type === 'lofi' ? 'sine' : selectedTrack.type === 'cinematic' ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Envelope
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (intervalTime / 1000) * 1.8);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + (intervalTime / 1000) * 2);
      });

      // Subtle Kick/Percussion beat
      if (step % 4 === 0 && (selectedTrack.type === 'upbeat' || selectedTrack.type === 'lofi')) {
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.frequency.setValueAtTime(120, now);
        kickOsc.frequency.exponentialRampToValueAtTime(30, now + 0.1);

        kickGain.gain.setValueAtTime(0.2, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        kickOsc.connect(kickGain);
        kickGain.connect(masterGain);

        kickOsc.start(now);
        kickOsc.stop(now + 0.15);
      }

      step++;
    }, intervalTime);

    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playSynthesizedLoop();
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const handleSelectTrack = (track: MusicTrack) => {
    setSelectedTrack(track);
    if (isPlaying) {
      setTimeout(() => {
        playSynthesizedLoop();
      }, 0);
    }
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    if (audioCtxRef.current) {
      // update gain live
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
        <span className="flex items-center gap-1.5 text-amber-400">
          <Music className="w-4 h-4" /> خلفيات صوتية وموسيقى استوديو للإعلانات والبودكاست
        </span>
        <span className="text-[10px] text-slate-400 font-mono">WebAudio Studio Engine</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {TRACKS.map((tr) => (
          <button
            key={tr.id}
            onClick={() => handleSelectTrack(tr)}
            className={`p-2.5 rounded-xl border text-right text-xs transition flex items-center justify-between ${
              selectedTrack.id === tr.id
                ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="truncate">{tr.nameAr}</span>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-1">
              {tr.bpm} BPM
            </span>
          </button>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'إيقاف الخلفية الموسيقية' : 'تشغيل خلفية الإعلان'}</span>
          </button>

          <span className="text-xs text-slate-400 hidden sm:inline">
            {selectedTrack.nameAr}
          </span>
        </div>

        {/* Volume slider */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.01}
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-[10px] font-mono text-slate-400">{Math.round(volume * 200)}%</span>
        </div>
      </div>
    </div>
  );
}
