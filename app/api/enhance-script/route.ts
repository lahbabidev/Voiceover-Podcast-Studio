import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { script, tone = 'energetic_ad', targetLang = 'ar_darija' } = await req.json();

    if (!script || typeof script !== 'string' || !script.trim()) {
      return NextResponse.json({ error: 'الرجاء توفير النص' }, { status: 400 });
    }

    const ai = getGeminiClient(req);

    const prompt = `
You are an elite voiceover direction & speech synthesis expert.
Your task is to take this voiceover script and enhance its delivery performance for AI text-to-speech engine.

RAW SCRIPT: "${script}"
TARGET STYLE: ${tone}
TARGET LANGUAGE/DIALECT: ${targetLang}

Rules for enhancement:
1. If the language is Arabic/Darija: Add full or crucial diacritics (حركات وتشكيل) to eliminate any ambiguity in Arabic AI speech pronunciation.
2. Optimize punctuation for natural vocal pauses (using commas, periods, and exclamations appropriately for breathing).
3. If Moroccan Darija: Ensure authentic Moroccan promo phrasing that flows naturally when spoken aloud.
4. Keep the core meaning intact while making it sound significantly more professional, engaging, and ready for commercial radio/Instagram ads.

Return ONLY the enhanced vocalized text. Do not add markdown commentary around it.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });


    const enhancedScript = response.text?.trim() || script;

    return NextResponse.json({
      success: true,
      enhancedScript,
    });
  } catch (error: any) {
    console.error('Enhance Script Error:', error);
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ أثناء تحسين النص' },
      { status: 500 }
    );
  }
}
