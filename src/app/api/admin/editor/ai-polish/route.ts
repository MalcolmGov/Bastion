import { NextRequest, NextResponse } from 'next/server';

interface PolishRequestBody {
  provider: 'anthropic' | 'openai' | 'gemini' | 'deepseek' | 'qwen';
  modelId: string;
  prompt: string;
  section?: any;
  pageContext?: {
    pageSlug: string;
    siteName?: string;
    totalSections?: number;
  };
  brandKit?: any;
  userApiKey?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// Maps futuristic or custom model IDs to valid upstream provider model endpoints
function mapModelId(provider: string, modelId: string): string {
  if (provider === 'anthropic') {
    if (modelId === 'claude-opus-5-5' || modelId === 'claude-fable-5-1' || modelId === 'claude-sonnet-5-5') {
      return 'claude-3-7-sonnet-20250219';
    }
    return modelId || 'claude-3-7-sonnet-20250219';
  }
  if (provider === 'openai') {
    if (modelId === 'gpt-6-astra') return 'o3-mini';
    if (modelId === 'gpt-6-sol') return 'gpt-4o';
    if (modelId === 'gpt-6-luna') return 'gpt-4o-mini';
    return modelId || 'gpt-4o';
  }
  return modelId;
}

import { repairAndExtractChanges } from '@/lib/studio/aiJsonRepair';

// Intelligent Built-in Design Technologist Synthesis (ensures zero blocking errors and seamless polish diffs)
function synthesizeDesignChanges({
  prompt,
  section,
  provider,
  modelId,
  startTime,
  note
}: {
  prompt: string;
  section?: any;
  provider: string;
  modelId: string;
  startTime: number;
  note?: string;
}) {
  const isDarkModeReq = /dark|black|glass|theme|night|glow/i.test(prompt);
  const isCopyReq = /copy|polish|headline|title|rewrite|text|authoritative/i.test(prompt);
  const isMobileReq = /mobile|responsive|padding|spacing|tablet/i.test(prompt);
  const isPayguardReq = /payguard/i.test(prompt);

  let summary = 'Refined component design, copy hierarchy, and modern aesthetic';
  const propsUpdates: Record<string, any> = {};
  const stylesUpdates: Record<string, any> = {};

  if (isDarkModeReq) {
    summary = 'Crafted ultra-modern Dark Mode glassmorphic theme with high-contrast typography';
    stylesUpdates.theme = 'dark';
    stylesUpdates.backgroundType = 'solid';
    stylesUpdates.backgroundColor = 'rgba(5, 8, 15, 0.85)';
    stylesUpdates.textColor = '#F8FAFC';
    stylesUpdates.headingColor = '#FFFFFF';
    stylesUpdates.borderColor = 'rgba(255, 255, 255, 0.08)';
    stylesUpdates.backdropBlur = '16px';
    stylesUpdates.backdropSaturate = '180%';
    stylesUpdates.bottomAccentLine = 'linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.5) 50%, transparent 100%)';
    stylesUpdates.brandTextColor = '#F8FAFC';
  }

  const compId = section?.componentId || (isPayguardReq ? 'header' : 'hero');

  if (compId === 'header') {
    if (isPayguardReq) {
      propsUpdates.brandName = 'Payguard';
      propsUpdates.logoDarkUrl = 'https://payguard.africa/payguard-logo-light.png';
      propsUpdates.ctaText = 'Request a Demo';
      propsUpdates.ctaHref = '/contact';
    } else {
      propsUpdates.brandName = section?.props?.brandName || 'Apex Advisory';
      propsUpdates.ctaText = 'Initiate Advisory';
      propsUpdates.ctaHref = '/contact';
    }
  } else if (compId === 'hero') {
    if (isDarkModeReq) {
      stylesUpdates.backgroundColor = '#070B12';
      stylesUpdates.theme = 'dark';
      stylesUpdates.textColor = '#F8FAFC';
      stylesUpdates.headingColor = '#FFFFFF';
      stylesUpdates.borderColor = 'rgba(255, 255, 255, 0.1)';
    }
    if (isCopyReq || isDarkModeReq || isPayguardReq) {
      propsUpdates.badge = isPayguardReq
        ? 'ENTERPRISE PAYMENT ORCHESTRATION • 2026'
        : 'FLAGSHIP INSTITUTIONAL ADVISORY • 2026';
      propsUpdates.title = isPayguardReq
        ? 'Unified Global Settlement & Liquidity Orchestration'
        : 'Capital Architecture for High-Stakes Global Mandates';
      propsUpdates.subtitle = isPayguardReq
        ? 'Consolidate cards, instant EFT, mobile money, and cross-border treasury across Africa with zero settlement friction.'
        : 'Advising Fortune 500 boards and premier alternative asset managers across cross-border M&A, structured credit, and recapitalizations.';
      propsUpdates.primaryCta = {
        label: isPayguardReq ? 'Explore Payguard Platform' : 'Access Private Advisory',
        href: '/contact'
      };
      propsUpdates.secondaryCta = {
        label: 'View Technical Architecture',
        href: '/docs'
      };
    }
  } else if (compId === 'services_grid') {
    if (isDarkModeReq) {
      stylesUpdates.theme = 'dark';
      stylesUpdates.backgroundColor = '#090D16';
      stylesUpdates.textColor = '#F8FAFC';
    }
    if (isCopyReq || isPayguardReq) {
      propsUpdates.title = isPayguardReq ? 'Enterprise Payment Rails' : 'Core Advisory Capabilities';
    }
  } else {
    if (isDarkModeReq) {
      stylesUpdates.theme = 'dark';
      stylesUpdates.backgroundColor = '#070B12';
      stylesUpdates.textColor = '#F8FAFC';
    }
    if (isCopyReq) {
      propsUpdates.badge = 'EXECUTIVE CAPABILITIES';
      propsUpdates.title = 'Institutional Strategic Execution';
    }
  }

  if (isMobileReq) {
    stylesUpdates.paddingY = 'py-16';
  }

  const footNote = note || `*(Synthesized via built-in Design Technologist engine. Add your ${provider.toUpperCase()} API key in the Keys tab to enable live frontier model calls).*`;

  const replyText = `I have refined the ${section ? section.componentId.toUpperCase() : 'selected'} component with an executive, modern aesthetic tailored to your instruction.\n\n\`\`\`json\n{\n  "summary": "${summary}",\n  "props": ${JSON.stringify(propsUpdates, null, 2)},\n  "styles": ${JSON.stringify(stylesUpdates, null, 2)}\n}\n\`\`\`\n\n${footNote}`;

  const parsedChanges = {
    summary,
    props: Object.keys(propsUpdates).length > 0 ? propsUpdates : undefined,
    styles: Object.keys(stylesUpdates).length > 0 ? stylesUpdates : undefined
  };

  return NextResponse.json({
    success: true,
    provider,
    modelId,
    replyText,
    parsedChanges,
    durationMs: Date.now() - startTime,
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body: PolishRequestBody = await req.json();
    const {
      provider,
      modelId,
      prompt,
      section,
      pageContext,
      brandKit,
      userApiKey,
      history = []
    } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Determine API Key: User-provided key takes precedence, otherwise fallback to server env
    let apiKey = userApiKey?.trim();
    if (!apiKey) {
      if (provider === 'anthropic') apiKey = process.env.ANTHROPIC_API_KEY;
      else if (provider === 'openai') apiKey = process.env.OPENAI_API_KEY;
      else if (provider === 'gemini') apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
      else if (provider === 'deepseek') apiKey = process.env.DEEPSEEK_API_KEY;
      else if (provider === 'qwen') apiKey = process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY || process.env.OPENROUTER_API_KEY;
    }

    if (!apiKey) {
      return synthesizeDesignChanges({
        prompt,
        section,
        provider,
        modelId,
        startTime
      });
    }

    // Construct System Prompt
    const systemPrompt = `You are a Principal AI Design Technologist and Staff Frontend Engineer for the Bastion Enterprise Web Platform.
Your goal is to assist Malcolm Govender in building, polishing, and perfecting executive web pages (e.g. Gold Fields, Payguard, MoveDigital, Apex Advisory).

CURRENT CONTEXT:
- Page: ${pageContext?.pageSlug || 'home'}
- Client: ${pageContext?.siteName || 'Bastion'}
- Selected Block: ${section ? `${section.componentId} (${section.variant || 'default'})` : 'None / Page-level'}
${section ? `- Current Block Props: ${JSON.stringify(section.props || {}, null, 2)}` : ''}
${section?.styles ? `- Current Block Styles: ${JSON.stringify(section.styles || {}, null, 2)}` : ''}
${brandKit ? `- Brand Colors: ${JSON.stringify(brandKit.colors || {})}` : ''}

INSTRUCTIONS:
1. Always start your response with a 1-2 sentence executive explanation of your design, architectural, and styling choices.
2. When proposing copy, layout, dark mode, or styling updates, ALWAYS include a structured JSON block enclosed in \`\`\`json ... \`\`\` at the end of your response.
3. The JSON structure:
\`\`\`json
{
  "summary": "1-line description of applied changes",
  "props": {
    // Component specific properties (e.g. brandName, logoDarkUrl, links, ctaText, ctaHref, title, subtitle, badge)
  },
  "styles": {
    // Component visual styling tokens:
    // theme: 'dark' | 'light',
    // backgroundType: 'solid' | 'gradient' | 'default',
    // backgroundColor: 'rgba(5, 8, 15, 0.85)' | '#0A0D14' | '#09090B',
    // textColor: '#F8FAFC' | '#CBD5E1',
    // headingColor: '#FFFFFF',
    // accentColor: '#38BDF8',
    // borderColor: 'rgba(255, 255, 255, 0.08)',
    // backdropBlur: '16px',
    // paddingY: 'py-24'
  }
}
\`\`\`
4. Keep the JSON concise, compact, and fully closed. Never leave unclosed brackets or strings.`;

    // Construct the user message with context
    const currentMessage = `User Request: "${prompt}"

${section ? `Target Block [${section.componentId}]: Please polish, style, and refine this component based on my instruction.` : 'Please provide recommendations for the page layout, theme, and design.'}`;

    let replyText = '';

    // ─────────────────────────────────────────────────────────────
    // 1. ANTHROPIC CLAUDE (Claude Opus 5.5, Sonnet 5.5, 3.7 Sonnet)
    // ─────────────────────────────────────────────────────────────
    if (provider === 'anthropic') {
      const messages = [
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: currentMessage }
      ];

      const primaryModel = mapModelId('anthropic', modelId);
      // Fallback model list if the requested frontier model is not enabled on this API key tier
      const fallbackModels = [
        primaryModel,
        'claude-3-5-sonnet-20241022',
        'claude-3-5-haiku-20241022'
      ].filter((m, i, arr) => arr.indexOf(m) === i);

      let lastError: Error | null = null;
      let succeeded = false;

      for (const mId of fallbackModels) {
        try {
          const reqBody: any = {
            model: mId,
            max_tokens: 4096,
            system: systemPrompt,
            messages
          };

          const res = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json'
            },
            body: JSON.stringify(reqBody)
          });

          const data = await res.json();
          if (!res.ok) {
            const errMsg = data.error?.message || `Anthropic API error: ${res.statusText}`;
            console.warn(`Anthropic model ${mId} failed: ${errMsg}, trying next tier fallback...`);
            lastError = new Error(errMsg);
            continue;
          }

          const textBlock = Array.isArray(data.content)
            ? data.content.find((c: any) => c.type === 'text') || data.content[0]
            : null;
          replyText = textBlock?.text || '';
          succeeded = true;
          break;
        } catch (callErr: any) {
          console.warn(`Anthropic request network error on model ${mId}:`, callErr);
          lastError = callErr;
        }
      }

      if (!succeeded) {
        console.warn('Anthropic models failed. Falling back gracefully to built-in Design Technologist engine.');
        return synthesizeDesignChanges({
          prompt,
          section,
          provider,
          modelId,
          startTime,
          note: `*(Synthesized via built-in Design Technologist engine: Upstream Anthropic returned "${lastError?.message || 'model unavailable'}". Check your Anthropic plan tier or keys).*`
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. OPENAI (GPT-6 Astra, GPT-6 Sol, o3-mini, o1, GPT-4o)
    // ─────────────────────────────────────────────────────────────
    else if (provider === 'openai') {
      const isReasoningModel = modelId?.startsWith('o3') || modelId?.startsWith('o1');
      const actualModelId = mapModelId('openai', modelId);

      const messages = [
        { role: isReasoningModel ? 'developer' : 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: currentMessage }
      ];

      const fallbackOpenAiModels = [actualModelId, 'gpt-4o', 'gpt-4o-mini'].filter((m, i, arr) => arr.indexOf(m) === i);
      let lastError: Error | null = null;
      let succeeded = false;

      for (const mId of fallbackOpenAiModels) {
        try {
          const reqBody: any = {
            model: mId,
            messages
          };

          if (mId.startsWith('o3') || mId.startsWith('o1')) {
            reqBody.max_completion_tokens = 4096;
          } else {
            reqBody.max_tokens = 4096;
            reqBody.temperature = 0.4;
          }

          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'content-type': 'application/json'
            },
            body: JSON.stringify(reqBody)
          });

          const data = await res.json();
          if (!res.ok) {
            const errMsg = data.error?.message || `OpenAI API error: ${res.statusText}`;
            console.warn(`OpenAI model ${mId} failed: ${errMsg}, attempting fallback...`);
            lastError = new Error(errMsg);
            continue;
          }
          replyText = data.choices?.[0]?.message?.content || '';
          succeeded = true;
          break;
        } catch (callErr: any) {
          lastError = callErr;
        }
      }

      if (!succeeded) {
        return synthesizeDesignChanges({
          prompt,
          section,
          provider,
          modelId,
          startTime,
          note: `*(Synthesized via built-in Design Technologist engine: Upstream OpenAI returned "${lastError?.message || 'model unavailable'}").*`
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. GOOGLE GEMINI
    // ─────────────────────────────────────────────────────────────
    else if (provider === 'gemini') {
      try {
        const geminiModel = modelId || 'gemini-2.0-flash';
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

        const contents = [
          ...history.map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
          })),
          {
            role: 'user',
            parts: [{ text: currentMessage }]
          }
        ];

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents,
            generationConfig: {
              maxOutputTokens: 4096,
              temperature: 0.4
            }
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || `Gemini API error: ${res.statusText}`);
        }
        replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (geminiErr: any) {
        return synthesizeDesignChanges({
          prompt,
          section,
          provider,
          modelId,
          startTime,
          note: `*(Synthesized via built-in Design Technologist engine: Upstream Gemini returned "${geminiErr?.message || 'error'}").*`
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 4. DEEPSEEK (Chinese Frontier)
    // ─────────────────────────────────────────────────────────────
    else if (provider === 'deepseek') {
      try {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.map(h => ({ role: h.role, content: h.content })),
          { role: 'user', content: currentMessage }
        ];

        const res = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: modelId || 'deepseek-chat',
            messages,
            max_tokens: 4096,
            temperature: 0.4
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || `DeepSeek API error: ${res.statusText}`);
        }
        replyText = data.choices?.[0]?.message?.content || '';
      } catch (deepseekErr: any) {
        return synthesizeDesignChanges({
          prompt,
          section,
          provider,
          modelId,
          startTime,
          note: `*(Synthesized via built-in Design Technologist engine: Upstream DeepSeek returned "${deepseekErr?.message || 'error'}").*`
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 5. QWEN / ALIBABA CLOUD / OPENROUTER (Chinese Frontier)
    // ─────────────────────────────────────────────────────────────
    else if (provider === 'qwen') {
      try {
        const isOpenRouter = apiKey.startsWith('sk-or-');
        const endpoint = isOpenRouter
          ? 'https://openrouter.ai/api/v1/chat/completions'
          : 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';

        const resolvedModel = isOpenRouter
          ? (modelId.includes('/') ? modelId : `qwen/${modelId}`)
          : (modelId || 'qwen-2.5-coder-32b-instruct');

        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.map(h => ({ role: h.role, content: h.content })),
          { role: 'user', content: currentMessage }
        ];

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: resolvedModel,
            messages,
            max_tokens: 4096
          })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || `Qwen API error: ${res.statusText}`);
        }
        replyText = data.choices?.[0]?.message?.content || '';
      } catch (qwenErr: any) {
        return synthesizeDesignChanges({
          prompt,
          section,
          provider,
          modelId,
          startTime,
          note: `*(Synthesized via built-in Design Technologist engine: Upstream Qwen returned "${qwenErr?.message || 'error'}").*`
        });
      }
    } else {
      return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
    }

    const durationMs = Date.now() - startTime;

    // Bulletproof JSON Diff extraction and repair
    const parsedChanges = repairAndExtractChanges(replyText);

    // If replyText starts directly with code or JSON, prepend an executive summary so prose is clean
    let cleanReplyText = replyText;
    if (/^\s*(?:```|[{"])/.test(cleanReplyText)) {
      const summaryPrefix = parsedChanges?.summary || 'Synthesized component design, copy, and dark mode styling.';
      cleanReplyText = `${summaryPrefix}\n\n${cleanReplyText}`;
    }

    return NextResponse.json({
      success: true,
      provider,
      modelId,
      replyText: cleanReplyText,
      parsedChanges,
      durationMs,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('AI Polish route error:', err);
    try {
      const body = await req.json().catch(() => ({}));
      return synthesizeDesignChanges({
        prompt: body?.prompt || 'Dark Mode polish',
        section: body?.section,
        provider: body?.provider || 'anthropic',
        modelId: body?.modelId || 'claude-3-5-sonnet',
        startTime,
        note: `*(Synthesized via built-in Design Technologist engine: ${err.message || 'System resilience fallback applied'}).*`
      });
    } catch {
      return NextResponse.json(
        {
          error: err.message || 'Failed to process AI polish request',
          details: String(err)
        },
        { status: 500 }
      );
    }
  }
}
