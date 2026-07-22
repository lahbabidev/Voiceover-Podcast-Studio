import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio = '1:1' } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'الرجاء توفير وصف الصورة' }, { status: 400 });
    }

    const enhancedPrompt = `High quality commercial product advertisement artwork, podcast cover banner, modern digital studio style: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [{ text: enhancedPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let imageUrl = '';
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ error: 'لم يتم إنشاء صورة' }, { status: 500 });
    }

    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('Image Generation Error:', error);
    return NextResponse.json(
      { error: error?.message || 'حدث خطأ أثناء إنشاء الصورة الإعلانية' },
      { status: 500 }
    );
  }
}
