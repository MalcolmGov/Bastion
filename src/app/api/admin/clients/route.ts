import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import crypto from 'crypto';
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
      industry = 'financial_services',
      logoUrl,
      primaryDomain,
      tagline,
      contactInfo,
      billingDetails,
      initialUser,
      packageTier = 'Gold',
      packageServices = [],
      upfrontAmount,
      monthlyRetainer,
      packageAmount,
      currency = 'R',
      packageNotes = ''
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Corporate Client name is required.' }, { status: 400 });
    }

    const slug = rawSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const clientId = `client_${slug.replace(/[^a-z0-9]/gi, '_')}`;
    const siteSlug = slug;
    const now = new Date().toISOString();

    const db = getDb();

    // Consolidate package details into billingDetails with split upfront fee and monthly retainer
    const finalBillingDetails = {
      ...(billingDetails || {}),
      currency: currency || billingDetails?.currency || 'R',
      paymentTerms: billingDetails?.paymentTerms || 'Net 30 Days',
      package: {
        tier: packageTier || billingDetails?.package?.tier || 'Gold',
        upfrontAmount: upfrontAmount || billingDetails?.package?.upfrontAmount || packageAmount || '150,000',
        monthlyRetainer: monthlyRetainer || billingDetails?.package?.monthlyRetainer || '45,000',
        currency: currency || billingDetails?.package?.currency || 'R',
        paymentTerms: billingDetails?.paymentTerms || 'Net 30 Days',
        services: packageServices || billingDetails?.package?.services || [],
        notes: packageNotes || billingDetails?.package?.notes || ''
      }
    };

    // 1. Create or update client tenant record in database
    await db.execute({
      sql: `INSERT OR REPLACE INTO clients (id, name, slug, industry, logo_url, primary_contact_json, billing_details_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        clientId,
        name,
        slug,
        industry,
        logoUrl || null,
        contactInfo ? JSON.stringify(contactInfo) : null,
        JSON.stringify(finalBillingDetails),
        now,
        now
      ]
    });

    // 2. Provision initial clean shell website record for workspace navigation (no dummy Brand DNA or mock pages)
    const siteId = `site_${slug.replace(/[^a-z0-9]/gi, '_')}`;
    await db.execute({
      sql: `INSERT OR IGNORE INTO websites (id, client_id, name, slug, blueprint_id, design_collection_id, status, primary_domain, settings_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'corporate', 'editorial', 'draft', ?, ?, ?, ?)`,
      args: [
        siteId,
        clientId,
        `${name} Corporate Portal`,
        siteSlug,
        primaryDomain || null,
        JSON.stringify({
          status: 'pending_creation',
          tagline: tagline || `Official corporate portal for ${name}.`,
          enabledModules: {},
          navigation: { mainNav: [] }
        }),
        now,
        now
      ]
    });

    // 3. Provision default DAM media folders for client
    const defaultFolders = [
      'Logos & Brand DNA',
      'Executive Photography',
      'Regulatory Filings & PDFs',
      'Press & Media Assets'
    ];
    for (let i = 0; i < defaultFolders.length; i++) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO media_folders (id, name, client_id, created_at) VALUES (?, ?, ?, ?)`,
        args: [`fld_${slug.replace(/[^a-z0-9]/gi, '_')}_${i + 1}`, defaultFolders[i], clientId, now]
      });
    }

    // 4. Provision initial client user and dispatch secure password creation invite via Resend
    let createdUser: any = null;
    let emailDelivery: any = null;
    if (initialUser && initialUser.email) {
      const userEmail = String(initialUser.email).toLowerCase().trim();
      const userName = String(initialUser.name || `${name} Administrator`).trim();
      const userRole = String(initialUser.role || 'content_editor');
      const inviteToken = generateToken();
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
      const placeholderHash = hashPassword(crypto.randomBytes(32).toString('hex'));

      const existingUser = await db.execute({
        sql: `SELECT id FROM users WHERE LOWER(email) = ? LIMIT 1`,
        args: [userEmail]
      });

      let userId = '';
      if (existingUser.rows.length > 0) {
        userId = String(existingUser.rows[0].id);
        await db.execute({
          sql: `UPDATE users SET name = ?, role = ?, client_id = ?, region_scope = ?, invite_token = ?, invite_token_expires_at = ?, must_reset_password = 1 WHERE id = ?`,
          args: [userName, userRole, clientId, name, inviteToken, expiresAt, userId]
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
            placeholderHash,
            userRole,
            name, // Scoped to this corporate client
            clientId,
            inviteToken,
            expiresAt,
            now
          ]
        });
      }

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

      const emailHtml = generateWelcomeEmailHtml({
        recipientName: userName,
        recipientEmail: userEmail,
        roleTitle: roleTitles[userRole] || 'Corporate Workspace Member',
        clientName: name,
        loginUrl: inviteUrl,
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
        inviteUrl,
        inviteToken,
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
        primaryDomain,
        billingDetails: finalBillingDetails
      },
      website: {
        id: siteId,
        name: `${name} Corporate Portal`,
        slug: siteSlug,
        status: 'draft'
      },
      user: createdUser,
      emailDelivery
    });
  } catch (err: any) {
    console.error('Failed to onboard client:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
