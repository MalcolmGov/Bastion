import { NextRequest, NextResponse } from 'next/server';
import {
  getSreHealthAction,
  getIncidentsAction,
  getBillingSummaryAction,
  createQuickInvoiceAction,
  navigateAction
} from '@/lib/copilot/actions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message = '', history = [], clientContext = 'Move Digital & Gold Fields' } = body;

    const trimmed = (message || '').trim();
    if (!trimmed) {
      return NextResponse.json({
        reply: "I'm listening, Malcolm. What would you like to check or execute across the platform?",
        speechText: "I am listening Malcolm. What would you like to inspect across the platform?"
      });
    }

    const lower = trimmed.toLowerCase();

    // ─────────────────────────────────────────────────────────
    // 1. INTENT: NAVIGATION
    // ─────────────────────────────────────────────────────────
    if (
      lower.startsWith('go to') ||
      lower.startsWith('open') ||
      lower.startsWith('take me to') ||
      lower.startsWith('navigate to') ||
      lower.includes('show me the status page') ||
      lower.includes('show status') ||
      lower.includes('show me billing')
    ) {
      const nav = navigateAction(lower);
      return NextResponse.json({
        reply: `${nav.speechText} Redirecting you to ${nav.navigationUrl}...`,
        speechText: nav.speechText,
        action: {
          type: 'navigate',
          navigationUrl: nav.navigationUrl
        }
      });
    }

    // ─────────────────────────────────────────────────────────
    // 2. INTENT: SRE PLATFORM HEALTH & SLA PROBE
    // ─────────────────────────────────────────────────────────
    if (
      lower.includes('health') ||
      lower.includes('uptime') ||
      lower.includes('latency') ||
      lower.includes('probe') ||
      lower.includes('how is movedigital') ||
      lower.includes('how is move digital') ||
      lower.includes('system status') ||
      lower.includes('sla')
    ) {
      const health = await getSreHealthAction();
      return NextResponse.json({
        reply: health.speechText,
        speechText: health.speechText,
        action: {
          type: 'sre_health',
          data: health.data
        }
      });
    }

    // ─────────────────────────────────────────────────────────
    // 3. INTENT: INCIDENTS & AST REPAIR PRs
    // ─────────────────────────────────────────────────────────
    if (
      lower.includes('incident') ||
      lower.includes('pr') ||
      lower.includes('pull request') ||
      lower.includes('fix') ||
      lower.includes('error') ||
      lower.includes('bug') ||
      lower.includes('anomaly')
    ) {
      const inc = await getIncidentsAction();
      return NextResponse.json({
        reply: inc.speechText,
        speechText: inc.speechText,
        action: {
          type: 'list_incidents',
          data: inc.data
        }
      });
    }

    // ─────────────────────────────────────────────────────────
    // 4. INTENT: BILLING, INVOICING, MRR
    // ─────────────────────────────────────────────────────────
    if (
      lower.includes('bill') ||
      lower.includes('invoice') ||
      lower.includes('revenue') ||
      lower.includes('mrr') ||
      lower.includes('quote') ||
      lower.includes('financial') ||
      lower.includes('overdue')
    ) {
      // Check if user wants to CREATE an invoice
      if (lower.includes('create') || lower.includes('draft') || lower.includes('generate') || lower.includes('send invoice')) {
        const clientMatch = lower.includes('gold') ? 'Gold Fields' : 'Move Digital';
        const numMatch = lower.match(/\b\d+([,.]\d+)?\b/);
        const amount = numMatch ? parseInt(numMatch[0].replace(/,/g, ''), 10) : 28500;

        const inv = await createQuickInvoiceAction({
          clientName: clientMatch,
          amount,
          description: `Enterprise SRE & Automated Remediation Retainer — ${clientMatch}`
        });

        return NextResponse.json({
          reply: inv.speechText,
          speechText: inv.speechText,
          action: {
            type: 'create_invoice',
            navigationUrl: inv.navigationUrl,
            data: inv.data
          }
        });
      }

      // Default: billing summary
      const bill = await getBillingSummaryAction();
      return NextResponse.json({
        reply: bill.speechText,
        speechText: bill.speechText,
        action: {
          type: 'billing_summary',
          data: bill.data
        }
      });
    }

    // ─────────────────────────────────────────────────────────
    // 5. INTENT: GENERAL PLATFORM & INTELLIGENCE Q&A
    // ─────────────────────────────────────────────────────────
    // Check if Anthropic API key is available for conversational response
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      try {
        const prompt = `You are Zara, the autonomous platform copilot for Bastion Studio (operating for Malcolm Govender).
You manage multi-tenant enterprise platforms, automated SRE self-healing, AST syntax verification, 90-day SLA monitoring, and commercial invoicing.
Context:
- Platform: Bastion Studio & Move Digital
- Active Properties: movedigital.africa (Vercel production edge), goldfields.com
- User: Malcolm Govender
- Capabilities: Voice-driven SRE triage, automated PR deployment, rollback guardrails, tax invoicing.

User said: "${trimmed}"
Give a concise, sharp, professional executive reply in 1 to 2 sentences (under 40 words) that sounds natural when spoken aloud. Do not use asterisks or markdown formatting.`;

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 150,
            messages: [{ role: 'user', content: prompt }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          const aiText = data.content?.[0]?.text?.replace(/[*_#]/g, '') || '';
          if (aiText) {
            return NextResponse.json({
              reply: aiText,
              speechText: aiText
            });
          }
        }
      } catch (e) {
        console.warn('Anthropic API call fallback:', e);
      }
    }

    // Deterministic intelligence fallback
    let responseText = "I'm standing by to assist with platform operations, SRE health telemetry, commercial invoicing, or content publishing across your multi-tenant properties.";
    if (lower.includes('who are you') || lower.includes('what can you do')) {
      responseText = "I am Zara, your autonomous Bastion Studio copilot. I monitor edge health across Move Digital and Gold Fields, dispatch SRE patches, track billing pipeline, and manage content releases.";
    } else if (lower.includes('bastion') || lower.includes('platform')) {
      responseText = "Bastion Studio is your centralized multi-tenant operating system, powering client digital properties with sub-second edge latency and self-healing autonomous SRE.";
    }

    return NextResponse.json({
      reply: responseText,
      speechText: responseText
    });

  } catch (error: any) {
    console.error('Voice Copilot API error:', error);
    return NextResponse.json({
      error: error.message,
      reply: "An internal platform error occurred while executing the copilot command.",
      speechText: "An internal error occurred while executing the command."
    }, { status: 500 });
  }
}
