import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { text, tone = 'investor', field = 'title', instruction } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Valid text is required' }, { status: 400 });
    }

    // Gold Fields corporate tone transformation rules
    let rewritten = text;
    let rationale = '';
    const cleanText = text.trim();

    if (tone === 'investor') {
      if (field === 'title') {
        if (/mining|value|production/i.test(cleanText)) {
          rewritten = 'Delivering Disciplined Capital Allocation & Sustained Operational Momentum.';
        } else if (/result|financial|telemetry/i.test(cleanText)) {
          rewritten = 'Attributable Production & Financial Telemetry: Robust Cash Generation Across Tier-1 Assets.';
        } else if (/sustainab|esg|green/i.test(cleanText)) {
          rewritten = 'Decarbonization Roadmap: De-Risking Operations Through Renewable Energy & Capital Discipline.';
        } else {
          rewritten = `Optimizing Portfolio Resilience: ${cleanText.replace(/\.$/, '')} with Rigorous Shareholder Value.`;
        }
        rationale = 'Reframed with JSE/NYSE institutional investor vocabulary, emphasizing capital discipline, free cash flow, and risk-adjusted return.';
      } else {
        rewritten = `${cleanText} Backed by investment-grade balance sheet liquidity, an All-in Sustaining Cost (AISC) discipline of US$1,385/oz, and steady production guidance across our global portfolio.`;
        rationale = 'Added quantifiable operational context, AISC cost discipline, and balance sheet strength.';
      }
    } else if (tone === 'punchy') {
      if (field === 'title') {
        const words = cleanText.split(' ');
        if (words.length > 6) {
          rewritten = words.slice(0, 5).join(' ') + ' — Built for Performance.';
        } else {
          rewritten = cleanText.replace(/\.$/, '') + ' — Uncompromised Delivery.';
        }
        rationale = 'Shortened to high-impact executive headline with strong active cadence.';
      } else {
        rewritten = cleanText.replace(/\b(in order to|with a view to|discover our|we aim to)\b/gi, '').trim();
        rewritten = rewritten.charAt(0).toUpperCase() + rewritten.slice(1);
        if (!rewritten.endsWith('.')) rewritten += '.';
        rationale = 'Removed passive filler, sharpened verb phrases for mobile and executive clarity.';
      }
    } else if (tone === 'sustainability') {
      if (field === 'title') {
        rewritten = 'Enduring Value Beyond Mining: 2030 Science-Based Decarbonization & Community Stewardship.';
        rationale = 'Aligned with Gold Fields 2030 ESG targets, Khanyisa 50MW solar strategy, and net-zero commitments.';
      } else {
        rewritten = `${cleanText} Driving towards 50% renewable energy share by 2030, anchored by the Khanyisa 50MW solar plant and zero-harm workplace culture across all host communities.`;
        rationale = 'Infused with specific renewable targets (Khanyisa solar, 50% target) and zero-harm stakeholder commitments.';
      }
    } else if (tone === 'executive') {
      if (field === 'title') {
        rewritten = 'Strategic Leadership: Pioneering Safe, High-Margin Gold Mining Worldwide.';
        rationale = 'Formulated in the authoritative voice of the Board and Chief Executive Officer.';
      } else {
        rewritten = `${cleanText} Anchored by an unwavering commitment to safe operational excellence, transparent governance, and shared prosperity for all stakeholders.`;
        rationale = 'Elevated to strategic vision, governance standards, and long-term societal impact.';
      }
    }

    if (instruction && instruction.trim()) {
      rewritten = `${rewritten} (${instruction.trim()})`;
      rationale += ` Incorporated user instruction: "${instruction.trim()}".`;
    }

    return NextResponse.json({
      original: cleanText,
      rewritten,
      tone,
      field,
      rationale,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
