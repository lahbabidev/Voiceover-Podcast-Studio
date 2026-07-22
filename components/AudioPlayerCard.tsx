'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download, Copy, Check, RefreshCw, Volume2, VolumeX, Sparkles, Edit3, Save, Music, Disc, Subtitles } from 'lucide-react';
import { wavToMp3DataUrl } from '@/lib/audio';
import { generateSrtDataUrl } from '@/lib/subtitles';

export interface VoiceoverTarget {
  id: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  script: string;
  phoneticGuide?: string;
  audioUrl?: string;
  mp3Url?: string;
  durationEstSec?: number;
}

interface AudioPlayerCardProps {
  item: VoiceoverTarget;
  onUpdateScriptAndRegenerate: (id: string, newScript: string) => Promise<void>;
  isRegenerating?: boolean;
}

export function AudioPlayerCard({ item, onUpdateScriptAndRegenerate, isRegenerating = false }: AudioPlayerCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(item.durationEstSec || 0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState(item.script);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [prevScript, setPrevScript] = useState(item.script);
  if (item.script !== prevScript) {
    setPrevScript(item.script);
    setEditedScript(item.script);
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    if (!audioRef.current || !item.audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const copyScript = () => {
    navigator.clipboard.writeText(item.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAndRegenerate = async () => {
    setIsEditing(false);
    if (editedScript.trim() !== item.script) {
      await onUpdateScriptAndRegenerate(item.id, editedScript);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const mp3DownloadUrl = item.mp3Url || (item.audioUrl ? wavToMp3DataUrl(item.audioUrl) : undefined);

  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
      {/* Background glow accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all" />

      <div>
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow">{item.flag}</span>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                {item.nameAr}
                <span className="text-xs font-mono uppercase bg-slate-800 text-amber-400 px-2 py-0.5 rounded-md border border-slate-700/50">
                  {item.id}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                مدة متوقعة: {formatTime(duration)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={copyScript}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
              title="نسخ النص"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* MP3 Download Button */}
            {mp3DownloadUrl && (
              <a
                href={mp3DownloadUrl}
                download={`voiceover_${item.id}.mp3`}
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                title="تحميل بصيغة MP3 احترافية"
              >
                <Download className="w-3.5 h-3.5" />
                <span>MP3</span>
              </a>
            )}

            {/* WAV Download Button */}
            {item.audioUrl && (
              <a
                href={item.audioUrl}
                download={`voiceover_${item.id}.wav`}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                title="تحميل بصيغة WAV عالية الدقة"
              >
                <Disc className="w-3.5 h-3.5 text-slate-400" />
                <span>WAV</span>
              </a>
            )}

            {/* SRT Subtitle Download Button */}
            <a
              href={generateSrtDataUrl(item.script, duration || 10)}
              download={`subtitles_${item.id}.srt`}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition"
              title="تحميل ملف التوقيت والترجمة للفيديو SRT"
            >
              <Subtitles className="w-3.5 h-3.5 text-amber-400" />
              <span>SRT</span>
            </a>
          </div>
        </div>

        {/* Script Content area */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-semibold text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> نص التعليق الصوتي المكيّف
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-amber-400 hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" /> {isEditing ? 'إلغاء التعديل' : 'تعديل النص'}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedScript}
                onChange={(e) => setEditedScript(e.target.value)}
                rows={3}
                dir={item.id.startsWith('ar') ? 'rtl' : 'ltr'}
                className="w-full bg-slate-950 text-slate-200 border border-amber-500/50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none font-medium"
              />
              <button
                onClick={handleSaveAndRegenerate}
                disabled={isRegenerating}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                {isRegenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                حفظ وإعادة توليد الصوت لهذا الخيار
              </button>
            </div>
          ) : (
            <div
              dir={item.id.startsWith('ar') ? 'rtl' : 'ltr'}
              className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-slate-200 text-sm leading-relaxed max-h-28 overflow-y-auto"
            >
              {item.script}
            </div>
          )}

          {item.phoneticGuide && (
            <p className="text-xs text-slate-400 mt-2 bg-slate-800/40 px-3 py-1.5 rounded-lg border border-slate-800/60 flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">💡 نبرة وإرشاد:</span> {item.phoneticGuide}
            </p>
          )}
        </div>
      </div>

      {/* Audio Waveform & Player Section */}
      <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-800/90 space-y-3">
        {/* Animated Waveform Visualizer */}
        <div className="flex items-center justify-center gap-1 h-8 px-2 bg-slate-900/50 rounded-lg overflow-hidden">
          {Array.from({ length: 28 }).map((_, i) => {
            const heights = [30, 65, 40, 90, 50, 75, 100, 45, 80, 60, 35, 95, 70, 40, 85, 55, 65, 30, 90, 40];
            const h = heights[i % heights.length];
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isPlaying ? 'bg-amber-400 animate-pulse' : 'bg-slate-700/60'
                }`}
                style={{
                  height: isPlaying ? `${h}%` : '20%',
                  animationDelay: `${(i % 10) * 0.12}s`,
                }}
              />
            );
          })}
        </div>

        {/* Audio element hidden */}
        {item.audioUrl && (
          <audio
            ref={audioRef}
            src={item.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onLoadedMetadata={handleTimeUpdate}
          />
        )}

        {/* Seek bar */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            disabled={!item.audioUrl}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              disabled={!item.audioUrl || isRegenerating}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition shadow-lg ${
                !item.audioUrl
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : isPlaying
                  ? 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-400'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-105'
              }`}
            >
              {isRegenerating ? (
                <RefreshCw className="w-5 h-5 animate-spin text-slate-950" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current mr-0.5" />
              )}
            </button>

            <button
              onClick={toggleMute}
              disabled={!item.audioUrl}
              className="p-2 text-slate-400 hover:text-slate-200 rounded-lg"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            {[0.8, 1.0, 1.25, 1.5].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded ${
                  playbackSpeed === spd
                    ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
