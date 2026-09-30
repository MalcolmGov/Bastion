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

export async function POST(req: NextRequest) {
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
      return NextResponse.json(
        {
          error: `No API key found for ${provider.toUpperCase()}. Please add your API key in the 'API Keys' tab.`,
          requiresApiKey: true,
          provider
        },
        { status: 400 }
      );
    }

    // Construct System Prompt
    const systemPrompt = `You are a Principal AI Design Technologist and Staff Frontend Engineer for the Bastion Enterprise Web Platform.
Your goal is to assist Malcolm Govender in building, polishing, and perfecting executive web pages (e.g. Gold Fields, MoveDigital, Apex Advisory).

CURRENT CONTEXT:
- Page: ${pageContext?.pageSlug || 'home'}
- Client: ${pageContext?.siteName || 'Gold Fields / Bastion'}
- Selected Block: ${section ? `${section.componentId} (${section.variant || 'default'})` : 'None / Page-level'}
${section ? `- Current Block Props: ${JSON.stringify(section.props || {}, null, 2)}` : ''}
${section?.styles ? `- Current Block Styles: ${JSON.stringify(section.styles || {}, null, 2)}` : ''}
${brandKit ? `- Brand Colors: ${JSON.stringify(brandKit.colors || {})}` : ''}

INSTRUCTIONS:
1. Provide a professional, concise, articulate explanation of your design and architectural recommendations.
2. When proposing copy, layout, or styling updates, ALWAYS include a structured JSON block enclosed in \`\`\`json ... \`\`\` at the end of your response.
3. The JSON format should follow:
\`\`\`json
{
  "summary": "1-line description of applied changes",
  "props": {
    // Only include properties you are modifying or adding (e.g. title, subtitle, description, badge, primaryCta, items)
  },
  "styles": {
    // Optional style changes (e.g. backgroundType: 'solid'|'gradient'|'pattern', backgroundColor, gradient, accentColor, paddingY)
  }
}
\`\`\`
4. Keep the copy punchy, authoritative, investor-grade, and modern (Linear/Framer/Stripe aesthetic). Never use cliché generic placeholders.`;

    // Construct the user message with context
    const currentMessage = `User Request: "${prompt}"

${section ? `Target Block [${section.componentId}]: Please polish and refine this component based on my instruction.` : 'Please provide recommendations for the page layout and design.'}`;

    let replyText = '';
    const startTime = Date.now();

    // ─────────────────────────────────────────────────────────────
    // 1. ANTHROPIC CLAUDE (Claude 3.7 Sonnet, 3.5 Sonnet, 3.5 Haiku, 3 Opus)
    // ─────────────────────────────────────────────────────────────
    if (provider === 'anthropic') {
      const messages = [
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: currentMessage }
      ];

      const isThinking = modelId?.includes('thinking');
      const actualModelId = isThinking ? 'claude-3-7-sonnet-20250219' : (modelId || 'claude-3-7-sonnet-20250219');

      const reqBody: any = {
        model: actualModelId,
        max_tokens: isThinking ? 4096 : 2048,
        system: systemPrompt,
        messages
      };

      if (isThinking) {
        reqBody.thinking = { type: 'enabled', budget_tokens: 2048 };
      }

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
        throw new Error(data.error?.message || `Anthropic API error: ${res.statusText}`);
      }

      // Extract text content, skipping internal thinking blocks if present
      const textBlock = Array.isArray(data.content)
        ? data.content.find((c: any) => c.type === 'text') || data.content[0]
        : null;
      replyText = textBlock?.text || '';
    }

    // ─────────────────────────────────────────────────────────────
    // 2. OPENAI (GPT-6 Astra, GPT-6 Sol, GPT-6 Luna, o3-mini, o1, GPT-4o)
    // ─────────────────────────────────────────────────────────────
    else if (provider === 'openai') {
      const isReasoningModel = modelId?.startsWith('o3') || modelId?.startsWith('o1');
      const isGpt6 = modelId?.startsWith('gpt-6');
      const isGpt45 = modelId?.startsWith('gpt-4.5');

      // o1/o3 reasoning models use developer/system messages or user formatting
      const messages = [
        { role: isReasoningModel ? 'developer' : 'system', content: systemPrompt },
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: currentMessage }
      ];

      const reqBody: any = {
        model: modelId || 'gpt-6-astra',
        messages
      };

      if (isReasoningModel) {
        reqBody.max_completion_tokens = 2048;
        // Reasoning models do not accept temperature
      } else {
        reqBody.max_tokens = isGpt6 || isGpt45 ? 3072 : 2048;
        reqBody.temperature = 0.5;
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
        throw new Error(data.error?.message || `OpenAI API error: ${res.statusText}`);
      }
      replyText = data.choices?.[0]?.message?.content || '';
    }

    // ─────────────────────────────────────────────────────────────
    // 3. GOOGLE GEMINI
    // ─────────────────────────────────────────────────────────────
    else if (provider === 'gemini') {
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
            maxOutputTokens: 2048,
            temperature: 0.4
          }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `Gemini API error: ${res.statusText}`);
      }
      replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    // ─────────────────────────────────────────────────────────────
    // 4. DEEPSEEK (Chinese Frontier)
    // ─────────────────────────────────────────────────────────────
    else if (provider === 'deepseek') {
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
          max_tokens: 2048,
          temperature: 0.4
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `DeepSeek API error: ${res.statusText}`);
      }
      replyText = data.choices?.[0]?.message?.content || '';
    }

    // ─────────────────────────────────────────────────────────────
    // 5. QWEN / ALIBABA CLOUD / OPENROUTER (Chinese Frontier)
    // ─────────────────────────────────────────────────────────────
    else if (provider === 'qwen') {
      // Check whether user uses DashScope or OpenRouter key format
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
          max_tokens: 2048
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `Qwen API error: ${res.statusText}`);
      }
      replyText = data.choices?.[0]?.message?.content || '';
    } else {
      return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
    }

    const durationMs = Date.now() - startTime;

    // Parse structured JSON diff if present in markdown code block
    let parsedChanges: { summary?: string; props?: Record<string, any>; styles?: Record<string, any> } | null = null;
    const jsonMatch = replyText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedChanges = JSON.parse(jsonMatch[1]);
      } catch (parseErr) {
        console.warn('Could not parse JSON diff from model output:', parseErr);
      }
    }

    return NextResponse.json({
      success: true,
      provider,
      modelId,
      replyText,
      parsedChanges,
      durationMs,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('AI Polish route error:', err);
    return NextResponse.json(
      {
        error: err.message || 'Failed to process AI polish request',
        details: String(err)
      },
      { status: 500 }
    );
  }
}
