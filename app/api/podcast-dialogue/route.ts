import { Modality } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { pcmToWav } from '@/lib/audio';
import { getGeminiClient } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { topic, lang = 'ar_darija', style = 'podcast_interview' } = await req.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'الرجاء توفير موضوع البودكاست' }, { status: 400 });
    }

    const ai = getGeminiClient(req);

    // Step 1: Generate dialogue script
    const prompt = `
Create a compelling 2-speaker short podcast segment (around 4-6 dialogue exchanges) about: "${topic}".
Language requested: ${lang} (If 'ar_darija', use authentic Moroccan Darija for both speakers. If 'ar_msa', use formal Arabic. If 'fr', use French. If 'en', use English).
Speaker 1: Joe (Host / المذيع)
Speaker 2: Jane (Guest / الضيف)

Format the dialogue text strictly as:
Joe: [line]
Jane: [line]
`;

    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    const scriptText = scriptResponse.text || '';

    // Step 2: Multi-speaker TTS with retry logic
    const ttsPrompt = `TTS the following conversation between Joe and Jane:\n${scriptText}`;

    let audioDataUrl = '';
    let attempts = 0;
    while (attempts <= 2) {
      try {
        const ttsResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: ttsPrompt }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              multiSpeakerVoiceConfig: {
                speakerVoiceConfigs: [
                  {
                    speaker: 'Joe',
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                  },
                  {
                    speaker: 'Jane',
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                    },
                  },
                ],
              },
            },
          },
        });

        const rawBase64 =
          ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (rawBase64) {
          audioDataUrl = pcmToWav(rawBase64, 24000, 1, 16);
          break;
        }
      } catch (e: any) {
        console.warn(`Multi-speaker TTS attempt ${attempts + 1} failed:`, e);
        const isRateLimit = e?.toString().includes('429') || e?.toString().includes('RESOURCE_EXHAUSTED') || e?.message?.includes('limit');
        if (isRateLimit) {
          console.log(`Rate limit (429) detected in podcast generation! Waiting 8.5 seconds before retrying...`);
          await new Promise((res) => setTimeout(res, 8500));
        }
      }
      attempts++;
      if (attempts <= 2) {
        await new Promise((res) => setTimeout(res, 1500 * attempts));
      }
    }

    return NextResponse.json({
      success: true,
      script: scriptText,
      audioUrl: audioDataUrl,
    });
  } catch (error: any) {
    console.error('Podcast Dialogue Error:', error);
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ أثناء حوار البودكاست' },
      { status: 500 }
    );
  }
}
