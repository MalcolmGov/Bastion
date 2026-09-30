import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
      return NextResponse.json({ valid: false, error: 'API key is required' }, { status: 400 });
    }

    const key = apiKey.trim();
    const startTime = Date.now();

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        method: 'GET',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01'
        }
      });
      const durationMs = Date.now() - startTime;
      if (res.ok) {
        return NextResponse.json({ valid: true, latencyMs: durationMs, provider: 'Anthropic Claude' });
      }
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({
        valid: false,
        error: err.error?.message || `Anthropic returned ${res.status}`
      });
    }

    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: { Authorization: `Bearer ${key}` }
      });
      const durationMs = Date.now() - startTime;
      if (res.ok) {
        return NextResponse.json({ valid: true, latencyMs: durationMs, provider: 'OpenAI' });
      }
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({
        valid: false,
        error: err.error?.message || `OpenAI returned ${res.status}`
      });
    }

    if (provider === 'gemini') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`, {
        method: 'GET'
      });
      const durationMs = Date.now() - startTime;
      if (res.ok) {
        return NextResponse.json({ valid: true, latencyMs: durationMs, provider: 'Google Gemini' });
      }
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({
        valid: false,
        error: err.error?.message || `Google Gemini returned ${res.status}`
      });
    }

    if (provider === 'deepseek') {
      const res = await fetch('https://api.deepseek.com/models', {
        method: 'GET',
        headers: { Authorization: `Bearer ${key}` }
      });
      const durationMs = Date.now() - startTime;
      if (res.ok) {
        return NextResponse.json({ valid: true, latencyMs: durationMs, provider: 'DeepSeek' });
      }
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({
        valid: false,
        error: err.error?.message || `DeepSeek returned ${res.status}`
      });
    }

    if (provider === 'qwen') {
      const isOpenRouter = key.startsWith('sk-or-');
      const testUrl = isOpenRouter
        ? 'https://openrouter.ai/api/v1/models'
        : 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/models';

      const res = await fetch(testUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${key}` }
      });
      const durationMs = Date.now() - startTime;
      if (res.ok) {
        return NextResponse.json({
          valid: true,
          latencyMs: durationMs,
          provider: isOpenRouter ? 'OpenRouter (Qwen)' : 'Alibaba DashScope (Qwen)'
        });
      }
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({
        valid: false,
        error: err.error?.message || `Qwen service returned ${res.status}`
      });
    }

    return NextResponse.json({ valid: false, error: `Unknown provider: ${provider}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ valid: false, error: err.message || 'Connection test failed' }, { status: 500 });
  }
}
