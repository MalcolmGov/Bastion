import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice_id, model_id } = body;

    const cleanText = (text || '').trim();
    if (!cleanText) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = voice_id || process.env.ELEVENLABS_VOICE_ID || 'QeKcckTBICc3UuWL7ETc';
    const candidateModels = model_id ? [model_id] : ['eleven_turbo_v2_5', 'eleven_multilingual_v2', 'eleven_flash_v2_5'];

    if (!apiKey) {
      console.warn('[Voice Copilot TTS] ELEVENLABS_API_KEY is not set on the server.');
      return NextResponse.json({ error: 'ElevenLabs not configured', fallback: 'browser' }, { status: 503 });
    }

    for (const model of candidateModels) {
      try {
        const elevenResp = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_128&optimize_streaming_latency=2`,
          {
            method: 'POST',
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json',
              'Accept': 'audio/mpeg'
            },
            body: JSON.stringify({
              text: cleanText,
              model_id: model,
              voice_settings: {
                stability: 0.45,
                similarity_boost: 0.90,
                style: 0.35,
                use_speaker_boost: true
              }
            })
          }
        );

        if (elevenResp.ok && elevenResp.body) {
          return new Response(elevenResp.body, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Cache-Control': 'no-cache',
              'X-Voice-Provider': 'elevenlabs',
              'X-Voice-Model': model,
              'X-Voice-Id': voiceId,
              'X-Voice-Latency': 'ultra-low-streaming'
            }
          });
        } else {
          const errText = await elevenResp.text().catch(() => '');
          console.warn(`[ElevenLabs TTS] Model ${model} returned ${elevenResp.status}: ${errText.slice(0, 100)}`);
        }
      } catch (modelErr) {
        console.warn(`[ElevenLabs TTS] Error calling model ${model}:`, modelErr);
      }
    }

    return NextResponse.json({ error: 'Failed to generate ElevenLabs neural audio' }, { status: 502 });
  } catch (error: any) {
    console.error('[Voice Copilot TTS] General error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
