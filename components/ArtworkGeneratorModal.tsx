/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, Sparkles, RefreshCw, Download, X } from 'lucide-react';

interface ArtworkGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrompt?: string;
}

export function ArtworkGeneratorModal({ isOpen, onClose, defaultPrompt = '' }: ArtworkGeneratorModalProps) {
  const [prompt, setPrompt] = useState(defaultPrompt || 'غلاف إعلاني احترافي لمنتج فاخر مع إضاءة ستوديو جذابة ومؤثرات حديثة');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const res = await fetch('/api/generate-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, aspectRatio }),
      });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.imageUrl);
      } else {
        setError(data.error || 'فشل في إنشاء الصورة');
      }
    } catch (e: any) {
      setError(e.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 relative shadow-2xl space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">مصمم الصور الإعلانية وغلاف البودكاست</h3>
            <p className="text-xs text-slate-400">توليد صورة ترويجية احترافية تتوافق مع التعليق الصوتي</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">وصف الصورة المراد إنشاؤها:</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">أبعاد الصورة:</label>
            <div className="flex gap-2">
              {['1:1', '16:9', '9:16'].map((ratio) => (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                    aspectRatio === ratio
                      ? 'bg-amber-500 text-slate-950 border-amber-400'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> جاري تصميم الصورة بالذكاء الاصطناعي...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> إنشاء الصورة الإعلانية
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
            {error}
          </p>
        )}

        {imageUrl && (
          <div className="space-y-3 pt-2">
            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center max-h-72">
              <img src={imageUrl} alt="Generated Artwork" className="object-contain max-h-72 w-full" />
            </div>

            <a
              href={imageUrl}
              download="ad_artwork.png"
              className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition border border-slate-700"
            >
              <Download className="w-4 h-4" /> تحميل الصورة بدقة عالية PNG
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
