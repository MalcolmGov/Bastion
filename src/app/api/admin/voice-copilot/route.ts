import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guard';
import {
  getSreHealthAction,
  getIncidentsAction,
  getBillingSummaryAction,
  createQuickInvoiceAction,
  navigateAction
} from '@/lib/copilot/actions';
import {
  findCmsKnowledge,
  buildCmsKnowledgePrompt,
  CMS_KNOWLEDGE_BASE,
  DEFAULT_CLIENT_SUGGESTED_STEPS,
  DEFAULT_AGENCY_SUGGESTED_STEPS
} from '@/lib/copilot/cmsKnowledge';

export async function POST(req: NextRequest) {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
    const body = await req.json();
    const {
      message = '',
      history = [],
      clientContext = 'Payguard',
      portalViewMode = 'client',
      userName = 'Malcolm',
      userRole = 'admin'
    } = body;

    const clientName = clientContext || 'Payguard';
    const isClient = portalViewMode === 'client';
    const defaultSteps = isClient ? DEFAULT_CLIENT_SUGGESTED_STEPS : DEFAULT_AGENCY_SUGGESTED_STEPS;
    const trimmed = (message || '').trim();

    if (!trimmed) {
      return NextResponse.json({
        reply: `Hello ${userName}! I'm Ask AI, your platform assistant for ${clientName}. How can I assist you with your pages, visual editor, or team today?`,
        speechText: `Hello ${userName}. I am Ask AI, your assistant for ${clientName}. What would you like guidance on?`,
        suggestedNextSteps: defaultSteps
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
      lower.startsWith('show me') ||
      lower.includes('take me')
    ) {
      const nav = navigateAction(lower);
      const matchedKnowledge = findCmsKnowledge(lower);
      return NextResponse.json({
        reply: `${nav.speechText} Opening ${nav.navigationUrl} for you.`,
        speechText: nav.speechText,
        action: {
          type: 'navigate',
          navigationUrl: nav.navigationUrl
        },
        suggestedNextSteps: matchedKnowledge?.suggestedNextSteps || defaultSteps
      });
    }

    // ─────────────────────────────────────────────────────────
    // 2. INTENT: AGENCY-ONLY OPS (SRE / INCIDENTS / BILLING)
    // ─────────────────────────────────────────────────────────
    if (!isClient) {
      if (
        lower.includes('sre') ||
        lower.includes('health') ||
        lower.includes('latency') ||
        lower.includes('uptime') ||
        lower.includes('probe')
      ) {
        const health = await getSreHealthAction();
        return NextResponse.json({
          reply: health.speechText,
          speechText: health.speechText,
          action: {
            type: 'sre_health',
            data: health.data
          },
          suggestedNextSteps: [
            { label: 'Incident Logs', query: 'Are there any active incidents or open PR fixes?', icon: 'check' },
            { label: 'Public Status Page', query: 'Open the public status page', icon: 'sparkles' },
            { label: 'Visual Editor', query: 'Open the Visual Live Page Editor', icon: 'edit' }
          ]
        });
      }

      if (lower.includes('incident') || lower.includes('ast repair') || lower.includes('pull request')) {
        const inc = await getIncidentsAction();
        return NextResponse.json({
          reply: inc.speechText,
          speechText: inc.speechText,
          action: {
            type: 'list_incidents',
            data: inc.data
          },
          suggestedNextSteps: [
            { label: 'SRE Health Probe', query: 'Check platform health and SLA uptime', icon: 'shield' },
            { label: 'Commercial Billing', query: 'What is our total invoiced revenue and billing?', icon: 'check' },
            { label: 'Visual Editor', query: 'Open the Visual Live Page Editor', icon: 'sparkles' }
          ]
        });
      }

      if (lower.includes('invoice') || lower.includes('billing') || lower.includes('mrr') || lower.includes('revenue')) {
        if (lower.includes('create') || lower.includes('draft') || lower.includes('generate')) {
          const inv = await createQuickInvoiceAction({
            clientName: clientName,
            amount: 28500,
            description: `Enterprise Platform Retainer — ${clientName}`
          });
          return NextResponse.json({
            reply: inv.speechText,
            speechText: inv.speechText,
            action: {
              type: 'create_invoice',
              navigationUrl: inv.navigationUrl,
              data: inv.data
            },
            suggestedNextSteps: defaultSteps
          });
        }
        const bill = await getBillingSummaryAction();
        return NextResponse.json({
          reply: bill.speechText,
          speechText: bill.speechText,
          action: {
            type: 'billing_summary',
            data: bill.data
          },
          suggestedNextSteps: defaultSteps
        });
      }
    }

    // ─────────────────────────────────────────────────────────
    // 3. INTENT: CMS KNOWLEDGE LOOKUP
    // ─────────────────────────────────────────────────────────
    const matchedKnowledge = findCmsKnowledge(trimmed);

    // ─────────────────────────────────────────────────────────
    // 4. INTELLIGENT AI (CLAUDE ANTHROPIC)
    // ─────────────────────────────────────────────────────────
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      try {
        const systemPrompt = buildCmsKnowledgePrompt(clientName, userName);

        const conversationMessages = [
          ...history.slice(-4).map((h: any) => ({
            role: h.role === 'assistant' ? 'assistant' : 'user',
            content: String(h.content || '')
          })),
          { role: 'user', content: trimmed }
        ];

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-haiku-20241022',
            system: systemPrompt,
            max_tokens: 300,
            messages: conversationMessages
          })
        });

        if (res.ok) {
          const data = await res.json();
          const aiText = data.content?.[0]?.text?.replace(/[*#]/g, '') || '';
          if (aiText) {
            return NextResponse.json({
              reply: aiText,
              speechText: aiText.split('\n')[0].replace(/[-•]/g, '').trim(),
              action: matchedKnowledge ? {
                type: 'navigate',
                navigationUrl: matchedKnowledge.actionUrl,
                label: matchedKnowledge.actionLabel
              } : undefined,
              suggestedNextSteps: matchedKnowledge?.suggestedNextSteps || defaultSteps
            });
          }
        }
      } catch (e) {
        console.warn('Anthropic API call fallback:', e);
      }
    }

    // ─────────────────────────────────────────────────────────
    // 5. DETERMINISTIC CMS KNOWLEDGE FALLBACK
    // ─────────────────────────────────────────────────────────
    if (matchedKnowledge) {
      const reply = `${matchedKnowledge.summary}\n\nKey Steps:\n${matchedKnowledge.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}\n\nTip: ${matchedKnowledge.tips}`;
      return NextResponse.json({
        reply,
        speechText: `${matchedKnowledge.summary} I have provided the exact steps below.`,
        action: {
          type: 'navigate',
          navigationUrl: matchedKnowledge.actionUrl,
          label: matchedKnowledge.actionLabel
        },
        suggestedNextSteps: matchedKnowledge.suggestedNextSteps || defaultSteps
      });
    }

    // Default polite assistant reply
    const defaultReply = `I am Ask AI, your dedicated assistant for ${clientName}. I can guide you through editing pages in the Visual Live Editor, managing your navigation architecture, uploading media, inviting team members, or reviewing publication drafts. What would you like to do?`;
    return NextResponse.json({
      reply: defaultReply,
      speechText: `I am Ask AI for ${clientName}. How can I assist you with your website or team?`,
      action: {
        type: 'navigate',
        navigationUrl: '/admin/learn',
        label: 'Open Platform Learning Hub'
      },
      suggestedNextSteps: defaultSteps
    });

  } catch (error: any) {
    console.error('Voice Copilot API error:', error);
    return NextResponse.json({
      error: error.message,
      reply: "An unexpected error occurred while processing your request. Please try again or check the Platform Learning Hub.",
      speechText: "An unexpected error occurred. Please try again."
    }, { status: 500 });
  }
}
