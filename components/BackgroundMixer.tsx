'use client';

import React, { useState } from 'react';
import { Music, Play, Square, Volume2 } from 'lucide-react';
import { ambientMixer } from '@/lib/ambientSynth';

export function BackgroundMixer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('upbeat');
  const [volume, setVolume] = useState(0.15);

  const tracks = [
    { id: 'upbeat', label: '🥁 إيقاع حماسي للإعلانات (Upbeat Ad)' },
    { id: 'podcast_chill', label: '🎧 بودكاست ودافيء (Podcast Ambient)' },
    { id: 'cinematic', label: '🎬 سينمائي وفخم (Cinematic Pad)' },
    { id: 'corporate', label: '💼 احترافي كوربوريت (Corporate Synth)' },
  ];

  const handleTogglePlay = () => {
    if (!ambientMixer) return;
    if (isPlaying) {
      ambientMixer.stop();
      setIsPlaying(false);
    } else {
      ambientMixer.play(currentTrack);
      setIsPlaying(true);
    }
  };

  const handleTrackChange = (trackId: string) => {
    setCurrentTrack(trackId);
    if (isPlaying && ambientMixer) {
      ambientMixer.play(trackId);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (ambientMixer) {
      ambientMixer.setVolume(val);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Music className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            مكسر الموسيقى الخلفية للتعليق الصوتي
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              خالي من حقوق الطبع
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            أضف إيقاعاً خلفياً أثناء معاينة وتوليد التعاليق الصوتية للإعلانات والبودكاست
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        {/* Track selector */}
        <select
          value={currentTrack}
          onChange={(e) => handleTrackChange(e.target.value)}
          className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          {tracks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>

        {/* Play/Stop button */}
        <button
          onClick={handleTogglePlay}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-400 text-slate-950'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" /> إيقاف الخلفية
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" /> تشغيل الموسيقى
            </>
          )}
        </button>

        {/* Volume slider */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-1.5">
          <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.01}
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>
    </div>
  );
}
