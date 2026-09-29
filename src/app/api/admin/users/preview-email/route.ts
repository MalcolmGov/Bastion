import { NextRequest, NextResponse } from 'next/server';
import { generateWelcomeEmailHtml } from '@/lib/email/welcomeTemplate';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      recipientName = 'Malcolm Govender',
      recipientEmail = 'malcolm@movedigital.africa',
      role = 'content_editor',
      clientName = 'Moove Digital',
      initialPassword = 'GoldFields2026!'
    } = body;

    const roleTitles: Record<string, string> = {
      platform_admin: 'Platform Administrator',
      content_editor: 'Senior Content Editor',
      reviewer: 'Compliance Reviewer',
      publisher: 'Corporate Publisher',
      analyst: 'IR & Disclosures Analyst'
    };

    const host = req.headers.get('host') || 'localhost:3010';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const loginUrl = `${protocol}://${host}/admin/login?email=${encodeURIComponent(recipientEmail)}`;

    const emailHtml = generateWelcomeEmailHtml({
      recipientName,
      recipientEmail,
      roleTitle: roleTitles[role] || 'Corporate Content Editor',
      clientName,
      loginUrl,
      temporaryPassword: initialPassword,
      inviterName: 'Bastion Group Platform Operations'
    });

    return NextResponse.json({
      success: true,
      emailHtml,
      loginUrl
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
