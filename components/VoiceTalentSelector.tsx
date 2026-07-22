'use client';

import React from 'react';
import { Mic, User, Sparkles, Check } from 'lucide-react';

export interface VoiceOption {
  id: string; // 'auto' | 'Kore' | 'Zephyr' | 'Puck' | 'Fenrir' | 'Charon'
  nameAr: string;
  gender: 'male' | 'female';
  descriptionAr: string;
  tag: string;
}

export const VOICE_TALENTS: VoiceOption[] = [
  {
    id: 'auto',
    nameAr: 'تلقائي (حسب اللسان واللهجة)',
    gender: 'male',
    descriptionAr: 'اختيار خامة الصوت الأنسب لكل لغة تلقائياً',
    tag: 'موصى به 🌟',
  },
  {
    id: 'Kore',
    nameAr: 'يونس (Kore)',
    gender: 'male',
    descriptionAr: 'صوت جهوري، عميق، وقوي للإعلانات الرسمية',
    tag: 'راديو وإعلانات 📻',
  },
  {
    id: 'Zephyr',
    nameAr: 'مريم (Zephyr)',
    gender: 'female',
    descriptionAr: 'صوت دافئ، واضح، وراقي للماركات والبودكاست',
    tag: 'بودكاست وفخامة 🎧',
  },
  {
    id: 'Puck',
    nameAr: 'أمين (Puck)',
    gender: 'male',
    descriptionAr: 'صوت حماسي، شبابي، وسريع للتيكتوك والريلز',
    tag: 'ريلز وتيكتوك ⚡',
  },
  {
    id: 'Fenrir',
    nameAr: 'حمزة (Fenrir)',
    gender: 'male',
    descriptionAr: 'صوت سينمائي، قوي، ومؤثر للبروموهات',
    tag: 'برومو وسينما 🎬',
  },
  {
    id: 'Charon',
    nameAr: 'كريم (Charon)',
    gender: 'male',
    descriptionAr: 'صوت هادئ، متزن، واحترافي للتقارير والشركات',
    tag: 'وثائقي ورسمي 💼',
  },
];

interface VoiceTalentSelectorProps {
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
}

export function VoiceTalentSelector({ selectedVoice, onSelectVoice }: VoiceTalentSelectorProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs font-bold text-slate-300">
        <span className="flex items-center gap-1.5">
          <User className="w-4 h-4 text-amber-400" /> خامة وصوت المعلق (Voice Talent):
        </span>
        <span className="text-[11px] text-amber-400">
          {VOICE_TALENTS.find((v) => v.id === selectedVoice)?.nameAr || 'تلقائي'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {VOICE_TALENTS.map((v) => {
          const isSelected = selectedVoice === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => onSelectVoice(v.id)}
              className={`p-2.5 rounded-xl border text-right transition flex flex-col justify-between gap-1.5 ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/70 text-slate-100 shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                  {v.nameAr}
                </span>
                <span className="text-[10px] bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded border border-slate-700">
                  {v.tag}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {v.descriptionAr}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
