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
          navigationUrl: nav.navigationUrl,
          label: nav.label || matchedKnowledge?.actionLabel || 'Open Section'
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
    // 2B. INTENT: CORPORATE ANNOUNCEMENT & SENS DRAFTER
    // ─────────────────────────────────────────────────────────
    if (
      lower.includes('draft') ||
      lower.includes('press release') ||
      lower.includes('announcement') ||
      lower.includes('statement') ||
      lower.includes('sens') ||
      lower.includes('disclosure')
    ) {
      const topic = trimmed
        .replace(/draft\s*(a|an)?\s*(corporate|sens|press)?\s*(release|announcement|statement)?\s*(for|about|on)?/i, '')
        .trim();
      
      const cleanTopic = topic.length > 4 ? topic : 'Quarterly Operational & Financial Results';
      const releaseTitle = `${clientName.toUpperCase()} RELEASES MARKET UPDATE: ${cleanTopic.toUpperCase()}`;
      
      const formattedDraft = `### **${clientName} Corporate Announcement & Media Release**
**HEADLINE:** ${releaseTitle}

**JSE / LSE Symbol:** GFI &bull; **ISIN:** ZAE000018123 &bull; **Date:** ${new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}

---

**JOHANNESBURG &mdash;** ${clientName} today releases a formal corporate update regarding **${cleanTopic}**, reflecting solid operational execution, disciplined capital allocation, and progress against strategic milestones.

#### **Key Operational & Strategic Highlights:**
- **Performance Execution:** Delivery across Tier-1 assets remains strong, supported by high plant availability and consistent production volumes.
- **Cost Discipline:** Group All-in Sustaining Costs (AISC) remain tightly managed in line with top-quartile global benchmarks.
- **ESG & Decarbonization:** Renewable energy microgrids and water stewardship initiatives continued advancing toward 2030 targets.
- **Shareholder Value:** Operational cash flows continue to support disciplined growth investments and sustained dividend returns.

#### **Executive Leadership Commentary:**
> *"Our unwavering focus on safe production, cost efficiency, and sustainable capital stewardship continues to deliver enduring shared value for our shareholders, host communities, and partners."*  
> &mdash; **Executive Leadership Team, ${clientName}**

---
**Regulatory & Forward-Looking Disclaimer:**
*Certain statements in this disclosure may constitute forward-looking statements under South African and international securities laws. Such statements involve known and unknown risks, uncertainties, and other factors that could cause actual results to differ materially.*
`;

      return NextResponse.json({
        reply: formattedDraft,
        speechText: `I have prepared a draft corporate announcement for ${clientName}. It includes headline structuring, key operational bullet points, an executive quote, and King IV regulatory disclaimers. You can copy this or bundle it directly into Content Releases.`,
        action: {
          type: 'navigate',
          navigationUrl: '/admin/releases',
          label: 'Bundle Into Content Release'
        },
        suggestedNextSteps: [
          { label: 'Bundle in Releases', query: 'Open Content Releases to bundle this draft', icon: 'check' },
          { label: 'IR Calendar', query: 'Open the IR & Financial Calendar', icon: 'calendar' },
          { label: 'Edit in Visual Editor', query: 'Open the Visual Live Page Editor', icon: 'edit' }
        ]
      });
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
            model: 'claude-haiku-4-5',
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
