'use client';

import React from 'react';
import { ShoppingBag, Mic, Car, Smartphone, Utensils, Sparkles, Globe } from 'lucide-react';

export interface CampaignPreset {
  id: string;
  titleAr: string;
  category: string;
  icon: any;
  defaultScript: string;
}

export const CAMPAIGN_PRESETS: CampaignPreset[] = [
  {
    id: 'ailogha_app',
    titleAr: 'تطبيق Ailogha.com',
    category: 'تعلم اللغات بالذكاء الاصطناعي',
    icon: Globe,
    defaultScript: `فيديو اليوم برعاية منصة "Ailogha.com".
الحل الأذكى لتعلم وممارسة اللغات.
إذا كنت تريد التحدث بطلاقة.
Ailogha هي أول منصة تمنحك أستاذ ذكاء اصطناعي تتحدث معه محادثة مباشرة يعني realtime.
- يدعم أكثر من 50 لغة و 16 لهجة لشرح المفاهيم بوضوح.
- يتذكر محادثاتك السابقة. يصحح أخطائك فورا ومتاح دائما للتمرن بدون مواعيد وبدون توتر.
سجل الآن عبر الرابط في الوصف واستفد من حصة مجانية وخصم خاص.`,
  },
  {
    id: 'ecommerce',
    titleAr: 'تخفيضات متجر إلكتروني',
    category: 'إعلانات التجارة',
    icon: ShoppingBag,
    defaultScript: 'استمتع بأقوى العروض والتخفيضات اليوم! خصم يصل إلى 50% على جميع المنتجات مع توصيل مجاني وسريع حتى باب دارك. لا تفوّت الفرصة واطلب الآن قبل نفاد الكمية!',
  },
  {
    id: 'podcast_sponsor',
    titleAr: 'رعاية بودكاست ومقدمة',
    category: 'صناع المحتوى',
    icon: Mic,
    defaultScript: 'مرحباً بكم في حلقة جديدة من البودكاست! هذه الحلقة برعاية المنصة الرقمية الأولى التي تساعدك على تنظيم حياتك وتطوير مهاراتك اليومية. استمع الآن واستمتع بمحتوى ملهم ومميز.',
  },
  {
    id: 'real_estate',
    titleAr: 'إعلان عقارات ومشاريع',
    category: 'تسويق عقاري',
    icon: Car,
    defaultScript: 'هل تبحث عن شقة أحلامك بموقع استراتيجي وتصميم عصري؟ اكتشف أرقى المجمعات السكنية مع تسهيلات في الدفع وأسعار مشجعة جداً. احجز معاينتك المجانية اليوم!',
  },
  {
    id: 'app_launch',
    titleAr: 'إطلاق تطبيق هواتف',
    category: 'التكنولوجيا والحلول',
    icon: Smartphone,
    defaultScript: 'حمل التطبيق الجديد الآن واكتشف أسهل طريقة لإدارة مهامك اليومية بضغطة زر واحدة. تطبيق سلس، سريع، ومتاح مجاناً على iOS وأندرويد.',
  },
];

interface CampaignPresetsProps {
  onSelectPreset: (script: string) => void;
}

export function CampaignPresets({ onSelectPreset }: CampaignPresetsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-400" /> نماذج جاهزة للإعلانات والبودكاست
        </span>
        <span>اختر نموذجاً للبدء السريع</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {CAMPAIGN_PRESETS.map((preset) => {
          const IconComponent = preset.icon;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset.defaultScript)}
              className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3 text-right flex flex-col justify-between gap-2 transition group hover:shadow-lg hover:shadow-amber-500/5"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                <IconComponent className="w-4 h-4" />
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-200 group-hover:text-amber-400 transition line-clamp-1">
                  {preset.titleAr}
                </span>
                <span className="block text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {preset.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
