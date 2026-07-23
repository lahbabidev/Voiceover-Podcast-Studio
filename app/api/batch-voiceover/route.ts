import { GoogleGenAI, Modality, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { pcmToWav, pcmToMp3 } from '@/lib/audio';
import { getGeminiClient } from '@/lib/gemini';

export interface VoiceoverTarget {
  id: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  script: string;
  phoneticGuide?: string;
  audioUrl?: string; // WAV
  mp3Url?: string;   // MP3
  durationEstSec?: number;
  voiceName?: string;
}

const VOICE_MAPPING: Record<string, { male: string; female: string }> = {
  ar_darija: { male: 'Puck', female: 'Kore' },
  ar_darija_chamali: { male: 'Puck', female: 'Zephyr' },
  ar_darija_marrakchi: { male: 'Fenrir', female: 'Kore' },
  ar_darija_oujdi: { male: 'Charon', female: 'Zephyr' },
  ar_darija_hikaya: { male: 'Kore', female: 'Zephyr' },
  ber_tashelhit: { male: 'Puck', female: 'Kore' },
  ar_msa: { male: 'Kore', female: 'Zephyr' },
  fr: { male: 'Charon', female: 'Zephyr' },
  en: { male: 'Fenrir', female: 'Kore' },
  es: { male: 'Puck', female: 'Zephyr' },
};

// Helper function with exponential backoff for stable high-quality TTS generation
async function generateTTSWithRetry(
  ai: GoogleGenAI,
  text: string,
  voiceName: string,
  retries = 2
): Promise<{ wavUrl: string; mp3Url: string }> {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const ttsResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-tts-preview',
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      const rawBase64 =
        ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (rawBase64) {
        const wavUrl = pcmToWav(rawBase64, 24000, 1, 16);
        const mp3Url = pcmToMp3(rawBase64, 24000, 1, 128);
        return { wavUrl, mp3Url };
      }
    } catch (err: any) {
      console.warn(`TTS attempt ${attempt + 1} failed for voice ${voiceName}:`, err);
      const isRateLimit = err?.toString().includes('429') || err?.toString().includes('RESOURCE_EXHAUSTED') || err?.message?.includes('limit');
      if (isRateLimit) {
        console.log(`Rate limit (429) detected! Waiting 8.5 seconds before retrying...`);
        await new Promise((res) => setTimeout(res, 8500));
      }
    }
    attempt++;
    if (attempt <= retries) {
      await new Promise((res) => setTimeout(res, 1200 * attempt));
    }
  }
  return { wavUrl: '', mp3Url: '' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sourceScript,
      sourceLang = 'ar_msa',
      targetLangs = ['ar_darija', 'ar_darija_chamali', 'ar_msa', 'fr', 'en'],
      campaignType = 'ad_promo',
      tone = 'energetic_ad',
      voiceGender = 'male',
      customVoice,
      speakingSpeed = 'normal',
    } = body;

    if (!sourceScript || typeof sourceScript !== 'string' || !sourceScript.trim()) {
      return NextResponse.json(
        { error: 'الرجاء إدخال نص التعليق الصوتي' },
        { status: 400 }
      );
    }

    // Step 1: Adapt/Translate the text script into all selected target languages/dialects
    const ai = getGeminiClient(req);

    const prompt = `
You are an award-winning Moroccan & international voiceover director & advertising copywriter specializing in regional Moroccan dialects (الدارجات والأساليب المغربية الأصيلة) and international languages.

SOURCE INPUT TEXT: "${sourceScript}"
SOURCE LANGUAGE: ${sourceLang}
CAMPAIGN TYPE: ${campaignType}
TARGET TONE: ${tone}
SPEAKING SPEED: ${speakingSpeed}

Your goal is to intelligently rewrite, adapt, and translate the input text into each requested target language or dialect ID: ${targetLangs.join(', ')}.

SPECIFIC REGIONAL DIALECT RULES:

1. 'ar_darija' (الدارجة المغربية الإعلانية الحديثة - الدار البيضاء/الرباط):
   - Modern, high-conversion Moroccan radio/reels commercial script.
   - Use catchy terms like "شري دابا", "عرض خيالي", "توصيل حتال باب الدار", "كتهضر معاه ديريكت لايف Realtime", "سجل دابا واستافد من خصم".

2. 'ar_darija_chamali' (الدارجة الشمالية الأصيلة - طنجة/تطوان):
   - Authentic Northern Moroccan dialect (الشمالية).
   - Use authentic Chamali vocabulary and expressions like "فاينا كاين", "تجيشي هاد الفرصة", "ساقسي دابا وشوف العرض الخيالي ديالينا", "تطوان وطنجة وعروض شلا".

3. 'ar_darija_marrakchi' (الدارجة المراكشية والجنوبية - البهجة):
   - Warm, lively, hospitable Marrakchi / Southern Moroccan tone with humor and warmth.
   - Use terms like "مرحبا بيكم معانا", "عرض بيه البهجة", "ولا أروع مع ناس البهجة والسرور", "استافد دابا وعيش اللحظة".

4. 'ar_darija_oujdi' (الدارجة الشرقية الأصيلة - وجدة والشرق):
   - Authentic Eastern Moroccan (Oujdi) dialect.
   - Use Eastern phrasing like "غادي تشوف الحل العجيب", "نيشان وبلا دوخة", "هاكداك العرض كاين هنا".

5. 'ar_darija_hikaya' (الدارجة المغربية الحكواتية / شعبية):
   - Folkloric storytelling Moroccan voiceover style (أسلوب الحلقة والحكاية المغربية الأصيلة).
   - Use dramatic narrative hooks like "سمعوا يا السادة واللمة!", "كانت الحكاية صعيبة ولكن دابا الحل بين يديك!".

6. 'ber_tashelhit' (الأمازيغية المغربية الأصيلة - التشلحيت/السوسية):
   - Authentic Moroccan Tamazight / Tashelhit advertising script written in Arabic script for easy vocal reading or standard phrasing.

7. 'ar_msa' (العربية الفصحى الإعلانية المكتملة التشكيل):
   - Full diacritics/Tashkeel (تشكيل كامل بالحركات) for perfect audio pronunciation.

8. 'fr' (French Commercial):
   - High-impact French marketing text ("Inscrivez-vous dès maintenant", "Offre exclusive").

9. 'en' (Global English):
   - Engaging English promotional voiceover copy.

10. 'es' (Spanish Promo):
   - Energetic Spanish advertisement script.

For each target language/dialect, return a JSON object containing:
- langId (e.g. 'ar_darija', 'ar_darija_chamali', 'ar_darija_marrakchi', 'ar_darija_oujdi', 'ar_darija_hikaya', 'ber_tashelhit', 'ar_msa', 'fr', 'en', 'es')
- langNameAr (e.g. 'الدارجة المغربية الشمالية (طنجة/تطوان)', 'الدارجة المراكشية (البهجة)', etc.)
- flag (Emoji flag)
- script (The adapted script text ready for speech)
- phoneticGuide (Pro delivery & accent guidance for voice actor)
- durationEstSec (Estimated duration in seconds)
`;

    const translationResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  langId: { type: Type.STRING },
                  langNameAr: { type: Type.STRING },
                  flag: { type: Type.STRING },
                  script: { type: Type.STRING },
                  phoneticGuide: { type: Type.STRING },
                  durationEstSec: { type: Type.NUMBER },
                },
                required: ['langId', 'langNameAr', 'flag', 'script', 'phoneticGuide', 'durationEstSec'],
              },
            },
          },
          required: ['translations'],
        },
      },
    });

    let translationsData = [];
    try {
      const parsed = JSON.parse(translationResponse.text || '{}');
      translationsData = parsed.translations || [];
    } catch (e) {
      console.error('Failed to parse translation JSON', e);
      return NextResponse.json({ error: 'فشل في تحليل النص المترجم' }, { status: 500 });
    }

    // Step 2: Generate High-Res Audio for each adapted dialect script sequentially to prevent rate limits
    const resolvedResults = [];
    for (const item of translationsData) {
      const defaultVoiceConfig = VOICE_MAPPING[item.langId] || { male: 'Kore', female: 'Zephyr' };
      const voiceName = customVoice || (voiceGender === 'female' ? defaultVoiceConfig.female : defaultVoiceConfig.male);

      let ttsInstruction = '';
      if (item.langId === 'ar_darija') {
        ttsInstruction = 'Speak in an authentic, modern Moroccan radio commercial voice (Casablanca/Rabat tone): ';
      } else if (item.langId === 'ar_darija_chamali') {
        ttsInstruction = 'Speak with a charming, authentic Northern Moroccan accent (Tangier/Tetouan melody): ';
      } else if (item.langId === 'ar_darija_marrakchi') {
        ttsInstruction = 'Speak in a lively, joyful Marrakchi Moroccan commercial tone with hospitality: ';
      } else if (item.langId === 'ar_darija_oujdi') {
        ttsInstruction = 'Speak in an authentic Eastern Moroccan Oujdi accent with confident cadence: ';
      } else if (item.langId === 'ar_darija_hikaya') {
        ttsInstruction = 'Speak in a dramatic, folk Moroccan storyteller narrator voice: ';
      } else if (item.langId === 'ber_tashelhit') {
        ttsInstruction = 'Speak in a clear, warm Moroccan Tamazight commercial voiceover: ';
      } else if (item.langId === 'ar_msa') {
        ttsInstruction = 'Speak in an authoritative, fully vocalized Arabic documentary and commercial narrator tone: ';
      } else if (item.langId === 'fr') {
        ttsInstruction = 'Speak in a refined, persuasive French commercial voiceover style: ';
      } else if (item.langId === 'en') {
        ttsInstruction = 'Speak in a confident, magnetic English advertisement announcer style: ';
      } else {
        ttsInstruction = 'Say clearly and engagingly: ';
      }

      const fullTextToSpeak = `${ttsInstruction}${item.script}`;
      const { wavUrl, mp3Url } = await generateTTSWithRetry(ai, fullTextToSpeak, voiceName, 2);

      resolvedResults.push({
        id: item.langId,
        nameAr: item.langNameAr,
        nameEn: item.langId,
        flag: item.flag || '🇲🇦',
        script: item.script,
        phoneticGuide: item.phoneticGuide || '',
        audioUrl: wavUrl,
        mp3Url: mp3Url || wavUrl,
        durationEstSec: item.durationEstSec || Math.ceil(item.script.split(' ').length / 2.5),
        voiceName: voiceName,
      });

      // Brief spacer delay between successive requests to prevent API burst limits
      await new Promise((res) => setTimeout(res, 1200));
    }

    return NextResponse.json({
      success: true,
      data: resolvedResults,
      meta: {
        campaignType,
        tone,
        voiceGender,
        speakingSpeed,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Batch Voiceover API Error:', error);
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ أثناء إنشاء التعليق الصوتي' },
      { status: 500 }
    );
  }
}
