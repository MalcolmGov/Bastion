import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { WebsiteAssembler } from '@/lib/studio/assembler';
import { requireAgencyUser, requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { hashPassword } from '@/lib/auth/password';

export async function GET() {
  try {
    const gate = await requireUser();
    if (!gate.ok) return gate.response;
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

    let clients = clientsRes.rows.map((c: any) => {
      let billingDetails = undefined;
      if (c.billing_details_json) {
        try {
          billingDetails = typeof c.billing_details_json === 'string'
            ? JSON.parse(c.billing_details_json)
            : c.billing_details_json;
        } catch (_) {}
      } else if (c.primary_contact_json) {
        try {
          const parsed = typeof c.primary_contact_json === 'string'
            ? JSON.parse(c.primary_contact_json)
            : c.primary_contact_json;
          if (parsed && parsed.billingDetails) {
            billingDetails = parsed.billingDetails;
          }
        } catch (_) {}
      }

      return {
        id: String(c.id),
        name: String(c.name),
        slug: String(c.slug),
        industry: String(c.industry),
        logoUrl: c.logo_url ? String(c.logo_url) : undefined,
        primaryContact: typeof c.primary_contact_json === 'string' ? JSON.parse(c.primary_contact_json) : (c.primary_contact_json || undefined),
        billingDetails,
        websites: websites.filter(w => w.clientId === String(c.id))
      };
    });

    if (!isAgencyUser(gate.user)) {
      clients = clients.filter(c => c.id === gate.user.client_id);
    }

    const visibleWebsites = websites.filter(w => clients.some(c => c.id === w.clientId));
    return NextResponse.json({ clients, websites: visibleWebsites });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireAgencyUser();
    if (!gate.ok) return gate.response;
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
      secondaryBrandColor = '#1E293B',
      accentBrandColor = '#2563EB',
      headingFont = 'Plus Jakarta Sans',
      bodyFont = 'Inter',
      tagline,
      services,
      contactInfo,
      billingDetails,
      enabledModules,
      initialUser
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Client name is required.' }, { status: 400 });
    }

    const slug = rawSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const clientId = `client_${slug.replace(/[^a-z0-9]/gi, '_')}`;
    const siteSlug = slug;
    const websiteName = `${name} Corporate Website`;
    const now = new Date().toISOString();

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
          secondary: { name: 'Dark Ink', value: secondaryBrandColor || '#0F172A', status: 'approved' },
          accent: { name: 'Brand Accent', value: accentBrandColor, status: 'approved' },
          background: { name: 'Light Canvas', value: '#F8FAFC', status: 'approved' },
          surface: { name: 'White Surface', value: '#FFFFFF', status: 'approved' },
          textPrimary: { name: 'Dark Ink', value: '#0F172A', status: 'approved' },
          textMuted: { name: 'Muted Ink', value: '#64748B', status: 'approved' },
          hairline: { name: 'Hairline Divider', value: '#E2E8F0', status: 'approved' }
        },
        typography: {
          headingFont: headingFont || 'Plus Jakarta Sans',
          bodyFont: bodyFont || 'Inter',
          headingWeight: '700',
          scaleRatio: 1.25,
          status: 'approved'
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

    // Update industry, logo, domain, primary contact details, and billing particulars
    try {
      await db.execute({
        sql: `UPDATE clients SET industry = ?, logo_url = ?, primary_contact_json = ?, billing_details_json = ?, updated_at = ? WHERE id = ?`,
        args: [
          industry,
          logoUrl || null,
          contactInfo ? JSON.stringify(contactInfo) : null,
          billingDetails ? JSON.stringify(billingDetails) : null,
          now,
          clientId
        ]
      });
    } catch (_) {
      // Fallback if column not yet added
      await db.execute({
        sql: `UPDATE clients SET industry = ?, logo_url = ?, primary_contact_json = ?, updated_at = ? WHERE id = ?`,
        args: [
          industry,
          logoUrl || null,
          contactInfo ? JSON.stringify({ ...contactInfo, billingDetails }) : null,
          now,
          clientId
        ]
      });
    }

    if (primaryDomain) {
      await db.execute({
        sql: `UPDATE websites SET primary_domain = ?, updated_at = ? WHERE client_id = ?`,
        args: [primaryDomain, now, clientId]
      });
    }

    // Merge enabled modules into website settings_json if supplied
    if (enabledModules) {
      try {
        const currentWebsite = await db.execute({
          sql: `SELECT settings_json FROM websites WHERE id = ?`,
          args: [assembleResult.websiteId]
        });
        let settings: any = {};
        if (currentWebsite.rows[0]?.settings_json) {
          settings = typeof currentWebsite.rows[0].settings_json === 'string'
            ? JSON.parse(currentWebsite.rows[0].settings_json as string)
            : currentWebsite.rows[0].settings_json;
        }
        settings.enabledModules = {
          ...(settings.enabledModules || {}),
          ...enabledModules
        };
        await db.execute({
          sql: `UPDATE websites SET settings_json = ?, updated_at = ? WHERE id = ?`,
          args: [JSON.stringify(settings), now, assembleResult.websiteId]
        });
      } catch (modErr) {
        console.warn('Could not merge custom module settings:', modErr);
      }
    }

    // Provision initial client user if requested
    let createdUser: any = null;
    if (initialUser && initialUser.email) {
      const userEmail = String(initialUser.email).toLowerCase().trim();
      const userName = String(initialUser.name || `${name} Administrator`).trim();
      const userRole = String(initialUser.role || 'content_editor');
      const rawPassword = initialUser.password || `${name.replace(/[^a-zA-Z0-9]/g, '')}2026!`;
      const passwordHash = hashPassword(rawPassword);
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      await db.execute({
        sql: `INSERT OR REPLACE INTO users (id, name, email, password_hash, role, region_scope, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          userId,
          userName,
          userEmail,
          passwordHash,
          userRole,
          name, // Scoped to this corporate client
          now
        ]
      });

      createdUser = {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole
      };
    }

    return NextResponse.json({
      success: true,
      client: {
        id: clientId,
        name,
        slug,
        industry,
        logoUrl,
        primaryDomain,
        billingDetails
      },
      website: {
        id: assembleResult.websiteId,
        name: websiteName,
        slug: siteSlug,
        previewUrl: assembleResult.previewUrl
      },
      user: createdUser,
      compositionsCount: assembleResult.compositions.length
    });
  } catch (err: any) {
    console.error('Failed to onboard client:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
