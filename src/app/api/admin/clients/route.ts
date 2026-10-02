import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { WebsiteAssembler } from '@/lib/studio/assembler';
import { requireAgencyUser, requireUser } from '@/lib/auth/guard';
import { isAgencyUser } from '@/lib/auth/roles';
import { hashPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/auth';
import { generateWelcomeEmailHtml } from '@/lib/email/welcomeTemplate';
import { sendTransactionalEmail } from '@/lib/email/delivery';

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
      initialUser,
      packageTier,
      packageServices,
      packageAmount,
      packageCurrency,
      packageBillingCycle,
      packageNotes
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

    // Consolidate package details into billingDetails
    const finalBillingDetails = {
      ...(billingDetails || {}),
      package: {
        tier: packageTier || billingDetails?.package?.tier || 'Gold',
        amount: packageAmount || billingDetails?.package?.amount || '85,000',
        currency: packageCurrency || billingDetails?.package?.currency || 'R',
        billingCycle: packageBillingCycle || billingDetails?.package?.billingCycle || 'Monthly Retainer',
        services: packageServices || billingDetails?.package?.services || [],
        notes: packageNotes || billingDetails?.package?.notes || ''
      }
    };

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
          JSON.stringify(finalBillingDetails),
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
          contactInfo ? JSON.stringify({ ...contactInfo, billingDetails: finalBillingDetails }) : null,
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

    // Provision starter isolated content_records (pages) and media_folders for the newly onboarded client
    try {
      const starterPages = [
        {
          slug: 'home',
          title: `${name} — Flagship Homepage`,
          tagline: tagline || `Official digital presence and disclosures for ${name}.`
        },
        {
          slug: 'about',
          title: `About ${name} — Leadership & Governance`,
          tagline: `Enterprise stewardship, executive leadership, and governance at ${name}.`
        },
        {
          slug: 'services',
          title: `${name} Capabilities & Solutions`,
          tagline: `Core specialist services, client engagement models, and execution frameworks.`
        },
        {
          slug: 'reports',
          title: `${name} Disclosures & Financial Reports`,
          tagline: `Audited financial disclosures, regulatory announcements, and governance documentation.`
        },
        {
          slug: 'contact',
          title: `Contact & Corporate Directory — ${name}`,
          tagline: `Direct stakeholder communication channels and regional office locations.`
        },
        {
          slug: 'news',
          title: `${name} Announcements & Media Releases`,
          tagline: `Official executive statements, corporate press releases, and market updates.`
        }
      ];

      for (const p of starterPages) {
        const recId = `page_${slug.replace(/[^a-z0-9]/gi, '_')}_${p.slug}`;
        const revId = `rev_${recId}_v1`;
        const dataJson = JSON.stringify({
          title: p.title,
          slug: p.slug,
          tagline: p.tagline,
          clientName: name,
          clientId,
          status: 'published'
        }, null, 2);

        await db.execute({
          sql: `INSERT OR REPLACE INTO content_records (id, collection, slug, title, status, current_published_revision_id, current_draft_revision_id, owner_id, client_id, created_at, updated_at)
                VALUES (?, 'pages', ?, ?, 'published', ?, ?, 'usr_admin', ?, ?, ?)`,
          args: [recId, p.slug, p.title, revId, revId, clientId, now, now]
        });

        await db.execute({
          sql: `INSERT OR REPLACE INTO revisions (id, record_id, revision_number, data_json, content_hash, author_id, created_at, status)
                VALUES (?, ?, 1, ?, 'seeded_hash', 'usr_admin', ?, 'published')`,
          args: [revId, recId, dataJson, now]
        });
      }

      // Provision default DAM media folders
      const defaultFolders = [
        'Logos & Brand DNA',
        'Executive Photography',
        'Regulatory Filings & PDFs',
        'Press & Media Assets',
        'Website Banners'
      ];
      for (let i = 0; i < defaultFolders.length; i++) {
        await db.execute({
          sql: `INSERT OR IGNORE INTO media_folders (id, name, client_id, created_at) VALUES (?, ?, ?, ?)`,
          args: [`fld_${slug.replace(/[^a-z0-9]/gi, '_')}_${i + 1}`, defaultFolders[i], clientId, now]
        });
      }
    } catch (pageProvisionErr) {
      console.warn('Could not auto-provision starter client content records:', pageProvisionErr);
    }

    // Provision initial client user if requested and deliver welcome credentials via Resend
    let createdUser: any = null;
    let emailDelivery: any = null;
    if (initialUser && initialUser.email) {
      const userEmail = String(initialUser.email).toLowerCase().trim();
      const userName = String(initialUser.name || `${name} Administrator`).trim();
      const userRole = String(initialUser.role || 'content_editor');
      const rawPassword = initialUser.password || `${name.replace(/[^a-zA-Z0-9]/g, '')}2026!`;
      const passwordHash = hashPassword(rawPassword);
      const inviteToken = generateToken();
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      const existingUser = await db.execute({
        sql: `SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1`,
        args: [userEmail]
      });

      let userId = '';
      if (existingUser.rows.length > 0) {
        userId = String(existingUser.rows[0].id);
        await db.execute({
          sql: `UPDATE users SET name = ?, password_hash = ?, role = ?, client_id = ?, region_scope = ?, invite_token = ?, invite_token_expires_at = ?, must_reset_password = 1 WHERE id = ?`,
          args: [userName, passwordHash, userRole, clientId, name, inviteToken, expiresAt, userId]
        });
      } else {
        userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await db.execute({
          sql: `INSERT INTO users (id, name, email, password_hash, role, region_scope, client_id, invite_token, invite_token_expires_at, must_reset_password, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
          args: [
            userId,
            userName,
            userEmail,
            passwordHash,
            userRole,
            name, // Scoped to this corporate client
            clientId,
            inviteToken,
            expiresAt,
            now
          ]
        });
      }

      // Generate executive HTML email template and dispatch via Resend
      const roleTitles: Record<string, string> = {
        platform_admin: 'Platform Administrator',
        content_editor: 'Corporate Content Editor',
        reviewer: 'Compliance Reviewer',
        publisher: 'Corporate Publisher',
        analyst: 'IR & Disclosures Analyst'
      };

      const host = req.headers.get('host') || 'localhost:3010';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      const inviteUrl = `${protocol}://${host}/admin/invite?token=${inviteToken}`;
      const directLoginUrl = `${protocol}://${host}/admin/login?email=${encodeURIComponent(userEmail)}`;

      const emailHtml = generateWelcomeEmailHtml({
        recipientName: userName,
        recipientEmail: userEmail,
        roleTitle: roleTitles[userRole] || 'Corporate Workspace Member',
        clientName: name,
        loginUrl: inviteUrl,
        temporaryPassword: rawPassword,
        inviterName: `${gate.user.name || 'Bastion Agency Operations'} (Bastion Group)`
      });

      emailDelivery = await sendTransactionalEmail({
        to: userEmail,
        subject: `Welcome to ${name} Corporate CMS Portal — Bastion Group`,
        html: emailHtml,
        roleTitle: roleTitles[userRole] || 'Corporate Workspace Member',
        clientName: name,
        inviteUrl
      });

      createdUser = {
        id: userId,
        name: userName,
        email: userEmail,
        role: userRole,
        temporaryPassword: rawPassword,
        inviteUrl,
        inviteToken,
        loginUrl: directLoginUrl,
        delivery: emailDelivery
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
        billingDetails: finalBillingDetails
      },
      website: {
        id: assembleResult.websiteId,
        name: websiteName,
        slug: siteSlug,
        previewUrl: assembleResult.previewUrl
      },
      user: createdUser,
      emailDelivery,
      compositionsCount: assembleResult.compositions.length
    });
  } catch (err: any) {
    console.error('Failed to onboard client:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
