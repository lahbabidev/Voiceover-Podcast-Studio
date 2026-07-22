'use client';

import React, { useState } from 'react';
import { Mic, Sparkles, RefreshCw, Play, Pause, Download, Users, Copy, Check } from 'lucide-react';

export function PodcastDialogueStudio() {
  const [topic, setTopic] = useState('نقاش حول أحدث تقنيات التسويق الرقمي وتأثير الذكاء الاصطناعي على صناعة الإعلانات بالمغرب');
  const [language, setLanguage] = useState('ar_darija');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ script: string; audioUrl: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleGenerateDialogue = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/podcast-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, lang: language }),
      });
      const data = await res.json();
      if (data.success) {
        setResult({
          script: data.script,
          audioUrl: data.audioUrl,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const copyScript = () => {
    if (result?.script) {
      navigator.clipboard.writeText(result.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              استوديو حوار البودكاست الثنائي (Multi-Speaker Podcast)
            </h3>
            <p className="text-xs text-slate-400">
              توليد حوار بودكاست بين مذيع (Joe) وضيف (Jane) بصوت طبيعي ثنائي ومتناسق
            </p>
          </div>
        </div>

        <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full font-semibold">
          صوتين متزامنين
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold text-slate-300">موضوع الحلقة أو الحوار:</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثال: نقاش حماسي حول إطلاق منتج جديد..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">اللغة / اللهجة:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <option value="ar_darija">🇲🇦 الدارجة المغربية (Moroccan Darija)</option>
            <option value="ar_msa">🇸🇦 العربية الفصحى (Modern Arabic)</option>
            <option value="fr">🇫🇷 الفرنسية (French)</option>
            <option value="en">🇬🇧 الإنجليزية (English)</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerateDialogue}
        disabled={loading || !topic.trim()}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-xl flex items-center justify-center gap-2 transition"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" /> جاري تأليف وتسجيل حوار البودكاست...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" /> توليد حوار البودكاست الصوتي الثنائي
          </>
        )}
      </button>

      {result && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Mic className="w-4 h-4" /> نص الحوار الصوتي المولد:
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={copyScript}
                className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'تم النسخ' : 'نسخ النص'}
              </button>
            </div>
          </div>

          <pre
            dir={language.startsWith('ar') ? 'rtl' : 'ltr'}
            className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800 max-h-48 overflow-y-auto"
          >
            {result.script}
          </pre>

          {result.audioUrl && (
            <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <audio
                ref={audioRef}
                src={result.audioUrl}
                onEnded={() => setIsPlaying(false)}
              />
              <button
                onClick={togglePlay}
                className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'إيقاف الحوار' : 'تشغيل الحوار الصوتي كامل'}
              </button>

              <a
                href={result.audioUrl}
                download="podcast_dialogue.wav"
                className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg"
              >
                <Download className="w-3.5 h-3.5" /> تحميل الصوت WAV
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
