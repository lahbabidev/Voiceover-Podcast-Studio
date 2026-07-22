'use client';

import React from 'react';
import { PauseCircle, Volume2, Sparkles, Flame, Clock } from 'lucide-react';

interface SpeechPauseToolbarProps {
  onInsertText: (insertedText: string) => void;
}

export function SpeechPauseToolbar({ onInsertText }: SpeechPauseToolbarProps) {
  const tools = [
    {
      label: 'وقف تنفس قصير (،)',
      value: '، ',
      icon: PauseCircle,
      desc: 'إضافة توقف طبيعي للتنفس بين الجمل',
    },
    {
      label: 'وقفة إعلانية ممتدة (...)',
      value: ' ... ',
      icon: Clock,
      desc: 'إحداث تشويق قبل كشف السعر أو المفاجأة',
    },
    {
      label: 'علامة حماس (!)',
      value: '! ',
      icon: Flame,
      desc: 'رفع نبرة الصوت في الجملة الموالية',
    },
    {
      label: 'دعوة للشراء عاجلة',
      value: ' سارع دابا واطلب من الرابط! ',
      icon: Sparkles,
      desc: 'إدراج جملة CTA جاهزة للدارجة',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-900/90 border border-slate-800 rounded-xl">
      <span className="text-[11px] font-bold text-slate-400 pl-2 border-l border-slate-800 flex items-center gap-1">
        <Volume2 className="w-3.5 h-3.5 text-amber-400" /> أدوات تحسين الإلقاء:
      </span>
      {tools.map((t, idx) => {
        const Icon = t.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onInsertText(t.value)}
            title={t.desc}
            className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
          >
            <Icon className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
