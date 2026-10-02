import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/guard';

export async function GET() {
  const gate = await requirePermission('content:edit');
  if (!gate.ok) return gate.response;
  // Only expose availability. Credentials stay in the existing server configuration.
  const providers = [
    ['openai', process.env.OPENAI_API_KEY],
    ['anthropic', process.env.ANTHROPIC_API_KEY],
    ['gemini', process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY],
    ['deepseek', process.env.DEEPSEEK_API_KEY],
    [
      'qwen',
      process.env.DASHSCOPE_API_KEY ||
        process.env.QWEN_API_KEY ||
        process.env.OPENROUTER_API_KEY,
    ],
  ]
    .filter(([, key]) => !!key)
    .map(([name]) => name);
  return NextResponse.json(
    { providers },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
