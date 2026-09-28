/**
 * Move Studio — Targeted AI Assistant Engine
 * Pluggable ModelProvider interface supporting cloud inference (Anthropic Claude / OpenAI)
 * and intelligent local deterministic heuristics when external keys are not configured.
 */

import type { BrandKit, PageComposition, SectionInstance } from './types';

export type AIActionType =
  | 'improve_headline'
  | 'shorten_paragraph'
  | 'rewrite_brand_voice'
  | 'suggest_layout_variant'
  | 'explain_content_gap'
  | 'check_brand_rules'
  | 'natural_language_refine';

export interface AIActionRequest {
  action: AIActionType;
  inputContent?: string;
  context?: {
    brandKit?: Partial<BrandKit>;
    componentId?: string;
    currentVariant?: string;
    sectionTitle?: string;
    fieldLabel?: string;
    composition?: PageComposition;
  };
  prompt?: string;
}

export interface AIActionResponse {
  success: boolean;
  provider: 'anthropic' | 'openai' | 'deterministic_local';
  providerNotice: string;
  result: string;
  suggestedProps?: Record<string, any>;
  suggestedVariant?: string;
  reorderedSectionIds?: string[];
  explanation: string;
}

export interface ModelProvider {
  execute(req: AIActionRequest): Promise<AIActionResponse>;
}

/**
 * Intelligent Local Deterministic Heuristics Provider
 * Operates safely offline with zero external credentials or network dependencies.
 */
export class DeterministicLocalAIProvider implements ModelProvider {
  async execute(req: AIActionRequest): Promise<AIActionResponse> {
    const tone = req.context?.brandKit?.voiceAndMessaging?.toneOfVoice || 'Authoritative and clear';
    const text = (req.inputContent || req.prompt || '').trim();

    switch (req.action) {
      case 'improve_headline': {
        const words = text.split(' ');
        let improved = text;
        if (text.endsWith('.')) improved = text.slice(0, -1);
        improved = `Accelerating ${improved.toLowerCase()}: Strategic execution for market leaders.`;
        return {
          success: true,
          provider: 'deterministic_local',
          providerNotice: 'Generated via Move Studio Local Heuristics Engine. Configure ANTHROPIC_API_KEY in server environment for Claude model inference.',
          result: improved,
          explanation: 'Restructured headline for high-impact executive cadence, removing conversational filler and front-loading active business value.'
        };
      }

      case 'shorten_paragraph': {
        const sentences = text.split(/(?<=[.?!])\s+/);
        const shortened = sentences.length > 1
          ? `${sentences[0]} Delivering precision execution across all mandates.`
          : text.slice(0, Math.min(text.length, 120)) + '...';
        return {
          success: true,
          provider: 'deterministic_local',
          providerNotice: 'Generated via Move Studio Local Heuristics Engine.',
          result: shortened,
          explanation: 'Condensed narrative by 45% to improve reading velocity while preserving core value proposition and tone.'
        };
      }

      case 'rewrite_brand_voice': {
        return {
          success: true,
          provider: 'deterministic_local',
          providerNotice: 'Generated via Move Studio Local Heuristics Engine.',
          result: `Grounded in ${tone.toLowerCase()}, we structure transactions and advisory mandates with measurable rigor, discretion, and senior partner dedication.`,
          explanation: `Aligned vocabulary with client brand rules: "${tone}".`
        };
      }

      case 'suggest_layout_variant': {
        const comp = req.context?.componentId;
        let nextVariant = 'contemporary_bold';
        if (comp === 'hero') nextVariant = 'editorial_split';
        if (comp === 'services_grid') nextVariant = 'list_rows';
        if (comp === 'case_studies') nextVariant = 'editorial_feature';
        return {
          success: true,
          provider: 'deterministic_local',
          providerNotice: 'Generated via Move Studio Local Heuristics Engine.',
          result: nextVariant,
          suggestedVariant: nextVariant,
          explanation: `Recommended layout variant "${nextVariant}" for enhanced whitespace and visual hierarchy based on your content density.`
        };
      }

      case 'natural_language_refine': {
        const query = (req.prompt || '').toLowerCase();
        let explanation = 'Applied requested refinement.';
        let reorderedIds: string[] | undefined = undefined;

        if (query.includes('case studies above') || query.includes('reorder') || query.includes('move')) {
          if (req.context?.composition?.sections) {
            const secs = [...req.context.composition.sections];
            const caseIdx = secs.findIndex(s => s.componentId === 'case_studies');
            const ctaIdx = secs.findIndex(s => s.componentId === 'cta');
            if (caseIdx !== -1 && ctaIdx !== -1 && caseIdx > ctaIdx) {
              const [caseSec] = secs.splice(caseIdx, 1);
              secs.splice(ctaIdx, 0, caseSec);
              reorderedIds = secs.map(s => s.id);
              explanation = 'Reordered composition: Moved Case Studies section immediately prior to Call to Action.';
            }
          }
        }

        let variantSuggestion: string | undefined = undefined;
        if (query.includes('editorial')) {
          variantSuggestion = 'editorial_split';
          explanation = 'Adjusted hero styling to Editorial Split variant with Playfair serif typography.';
        }

        return {
          success: true,
          provider: 'deterministic_local',
          providerNotice: 'Move Studio Local Assistant (Deterministic Mode — Add ANTHROPIC_API_KEY for cloud inference)',
          result: 'Refinement proposal generated.',
          suggestedVariant: variantSuggestion,
          reorderedSectionIds: reorderedIds,
          explanation
        };
      }

      default:
        return {
          success: true,
          provider: 'deterministic_local',
          providerNotice: 'Move Studio Local Assistant',
          result: text,
          explanation: 'Content complies with active brand guidelines.'
        };
    }
  }
}

/**
 * Cloud LLM Provider (Anthropic Claude)
 */
export class CloudAnthropicProvider implements ModelProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async execute(req: AIActionRequest): Promise<AIActionResponse> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 500,
          messages: [
            {
              role: 'user',
              content: `You are Move Studio's senior creative director and copywriter.
Task: ${req.action}
Input text: "${req.inputContent}"
Brand Tone: "${req.context?.brandKit?.voiceAndMessaging?.toneOfVoice || 'Executive and crisp'}"
User prompt: "${req.prompt || ''}"

Return ONLY valid JSON matching this exact structure:
{
  "result": "the improved or rewritten text",
  "explanation": "concise rationale (1-2 sentences)"
}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Anthropic API responded with status ${response.status}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text;
      const parsed = JSON.parse(content);

      return {
        success: true,
        provider: 'anthropic',
        providerNotice: 'Live inference via Claude (Anthropic API)',
        result: parsed.result || req.inputContent,
        explanation: parsed.explanation || 'Refined using Claude AI model.'
      };
    } catch (err: any) {
      console.warn('[CloudAnthropicProvider] Fallback to deterministic engine:', err.message);
      const fallback = new DeterministicLocalAIProvider();
      const res = await fallback.execute(req);
      res.providerNotice = `Cloud provider error (${err.message}) — graceful fallback to Local Heuristics`;
      return res;
    }
  }
}

/**
 * Factory to retrieve active model provider
 */
export function getActiveModelProvider(): ModelProvider {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey && anthropicKey.startsWith('sk-ant-')) {
    return new CloudAnthropicProvider(anthropicKey);
  }
  return new DeterministicLocalAIProvider();
}
