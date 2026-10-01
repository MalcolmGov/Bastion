import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/auth';
import { isAgencyUser } from '@/lib/auth/roles';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customAlt = (formData.get('alt_text') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const mimeType = file.type || 'application/octet-stream';
    const sizeBytes = file.size;
    let fileUrl = '';

    // If Vercel Blob token is set, upload to cloud storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(cleanFilename, file, {
        access: 'public',
        addRandomSuffix: true
      });
      fileUrl = blob.url;
    } else {
      // Local dev fallback: write to public/assets
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const assetsDir = path.join(process.cwd(), 'public/assets');
      
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      const filePath = path.join(assetsDir, path.basename(cleanFilename));
      fs.writeFileSync(filePath, buffer);
      fileUrl = `/assets/${cleanFilename}`;
    }

    const db = getDb();
    const assetId = `asset_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date().toISOString();
    const altText = customAlt || `Gold Fields corporate asset: ${cleanFilename}`;

    const requestedClient = formData.get('clientId');
    const clientId = isAgencyUser(user)
      ? (typeof requestedClient === 'string' && requestedClient ? requestedClient : 'client_goldfields')
      : user.client_id;
    await db.execute({
      sql: `INSERT INTO media_assets (id, filename, url, mime_type, size_bytes, alt_text, caption, client_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        assetId,
        cleanFilename,
        fileUrl,
        mimeType,
        sizeBytes,
        altText,
        'Uploaded via Bastion Studio',
        clientId,
        now
      ]
    });

    // Audit log
    await db.execute({
      sql: `INSERT INTO audit_log (id, actor_id, actor_name, action, collection, record_id, result, details_json, correlation_id, ip_address, created_at)
            VALUES (?, ?, ?, 'MEDIA_UPLOAD', 'media_assets', ?, 'success', ?, ?, ?, ?)`,
      args: [
        `aud_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        user.id,
        user.name,
        assetId,
        JSON.stringify({ filename: cleanFilename, sizeBytes, url: fileUrl }),
        `corr_${Date.now()}`,
        req.headers.get('x-forwarded-for') || '127.0.0.1',
        now
      ]
    });

    return NextResponse.json({
      success: true,
      asset: {
        id: assetId,
        filename: cleanFilename,
        url: fileUrl,
        mime_type: mimeType,
        size_bytes: sizeBytes,
        alt_text: altText
      }
    });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
