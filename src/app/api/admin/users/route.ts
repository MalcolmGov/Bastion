import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser, hashPassword } from '@/lib/auth/auth';
import { generateWelcomeEmailHtml } from '@/lib/email/welcomeTemplate';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const result = await db.execute(`
      SELECT id, name, email, role, region_scope, created_at, last_login 
      FROM users 
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ users: result.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      email,
      role = 'content_editor',
      clientName = 'Gold Fields Limited',
      clientScope = 'All',
      initialPassword = 'GoldFields2026!'
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    const db = getDb();

    // Check if user already exists
    const existing = await db.execute({
      sql: `SELECT id FROM users WHERE email = ? LIMIT 1`,
      args: [email]
    });

    const now = new Date().toISOString();
    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const passHash = hashPassword(initialPassword);

    if (existing.rows.length > 0) {
      // Update existing user role and scope
      await db.execute({
        sql: `UPDATE users SET name = ?, role = ?, region_scope = ? WHERE email = ?`,
        args: [name, role, clientScope, email]
      });
    } else {
      // Insert new user
      await db.execute({
        sql: `INSERT INTO users (id, name, email, password_hash, role, region_scope, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [userId, name, email, passHash, role, clientScope, now]
      });
    }

    // Role display title
    const roleTitles: Record<string, string> = {
      platform_admin: 'Platform Administrator',
      content_editor: 'Senior Content Editor',
      reviewer: 'Compliance Reviewer',
      publisher: 'Corporate Publisher',
      analyst: 'IR & Disclosures Analyst'
    };

    const host = req.headers.get('host') || 'localhost:3010';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const loginUrl = `${protocol}://${host}/admin/login?email=${encodeURIComponent(email)}`;

    // Generate Visual Welcome Email HTML
    const emailHtml = generateWelcomeEmailHtml({
      recipientName: name,
      recipientEmail: email,
      roleTitle: roleTitles[role] || 'Corporate Content Editor',
      clientName: clientName,
      loginUrl: loginUrl,
      temporaryPassword: initialPassword,
      inviterName: `${currentUser.name} (Bastion Group)`
    });

    return NextResponse.json({
      success: true,
      message: `User ${name} provisioned successfully!`,
      userId,
      email,
      loginUrl,
      emailHtml
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
