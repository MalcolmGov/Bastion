import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import { codeResultsPublication, type CodeProvider } from '@/lib/results/codeAssistant';

export const runtime = 'nodejs';

const PROVIDERS = new Set<CodeProvider>(['anthropic', 'openai', 'gemini', 'deepseek', 'qwen']);

function serverKey(provider: CodeProvider): string | undefined {
  if (provider === 'anthropic') return process.env.ANTHROPIC_API_KEY;
  if (provider === 'openai') return process.env.OPENAI_API_KEY;
  if (provider === 'gemini') return process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (provider === 'deepseek') return process.env.DEEPSEEK_API_KEY;
  return process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY || process.env.OPENROUTER_API_KEY;
}

export async function POST(req: NextRequest) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  try {
    const body = await req.json();
    const provider = PROVIDERS.has(body.provider) ? body.provider as CodeProvider : 'anthropic';
    const prompt = String(body.prompt || '').trim();
    const html = String(body.html || '');
    if (!prompt) return NextResponse.json({ error: 'Tell the assistant what to change in the page.' }, { status: 400 });
    if (!html.includes('<html')) return NextResponse.json({ error: 'The publication HTML is not ready yet.' }, { status: 400 });
    if (html.length > 400_000) return NextResponse.json({ error: 'This publication is too large to edit in one pass.' }, { status: 400 });

    const userKey = typeof body.userApiKey === 'string' ? body.userApiKey.trim() : '';
    const history = Array.isArray(body.history)
      ? body.history
        .filter((turn: { role?: string; content?: string }) => (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string')
        .slice(-6)
        .map((turn: { role: 'user' | 'assistant'; content: string }) => ({
          role: turn.role,
          content: turn.content.slice(0, 4000),
        }))
      : [];

    const result = await codeResultsPublication({
      provider,
      modelId: String(body.modelId || ''),
      prompt: prompt.slice(0, 4000),
      html,
      apiKey: userKey || serverKey(provider),
      history,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'The coding assistant failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
