import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const items = await db.execute(`SELECT * FROM ai_knowledge_items ORDER BY last_indexed_at DESC`);

    return NextResponse.json({ items: items.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Simulate RAG retrieval with citations
    const sampleResponses: Record<string, { answer: string; citations: string[] }> = {
      production: {
        answer: 'For H1 2026, Gold Fields achieved attributable gold-equivalent production of 1,054 koz with an All-in Sustaining Cost (AISC) of US$1,385/oz, reflecting strong operational delivery across Australia, South Deep, Tarkwa, and Cerro Corona.',
        citations: ['H1 2026 Results Booklet (p. 4)', 'Financial Tables Release']
      },
      solar: {
        answer: 'South Deep operates the 50MW Khanyisa solar plant in Gauteng, South Africa. It generates ~24% of the mine’s electricity needs, displacing ~110,000 tonnes of CO2e annually while reducing dependency on the national grid.',
        citations: ['South Deep Operational Profile', '2024 Sustainability Report']
      },
      supplier: {
        answer: 'South African suppliers must provide valid CIPC registration, SARS Tax Compliance PIN, B-BBEE verification certificate, Letter of Good Standing with Compensation Commissioner (COIDA), proof of host community residence in West Rand, and agree to the Group Code of Conduct.',
        citations: ['South Africa Supplier Guidelines', 'Coupa E-Procurement Portal']
      }
    };

    const qLower = String(query).toLowerCase();
    let result = sampleResponses.production;
    if (qLower.includes('solar') || qLower.includes('khanyisa') || qLower.includes('south deep') || qLower.includes('power')) {
      result = sampleResponses.solar;
    } else if (qLower.includes('supplier') || qLower.includes('procurement') || qLower.includes('bbbee') || qLower.includes('tender')) {
      result = sampleResponses.supplier;
    }

    return NextResponse.json({
      query,
      answer: result.answer,
      citations: result.citations,
      latencyMs: 14,
      model: 'Gold Fields Enterprise RAG Pipeline (v2.4)'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
