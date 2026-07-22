'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, Download, FileText, Instagram, Radio, Video, X, Disc, Subtitles } from 'lucide-react';
import { VoiceoverTarget } from './AudioPlayerCard';
import { wavToMp3DataUrl } from '@/lib/audio';
import { generateSrtDataUrl } from '@/lib/subtitles';

interface CampaignExporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceScript: string;
  results: VoiceoverTarget[];
}

export function CampaignExporterModal({
  isOpen,
  onClose,
  sourceScript,
  results,
}: CampaignExporterModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Generate Social Captions based on Darija / MSA scripts
  const darijaObj = results.find((r) => r.id === 'ar_darija') || results[0];
  const mainScript = darijaObj ? darijaObj.script : sourceScript;

  const instagramCaption = `🔥 ${mainScript}\n\n👉 اطلب الآن واستفد من التوصيل والتخفيض!\n🔗 الرابط في البيو (Link in Bio)\n\n#المغرب #عروض_المغرب #إعلان #الدارجة_المغربية #تخفيضات #تسوق_اونلاين #الدار_البيضاء #الرباط #مراكش`;

  const tiktokCaption = `مفاجأة اليوم! 🚀 ${mainScript.slice(0, 100)}... اضغط على الرابط وشوف العرض! 🎁 #fyp #viral #morocco #عروض #المغرب`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">تصدير حزمة الإعلان المكتملة (MP3 & WAV)</h3>
            <p className="text-xs text-slate-400">
              جميع التعاليق الصوتية بصيغة MP3 و WAV + المنشورات الجاهزة لمواقع التواصل
            </p>
          </div>
        </div>

        {/* Social Media Ready Captions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Instagram className="w-4 h-4" /> منشور إنستغرام وفيس بوك جاهز للنسخ:
          </h4>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 relative">
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
              {instagramCaption}
            </p>
            <button
              onClick={() => handleCopy(instagramCaption, 'ig')}
              className="mt-2 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg border border-slate-700 font-bold flex items-center gap-1.5 transition"
            >
              {copiedIndex === 'ig' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 'ig' ? 'تم النسخ!' : 'نسخ منشور Instagram'}</span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Video className="w-4 h-4" /> كابشن تيك توك وريلز (TikTok / Reels):
          </h4>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <p className="text-xs text-slate-300 font-mono">{tiktokCaption}</p>
            <button
              onClick={() => handleCopy(tiktokCaption, 'tt')}
              className="mt-2 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg border border-slate-700 font-bold flex items-center gap-1.5 transition"
            >
              {copiedIndex === 'tt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 'tt' ? 'تم النسخ!' : 'نسخ كابشن TikTok'}</span>
            </button>
          </div>
        </div>

        {/* Audio Downloads List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
            <Radio className="w-4 h-4" /> التسجيلات الصوتية الجاهزة للتنزيل (MP3 & WAV):
          </h4>
          <div className="space-y-2">
            {results.map((res) => {
              const mp3Url = res.mp3Url || (res.audioUrl ? wavToMp3DataUrl(res.audioUrl) : undefined);
              return (
                <div
                  key={res.id}
                  className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs flex-wrap gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{res.flag}</span>
                    <span className="font-bold text-slate-200">{res.nameAr}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {mp3Url && (
                      <a
                        href={mp3Url}
                        download={`voiceover_${res.id}.mp3`}
                        className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>MP3</span>
                      </a>
                    )}
                    {res.audioUrl && (
                      <a
                        href={res.audioUrl}
                        download={`voiceover_${res.id}.wav`}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition"
                      >
                        <Disc className="w-3.5 h-3.5 text-slate-400" />
                        <span>WAV</span>
                      </a>
                    )}
                    <a
                      href={generateSrtDataUrl(res.script, res.durationEstSec || 10)}
                      download={`subtitles_${res.id}.srt`}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition"
                      title="تحميل ملف ترجمة الفيديو SRT"
                    >
                      <Subtitles className="w-3.5 h-3.5 text-amber-400" />
                      <span>SRT</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2 rounded-xl text-xs font-bold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
