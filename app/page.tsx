'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic,
  Volume2,
  Sparkles,
  Zap,
  Radio,
  Sliders,
  Play,
  Square,
  RefreshCw,
  Download,
  Share2,
  Layers,
  CheckCircle2,
  Image as ImageIcon,
  Users,
  Settings,
  HelpCircle,
  Key,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';

import { AudioPlayerCard, VoiceoverTarget } from '@/components/AudioPlayerCard';
import { CampaignPresets } from '@/components/CampaignPresets';
import { BackgroundMusicMixer } from '@/components/BackgroundMusicMixer';
import { PodcastDialogueStudio } from '@/components/PodcastDialogueStudio';
import { ArtworkGeneratorModal } from '@/components/ArtworkGeneratorModal';
import { ScriptQualityAnalyzer } from '@/components/ScriptQualityAnalyzer';
import { VoiceTalentSelector } from '@/components/VoiceTalentSelector';
import { SpeechPauseToolbar } from '@/components/SpeechPauseToolbar';
import { CampaignExporterModal } from '@/components/CampaignExporterModal';
import { CampaignHistoryDrawer } from '@/components/CampaignHistoryDrawer';
import { saveCampaignToHistory, SavedCampaign } from '@/lib/storage';
import { wavToMp3DataUrl } from '@/lib/audio';

export default function VoiceoverPodcastStudio() {
  // User Custom Gemini API Key State
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [showKeyText, setShowKeyText] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('custom_gemini_api_key');
    if (saved) {
      setTimeout(() => {
        setCustomKeyInput(saved);
        setIsKeySaved(true);
      }, 0);
    }
  }, []);

  const handleSaveApiKey = () => {
    const trimmed = customKeyInput.trim();
    if (trimmed) {
      localStorage.setItem('custom_gemini_api_key', trimmed);
      setIsKeySaved(true);
    } else {
      handleClearApiKey();
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('custom_gemini_api_key');
    setCustomKeyInput('');
    setIsKeySaved(false);
  };

  // Main Script & Options State
  const [sourceScript, setSourceScript] = useState(
    'استمتع بأقوى العروض والتخفيضات اليوم! خصم استثنائي يصل إلى 50% على جميع المنتجات مع توصيل مجاني وسريع حتى باب دارك. لا تفوّت الفرصة واطلب الآن قبل نفاد الكمية!'
  );
  const [campaignType, setCampaignType] = useState('ad_promo');
  const [tone, setTone] = useState('energetic_ad');
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male');
  const [customVoice, setCustomVoice] = useState('auto');
  const [speakingSpeed, setSpeakingSpeed] = useState('normal');
  const [isEnhancingScript, setIsEnhancingScript] = useState(false);

  // Selected Languages / Dialects
  const [selectedLangs, setSelectedLangs] = useState<string[]>([
    'ar_darija',
    'ar_darija_chamali',
    'ar_msa',
    'fr',
    'en',
  ]);

  // Batch Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [results, setResults] = useState<VoiceoverTarget[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Active Tab View: 'studio' | 'dialogue' | 'history'
  const [activeTab, setActiveTab] = useState<'studio' | 'dialogue'>('studio');

  // Export Modal & History State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Artwork Modal
  const [isArtworkOpen, setIsArtworkOpen] = useState(false);

  // Play All Batch State
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  // Languages & Moroccan Dialects Definition
  const AVAILABLE_LANGUAGES = [
    // Moroccan Regional Dialects & Styles
    {
      id: 'ar_darija',
      nameAr: 'الدارجة المغربية الإعلانية (الرباط/البيضاء)',
      nameEn: 'Moroccan Commercial Darija',
      flag: '🇲🇦',
      badge: 'راديو وإعلانات تجارية',
      category: 'moroccan',
    },
    {
      id: 'ar_darija_chamali',
      nameAr: 'الدارجة الشمالية (طنجة/تطوان)',
      nameEn: 'Northern Moroccan Darija',
      flag: '🇲🇦',
      badge: 'لكنة شمالية أصيلة جيلالية',
      category: 'moroccan',
    },
    {
      id: 'ar_darija_marrakchi',
      nameAr: 'الدارجة المراكشية والجنوبية (البهجة)',
      nameEn: 'Marrakchi Southern Darija',
      flag: '🇲🇦',
      badge: 'عفوية وحيوية وروح ضيافة',
      category: 'moroccan',
    },
    {
      id: 'ar_darija_oujdi',
      nameAr: 'الدارجة الشرقية (وجدة والشرق)',
      nameEn: 'Oujdi Eastern Darija',
      flag: '🇲🇦',
      badge: 'لكنة شرقاوية أصيلة',
      category: 'moroccan',
    },
    {
      id: 'ar_darija_hikaya',
      nameAr: 'الدارجة الحكواتية (أسلوب الحلقة)',
      nameEn: 'Folkloric Moroccan Storyteller',
      flag: '🇲🇦',
      badge: 'سرد قصصي درامي حماسي',
      category: 'moroccan',
    },
    {
      id: 'ber_tashelhit',
      nameAr: 'الأمازيغية المغربية (التشلحيت)',
      nameEn: 'Moroccan Tamazight',
      flag: '🇲🇦',
      badge: 'لغة وأصالة مغربية',
      category: 'moroccan',
    },

    // International & Standard Languages
    {
      id: 'ar_msa',
      nameAr: 'العربية الفصحى الإعلانية المشكولة',
      nameEn: 'Modern Standard Arabic',
      flag: '🇸🇦',
      badge: 'فصحى رسمية متقنة',
      category: 'global',
    },
    {
      id: 'fr',
      nameAr: 'الفرنسية التسويقية التجاريّة',
      nameEn: 'French Commercial',
      flag: '🇫🇷',
      badge: 'French Business Promo',
      category: 'global',
    },
    {
      id: 'en',
      nameAr: 'الإنجليزي التسويقي الاحترافي',
      nameEn: 'Global English',
      flag: '🇬🇧',
      badge: 'Global Commercial',
      category: 'global',
    },
    {
      id: 'es',
      nameAr: 'الإسبانية الإعلانية',
      nameEn: 'Spanish Commercial',
      flag: '🇪🇸',
      badge: 'Spanish Promo',
      category: 'global',
    },
  ];

  const toggleLanguageSelect = (langId: string) => {
    if (selectedLangs.includes(langId)) {
      if (selectedLangs.length === 1) return; // Keep at least one
      setSelectedLangs(selectedLangs.filter((id) => id !== langId));
    } else {
      setSelectedLangs([...selectedLangs, langId]);
    }
  };

  // Enhance script with diacritics & vocalization
  const handleEnhanceScript = async () => {
    if (!sourceScript.trim()) return;
    setIsEnhancingScript(true);
    try {
      const customKey = typeof window !== 'undefined' ? localStorage.getItem('custom_gemini_api_key') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customKey) {
        headers['x-gemini-api-key'] = customKey;
      }

      const res = await fetch('/api/enhance-script', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          script: sourceScript,
          tone,
          targetLang: selectedLangs[0] || 'ar_darija',
        }),
      });
      const data = await res.json();
      if (data.success && data.enhancedScript) {
        setSourceScript(data.enhancedScript);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancingScript(false);
    }
  };

  // Batch Simultaneous Voiceover Conversion Handler
  const handleBatchGenerate = async () => {
    if (!sourceScript.trim()) {
      setErrorMessage('الرجاء كتابة أو اختيار نص للتعليق الصوتي');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');
    setResults([]);

    try {
      const customKey = typeof window !== 'undefined' ? localStorage.getItem('custom_gemini_api_key') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customKey) {
        headers['x-gemini-api-key'] = customKey;
      }

      const res = await fetch('/api/batch-voiceover', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sourceScript,
          targetLangs: selectedLangs,
          campaignType,
          tone,
          voiceGender,
          customVoice: customVoice === 'auto' ? undefined : customVoice,
          speakingSpeed,
        }),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setResults(data.data);
        saveCampaignToHistory({
          title: sourceScript.trim().slice(0, 35) + '...',
          sourceScript,
          tone,
          results: data.data,
        });
      } else {
        setErrorMessage(data.error || 'حدث خطأ أثناء إنشاء التعاليق الصوتية');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'حدث خطأ بالاتصال بالسيرفر');
    } finally {
      setIsGenerating(false);
    }
  };

  // Re-generate audio for single language script edit
  const handleUpdateScriptAndRegenerate = async (id: string, newScript: string) => {
    setRegeneratingId(id);
    try {
      const customKey = typeof window !== 'undefined' ? localStorage.getItem('custom_gemini_api_key') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customKey) {
        headers['x-gemini-api-key'] = customKey;
      }

      const res = await fetch('/api/batch-voiceover', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sourceScript: newScript,
          targetLangs: [id],
          campaignType,
          tone,
          voiceGender,
          speakingSpeed,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.[0]) {
        const updatedItem = data.data[0];
        setResults((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleInsertSpeechPause = (textToInsert: string) => {
    setSourceScript((prev) => prev + textToInsert);
  };

  const handleLoadFromHistory = (camp: SavedCampaign) => {
    setSourceScript(camp.sourceScript);
    if (camp.results && camp.results.length > 0) {
      setResults(camp.results);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Radio className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
                صانع البودكاست والتعليق الصوتي
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  ذكاء اصطناعي
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                تحويل النصوص لتعليق صوتي إعلاني وبودكاست متزامن بالدارجة المغربية، الفصحى، الفرنسية، والإنجليزية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsArtworkOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="hidden md:inline">تصميم غلاف الإعلان</span>
            </button>

            <button
              onClick={() => setActiveTab(activeTab === 'studio' ? 'dialogue' : 'studio')}
              className={`font-bold text-xs px-4 py-2.5 rounded-xl border flex items-center gap-2 transition ${
                activeTab === 'dialogue'
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{activeTab === 'dialogue' ? 'العودة للاستوديو' : 'حوار البودكاست الثنائي'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* User Custom API Key Control Banner */}
      <div className="bg-slate-900/40 border-b border-slate-800/60 py-3.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isKeySaved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              <Key className="w-4 h-4" />
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <span>تخصيص مفتاح Gemini API الشخصي (موصى به لتجنب حدود الحصة)</span>
                {isKeySaved ? (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                    مفعل ومستخدم حالياً
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-bold">
                    الحساب المجاني العام (قد يواجه قيوداً)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                توليد مقاطع إعلانية بلا حدود عبر إدخال مفتاح API المجاني الخاص بك من Google AI Studio.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="text-xs font-bold text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl border border-slate-700/80 transition flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>{showKeyConfig ? 'إغلاق الإعدادات' : 'إعداد مفتاح الـ API'}</span>
            </button>
          </div>
        </div>

        {showKeyConfig && (
          <div className="max-w-7xl mx-auto mt-4 p-4 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner space-y-3.5 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                أدخل مفتاح API الخاص بك (Gemini API Key) الذي يبدأ بـ AIza:
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>احصل على مفتاح مجاني من Google AI Studio ↗</span>
              </a>
            </div>

            <div className="flex items-center gap-2.5 max-w-2xl flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 min-w-[200px] w-full">
                <input
                  type={showKeyText ? 'text' : 'password'}
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-2 px-3 pl-10 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKeyText(!showKeyText)}
                  className="absolute left-3 top-2.5 text-slate-500 hover:text-slate-300"
                  title={showKeyText ? 'إخفاء' : 'عرض'}
                >
                  {showKeyText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={handleSaveApiKey}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2 px-4 rounded-xl transition whitespace-nowrap"
                >
                  حفظ المفتاح
                </button>

                {isKeySaved && (
                  <button
                    onClick={handleClearApiKey}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs py-2 px-4 rounded-xl transition whitespace-nowrap"
                  >
                    حذف المفتاح
                  </button>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 leading-relaxed">
              * يتم تخزين هذا المفتاح محلياً بشكل آمن تماماً في متصفحك (localStorage) ولا يُحفظ في خوادمنا أبداً. يتم إرساله فقط كرأس مصادقة آمن إلى واجهة برمجة تطبيقات Gemini لتوليد أصواتك.
            </p>
          </div>
        )}
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Banner highlight */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              <Zap className="w-3.5 h-3.5" /> توليد دفعة واحدة بنفس الوقت بنفس النمط
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 leading-tight">
              أنشئ تعاليقك الصوتية للإعلانات والبودكاست بجميع اللجهات دفعة واحدة 🎙️
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              اكتب نص إعلانك أو فقرتك مرة واحدة، وسيقوم النظام بتكييفه وترجمته وصياغته وتوليد ملفات صوتية عالية الجودة بالدارجة المغربية 🇲🇦، الفصحى 🇸🇦، الفرنسية 🇫🇷، والإنجليزي 🇬🇧 متزامنة وجاهزة للاستخدام في التسويق والإعلانات.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl shadow-xl shrink-0">
            <div className="text-center px-3 border-l border-slate-800">
              <span className="block text-xl font-extrabold text-amber-400">4+</span>
              <span className="text-[11px] text-slate-400">لهجات ولغات</span>
            </div>
            <div className="text-center px-3 border-l border-slate-800">
              <span className="block text-xl font-extrabold text-emerald-400">24kHz</span>
              <span className="text-[11px] text-slate-400">جودة الصوت</span>
            </div>
            <div className="text-center px-3">
              <span className="block text-xl font-extrabold text-indigo-400">0s</span>
              <span className="text-[11px] text-slate-400">تزامن فوري</span>
            </div>
          </div>
        </div>

        {/* Dynamic Studio Views */}
        {activeTab === 'dialogue' ? (
          <PodcastDialogueStudio />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Control Column (Inputs & Options) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Campaign History Drawer */}
              <CampaignHistoryDrawer onLoadCampaign={handleLoadFromHistory} />

              {/* Ready Preset Campaign Selector */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
                <CampaignPresets
                  onSelectPreset={(presetScript) => setSourceScript(presetScript)}
                />
              </div>

              {/* Main Script Text Area & Controls */}
              <div className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-amber-400" /> نص التعليق الصوتي الإعلاني الأساسي:
                  </label>
                  <button
                    onClick={handleEnhanceScript}
                    disabled={isEnhancingScript || !sourceScript.trim()}
                    type="button"
                    className="text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    {isEnhancingScript ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>ضبط النبرة والتشكيل تلقائياً</span>
                  </button>
                </div>

                {/* Speech Delivery & Pause Helper Toolbar */}
                <SpeechPauseToolbar onInsertText={handleInsertSpeechPause} />

                <textarea
                  value={sourceScript}
                  onChange={(e) => setSourceScript(e.target.value)}
                  rows={5}
                  placeholder="اكتب هنا نص الإعلان، العرض، أو مقطع البودكاست..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/60 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 leading-relaxed resize-none transition"
                />

                {/* Real-time Ad Script Quality Analyzer */}
                <ScriptQualityAnalyzer script={sourceScript} />

                {/* Voice Talent Selector */}
                <VoiceTalentSelector
                  selectedVoice={customVoice}
                  onSelectVoice={setCustomVoice}
                />

                {/* Target Languages & Moroccan Dialects Checkbox Group */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 flex-wrap gap-2">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" /> اختر اللهجات واللغات المراد توليدها معاً:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const moroccanIds = AVAILABLE_LANGUAGES.filter((l) => l.category === 'moroccan').map((l) => l.id);
                          const newSelection = Array.from(new Set([...selectedLangs, ...moroccanIds]));
                          setSelectedLangs(newSelection);
                        }}
                        className="text-[11px] text-amber-400 hover:underline bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20"
                      >
                        + جميع اللهجات المغربية 🇲🇦
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedLangs.length === AVAILABLE_LANGUAGES.length) {
                            setSelectedLangs(['ar_darija']);
                          } else {
                            setSelectedLangs(AVAILABLE_LANGUAGES.map((l) => l.id));
                          }
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-200 underline"
                      >
                        {selectedLangs.length === AVAILABLE_LANGUAGES.length ? 'إلغاء الكل' : 'تحديد الكل'}
                      </button>
                    </div>
                  </div>

                  {/* Section 1: Authentic Moroccan Dialects */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-amber-400/90 bg-amber-500/5 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center justify-between">
                      <span>🇲🇦 اللهجات والأساليب المغربية الأصيلة (Moroccan Regional Accents)</span>
                      <span>{selectedLangs.filter((id) => AVAILABLE_LANGUAGES.find((l) => l.id === id)?.category === 'moroccan').length} محددة</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {AVAILABLE_LANGUAGES.filter((l) => l.category === 'moroccan').map((lang) => {
                        const isSelected = selectedLangs.includes(lang.id);
                        return (
                          <button
                            key={lang.id}
                            type="button"
                            onClick={() => toggleLanguageSelect(lang.id)}
                            className={`p-2.5 rounded-xl border text-right transition flex items-center gap-2.5 ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500/60 text-slate-100 shadow-md'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className="text-xl">{lang.flag}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold truncate">{lang.nameAr}</span>
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'bg-amber-500 border-amber-400 text-slate-950'
                                      : 'border-slate-700'
                                  }`}
                                >
                                  {isSelected && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {lang.badge}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 2: Global & Standard Languages */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center justify-between">
                      <span>🌐 اللغات العربية والدولية (International & Standard Languages)</span>
                      <span>{selectedLangs.filter((id) => AVAILABLE_LANGUAGES.find((l) => l.id === id)?.category === 'global').length} محددة</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {AVAILABLE_LANGUAGES.filter((l) => l.category === 'global').map((lang) => {
                        const isSelected = selectedLangs.includes(lang.id);
                        return (
                          <button
                            key={lang.id}
                            type="button"
                            onClick={() => toggleLanguageSelect(lang.id)}
                            className={`p-2.5 rounded-xl border text-right transition flex items-center gap-2.5 ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500/60 text-slate-100 shadow-md'
                                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className="text-xl">{lang.flag}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold truncate">{lang.nameAr}</span>
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'bg-amber-500 border-amber-400 text-slate-950'
                                      : 'border-slate-700'
                                  }`}
                                >
                                  {isSelected && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {lang.badge}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tone, Speed, Voice Gender Controls */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">نمط ونبرة التعليق:</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    >
                      <option value="energetic_ad">🔥 حماسي إعلاني (High Energy Ad)</option>
                      <option value="calm_podcast">🎧 بودكاست هادئ ودافيء (Podcast Host)</option>
                      <option value="luxury_soft">💎 راقي وفخم للماركات (Luxury Brand)</option>
                      <option value="dramatic_promo">🎬 درامي سينمائي (Cinematic Promo)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">جنس الصوت (Speaker):</label>
                    <div className="grid grid-cols-2 gap-1.5 bg-slate-950 p-1 border border-slate-800 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setVoiceGender('male')}
                        className={`py-1.5 rounded-lg transition ${
                          voiceGender === 'male'
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        👨 رجالي (يونس)
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceGender('female')}
                        className={`py-1.5 rounded-lg transition ${
                          voiceGender === 'female'
                            ? 'bg-amber-500 text-slate-950'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        👩 نسائي (مريم)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl">
                    {errorMessage}
                  </div>
                )}

                {/* Main Action Submit Button */}
                <button
                  onClick={handleBatchGenerate}
                  disabled={isGenerating || !sourceScript.trim()}
                  className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-base py-4 px-6 rounded-xl shadow-xl shadow-amber-500/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>جاري توليد التعاليق الصوتية لجميع اللهجات...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 fill-current" />
                      <span>توليد التعاليق الصوتية دفعة واحدة ({selectedLangs.length} لغات)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Output Workbench Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Background Music Bed Mixer Component */}
              <BackgroundMusicMixer />

              {/* Generated Audio Tracks Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    التعاليق الصوتية المولدة
                    {results.length > 0 && (
                      <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
                        {results.length} مقاطع جاهزة
                      </span>
                    )}
                  </h3>

                  {results.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="text-xs bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-400 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-md transition"
                      >
                        <Share2 className="w-3.5 h-3.5" /> تصدير حزمة الإعلان الكلمة
                      </button>

                      {/* Download All MP3s */}
                      <button
                        onClick={() => {
                          results.forEach((item) => {
                            const mp3Url = item.mp3Url || (item.audioUrl ? wavToMp3DataUrl(item.audioUrl) : null);
                            if (mp3Url) {
                              const a = document.createElement('a');
                              a.href = mp3Url;
                              a.download = `voiceover_${item.id}.mp3`;
                              a.click();
                            }
                          });
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-amber-500/20 transition"
                      >
                        <Download className="w-3.5 h-3.5" /> تحميل الكل MP3
                      </button>

                      {/* Download All WAVs */}
                      <button
                        onClick={() => {
                          results.forEach((item) => {
                            if (item.audioUrl) {
                              const a = document.createElement('a');
                              a.href = item.audioUrl;
                              a.download = `voiceover_${item.id}.wav`;
                              a.click();
                            }
                          });
                        }}
                        className="text-xs text-slate-300 hover:text-slate-100 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 hover:bg-slate-800 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-400" /> تحميل الكل WAV
                      </button>
                    </div>
                  )}
                </div>

                {/* Empty State when no results generated yet */}
                {results.length === 0 && !isGenerating && (
                  <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-slate-900 text-slate-600 flex items-center justify-center mx-auto border border-slate-800">
                      <Radio className="w-8 h-8 text-amber-500/40" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-slate-300">
                        استوديو التعليق الصوتي جاهز لمباشرة العمل
                      </h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        اكتب نص إعلانك أو اختر نموذجاً من القائمة على اليسار، ثم انقر على &quot;توليد التعاليق الصوتية دفعة واحدة&quot; لتحصل على النسخ بالدارجة المغربية، الفصحى، واللغات الأجنبية فوراً.
                      </p>
                    </div>
                  </div>
                )}

                {/* Loading skeleton state */}
                {isGenerating && (
                  <div className="grid grid-cols-1 gap-4">
                    {selectedLangs.map((langId) => (
                      <div
                        key={langId}
                        className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 animate-pulse space-y-3"
                      >
                        <div className="flex justify-between items-center">
                          <div className="h-6 bg-slate-800 rounded-md w-32" />
                          <div className="h-5 bg-slate-800 rounded-md w-16" />
                        </div>
                        <div className="h-16 bg-slate-950 rounded-xl" />
                        <div className="h-10 bg-slate-800 rounded-xl" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Generated Audio Cards List */}
                {results.length > 0 && !isGenerating && (
                  <div className="grid grid-cols-1 gap-4">
                    {results.map((item) => (
                      <AudioPlayerCard
                        key={item.id}
                        item={item}
                        onUpdateScriptAndRegenerate={handleUpdateScriptAndRegenerate}
                        isRegenerating={regeneratingId === item.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Artwork Modal */}
      <ArtworkGeneratorModal
        isOpen={isArtworkOpen}
        onClose={() => setIsArtworkOpen(false)}
        defaultPrompt={sourceScript}
      />

      {/* Campaign Exporter Modal */}
      <CampaignExporterModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        sourceScript={sourceScript}
        results={results}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12 text-center text-xs text-slate-500">
        <p className="max-w-xl mx-auto">
          منصة صانع البودكاست والتعليق الصوتي متعدد اللجهات والمصممة خصيصاً للإعلانات والدعاية والتسويق الرقمي بالمغرب والعالم العربي.
        </p>
      </footer>
    </div>
  );
}
