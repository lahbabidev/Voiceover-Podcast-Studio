'use client';

import React, { useMemo } from 'react';
import { Sparkles, CheckCircle, AlertCircle, Clock, Zap, Target } from 'lucide-react';

interface ScriptQualityAnalyzerProps {
  script: string;
  onApplyImprovement?: (newScript: string) => void;
}

export function ScriptQualityAnalyzer({ script, onApplyImprovement }: ScriptQualityAnalyzerProps) {
  const analysis = useMemo(() => {
    if (!script.trim()) {
      return {
        wordCount: 0,
        estimatedSecs: 0,
        hasCTA: false,
        hasDiscountOrUrgency: false,
        score: 0,
        suggestions: [],
      };
    }

    const words = script.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    // Standard commercial radio speech rate: ~2.5 words per second (150 words/min)
    const estimatedSecs = Math.ceil(wordCount / 2.5);

    // Call to action keywords in Arabic / Darija / French / English
    const ctaKeywords = [
      'اطلب', 'شري', 'تواصل', 'حمل', 'احجز', 'زوروا', 'اتصل', 'زر',
      'buy', 'order', 'call', 'visit', 'download', 'book',
      'commandez', 'achetez', 'découvrez', 'cliquez',
    ];

    // Urgency / Offer keywords
    const offerKeywords = [
      'خصم', 'تخفيض', 'مجاني', 'عرض', 'حدود', 'دابا', 'الآن', 'فرصة',
      'discount', 'sale', 'free', 'limited', 'now', 'offer',
      'gratuit', 'promo', 'offre', 'réduction',
    ];

    const scriptLower = script.toLowerCase();
    const hasCTA = ctaKeywords.some((kw) => scriptLower.includes(kw));
    const hasDiscountOrUrgency = offerKeywords.some((kw) => scriptLower.includes(kw));

    let score = 50;
    if (wordCount >= 10 && wordCount <= 60) score += 20; // Ideal commercial ad length (15s-30s)
    if (hasCTA) score += 15;
    if (hasDiscountOrUrgency) score += 15;

    const suggestions = [];
    if (!hasCTA) {
      suggestions.push('أضف دعوة واضحة لاتخاذ إجراء (Call-To-Action) مثل: "اطلب الآن واستفد من التوصيل المجاني".');
    }
    if (!hasDiscountOrUrgency) {
      suggestions.push('أضف عنصر الاستعجال أو العرض الخصمي مثل: "عرض لفترة محدودة" أو "خصم 50%".');
    }
    if (wordCount > 70) {
      suggestions.push('النص طويل نسبياً لإعلان راديو أو إنستغرام (أكثر من 30 ثانية). يفضل اختصاره لزيادة نسبة التأثير.');
    }

    return {
      wordCount,
      estimatedSecs,
      hasCTA,
      hasDiscountOrUrgency,
      score: Math.min(score, 100),
      suggestions,
    };
  }, [script]);

  if (!script.trim()) return null;

  return (
    <div className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-200">تحليل جودة النص الإعلاني (Ad Copy Score):</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
              analysis.score >= 80
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : analysis.score >= 60
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}
          >
            {analysis.score} / 100
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[11px] text-center">
        <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
          <span className="text-slate-400 block">عدد الكلمات</span>
          <span className="text-slate-200 font-bold">{analysis.wordCount} كلمة</span>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
          <span className="text-slate-400 block">المدة التقديرية</span>
          <span className="text-amber-400 font-bold">{analysis.estimatedSecs} ثانية</span>
        </div>
        <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2">
          <span className="text-slate-400 block">دعوة للشراء (CTA)</span>
          <span className={analysis.hasCTA ? 'text-emerald-400 font-bold' : 'text-slate-500 font-bold'}>
            {analysis.hasCTA ? 'موجودة ✓' : 'غير مكتشفة'}
          </span>
        </div>
      </div>

      {analysis.suggestions.length > 0 && (
        <div className="space-y-1 pt-1">
          {analysis.suggestions.map((sug, i) => (
            <p key={i} className="text-[11px] text-amber-300/90 flex items-center gap-1.5 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{sug}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
