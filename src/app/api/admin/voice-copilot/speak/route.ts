import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { TTS_LIMITS } from '@/lib/copilot/ttsLimits';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { spendBudget } from '@/lib/security/usageBudget';

// The server picks the voice and the models, never the caller: both go straight into the request to ElevenLabs.
const DEFAULT_VOICE_ID = 'QeKcckTBICc3UuWL7ETc';
const CANDIDATE_MODELS = ['eleven_turbo_v2_5', 'eleven_flash_v2_5', 'eleven_multilingual_v2'];

/** The browser falls back to its own voice on any refusal, so a limit never leaves the assistant silent. */
function tooMany(retryAfterSec: number, message: string) {
  return NextResponse.json({ error: message }, { status: 429, headers: { 'Retry-After': String(Math.max(1, retryAfterSec)) } });
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;

    // Limits belong to the signed-in person: an address is something a caller can change.
    const who = `tts:${gate.user.id}`;
    const burst = checkRateLimit(who, TTS_LIMITS.requestsPerMinute, 60 * 1000);
    if (!burst.allowed) return tooMany(burst.retryAfterSec, 'Too many voice requests. Please wait a moment.');

    const body = await req.json();
    const cleanText = typeof body?.text === 'string' ? body.text.trim() : '';
    if (!cleanText) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    if (cleanText.length > TTS_LIMITS.maxCharsPerRequest) {
      return NextResponse.json({ error: `Text is too long to speak (at most ${TTS_LIMITS.maxCharsPerRequest} characters).` }, { status: 413 });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.warn('[Voice Copilot TTS] ELEVENLABS_API_KEY is not set on the server.');
      return NextResponse.json({ error: 'ElevenLabs not configured' }, { status: 503 });
    }

    const spend = spendBudget(who, cleanText.length, TTS_LIMITS.charBudgets);
    if (!spend.allowed) return tooMany(spend.retryAfterSec, 'The neural voice allowance for your account is used up for now.');

    const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

    for (const model of CANDIDATE_MODELS) {
      try {
        const elevenResp = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?optimize_streaming_latency=3`,
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
                stability: 0.38,
                similarity_boost: 0.86,
                style: 0.28,
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
