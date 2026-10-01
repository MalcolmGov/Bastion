import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { WebsiteAssembler } from '@/lib/studio/assembler';

export async function GET() {
  try {
    const db = getDb();
    const clientsRes = await db.execute(`SELECT * FROM clients ORDER BY created_at ASC`);
    const websitesRes = await db.execute(`SELECT * FROM websites ORDER BY created_at ASC`);

    const websites = websitesRes.rows.map(w => ({
      id: String(w.id),
      clientId: String(w.client_id),
      name: String(w.name),
      slug: String(w.slug),
      blueprintId: String(w.blueprint_id),
      designCollectionId: String(w.design_collection_id),
      status: String(w.status),
      primaryDomain: w.primary_domain ? String(w.primary_domain) : undefined,
      settings: typeof w.settings_json === 'string' ? JSON.parse(w.settings_json) : (w.settings_json || {})
    }));

    const clients = clientsRes.rows.map(c => ({
      id: String(c.id),
      name: String(c.name),
      slug: String(c.slug),
      industry: String(c.industry),
      logoUrl: c.logo_url ? String(c.logo_url) : undefined,
      websites: websites.filter(w => w.clientId === String(c.id))
    }));

    return NextResponse.json({ clients, websites });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug: rawSlug,
      industry = 'corporate',
      logoUrl,
      primaryDomain,
      blueprintId = 'corporate',
      designCollectionId = 'editorial',
      primaryBrandColor = '#0F172A',
      accentBrandColor = '#2563EB',
      tagline,
      services,
      contactInfo
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Client name is required.' }, { status: 400 });
    }

    const slug = rawSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const clientId = `client_${slug.replace(/[^a-z0-9]/gi, '_')}`;
    const siteSlug = slug;
    const websiteName = `${name} Corporate Website`;

    const db = getDb();

    // Use WebsiteAssembler to assemble client, website, brand kit, and initial page compositions
    const assembleResult = await WebsiteAssembler.assembleAndSave({
      clientId,
      clientName: name,
      websiteName,
      websiteSlug: siteSlug,
      blueprintId: (blueprintId as any) || 'corporate',
      collectionId: (designCollectionId as any) || 'editorial',
      brandKit: {
        logos: {
          primary: { url: logoUrl || '/assets/logo-placeholder.svg', status: 'approved' }
        },
        colors: {
          primary: { name: 'Brand Primary', value: primaryBrandColor, status: 'approved' },
          secondary: { name: 'Dark Ink', value: '#0F172A', status: 'approved' },
          accent: { name: 'Brand Accent', value: accentBrandColor, status: 'approved' },
          background: { name: 'Light Canvas', value: '#F8FAFC', status: 'approved' },
          surface: { name: 'White Surface', value: '#FFFFFF', status: 'approved' },
          textPrimary: { name: 'Dark Ink', value: '#0F172A', status: 'approved' },
          textMuted: { name: 'Muted Ink', value: '#64748B', status: 'approved' },
          hairline: { name: 'Hairline Divider', value: '#E2E8F0', status: 'approved' }
        },
        voiceAndMessaging: {
          tagline: tagline || `Official corporate portal and verified disclosures for ${name}.`,
          toneOfVoice: 'Authoritative, decisive, and enterprise-aligned.',
          approvedFacts: [`${name} is an established enterprise organization.`]
        }
      },
      extractedContent: {
        tagline: tagline || `Empowering tomorrow through innovation and performance at ${name}.`,
        services: services || [
          { title: 'Corporate Capabilities', description: `Enterprise operations and sustainable solutions delivered by ${name}.` },
          { title: 'Investor Relations', description: `Transparent financial disclosures, governance statements, and share performance.` },
          { title: 'Sustainability & ESG', description: `Responsible stewardship, ethical governance, and social impact programs.` }
        ],
        contactInfo: contactInfo || {
          email: `contact@${primaryDomain || slug + '.com'}`,
          phone: '+27 11 000 0000',
          address: 'Johannesburg, South Africa'
        },
        businessSummary: `Official enterprise portal for ${name}.`
      }
    }, db);

    // Update industry, logo, domain if specified
    const now = new Date().toISOString();
    await db.execute({
      sql: `UPDATE clients SET industry = ?, logo_url = ?, updated_at = ? WHERE id = ?`,
      args: [industry, logoUrl || null, now, clientId]
    });

    if (primaryDomain) {
      await db.execute({
        sql: `UPDATE websites SET primary_domain = ?, updated_at = ? WHERE client_id = ?`,
        args: [primaryDomain, now, clientId]
      });
    }

    return NextResponse.json({
      success: true,
      client: {
        id: clientId,
        name,
        slug,
        industry,
        logoUrl
      },
      website: {
        id: assembleResult.websiteId,
        name: websiteName,
        slug: siteSlug,
        previewUrl: assembleResult.previewUrl
      }
    });
  } catch (err: any) {
    console.error('Failed to create client:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

