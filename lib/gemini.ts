import { GoogleGenAI } from '@google/genai';
import { NextRequest } from 'next/server';

/**
 * Gets a GoogleGenAI client instance.
 * If a custom API key is supplied in the request headers (x-gemini-api-key), it will use that.
 * Otherwise, it falls back to the system's GEMINI_API_KEY.
 */
export function getGeminiClient(req?: NextRequest): GoogleGenAI {
  let apiKey = process.env.GEMINI_API_KEY;

  if (req) {
    const customKey = req.headers.get('x-gemini-api-key');
    if (customKey && customKey.trim().length > 0) {
      apiKey = customKey.trim();
    }
  }

  return new GoogleGenAI({
    apiKey: apiKey || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}
