import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';
import { getCurrentUser } from '@/lib/auth/auth';
import { isAgencyUser } from '@/lib/auth/roles';
import { resolveTargetClientId } from '@/lib/auth/guard';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf'
]);

function isUnsafeSvg(svgText: string): boolean {
  const dangerousPatterns = [
    /<script\b/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    /onclick\s*=/i,
    /onmouseover\s*=/i,
    /javascript:/i,
    /xlink:href\s*=\s*['"]\s*javascript:/i,
    /<foreignObject\b/i
  ];
  return dangerousPatterns.some(pattern => pattern.test(svgText));
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const customAlt = (formData.get('alt_text') as string) || '';
    const customFolder = (formData.get('folder_id') as string) || 'corporate';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 1. File size limit
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({
        error: `File size exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB)`
      }, { status: 413 });
    }

    // 2. MIME type verification
    const mimeType = (file.type || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json({
        error: `Unsupported file type '${mimeType}'. Allowed formats: JPEG, PNG, WebP, SVG, PDF.`
      }, { status: 415 });
    }

    // 3. SVG Safety Check
    const isSvg = mimeType === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (isSvg) {
      const svgText = buffer.toString('utf8');
      if (isUnsafeSvg(svgText)) {
        return NextResponse.json({
          error: 'Unsafe SVG: embedded scripts or active event handlers are strictly prohibited.'
        }, { status: 400 });
      }
    }

    // 4. Client Isolation
    const requestedClient = formData.get('clientId');
    const clientId = resolveTargetClientId(user, req, requestedClient ? String(requestedClient) : null);
    if (!clientId) {
      return NextResponse.json({
        error: isAgencyUser(user)
          ? 'Agency uploads must specify an explicit target clientId or active workspace.'
          : 'User is not assigned to a client workspace.'
      }, { status: 400 });
    }

    const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const sizeBytes = file.size;
    let fileUrl = '';

    // If Vercel Blob token is set, upload to cloud storage
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(cleanFilename, buffer, {
        access: 'public',
        addRandomSuffix: true,
        contentType: mimeType
      });
      fileUrl = blob.url;
    } else {
      // Local dev fallback: write to public/assets
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
    const altText = customAlt || `Corporate asset: ${cleanFilename}`;

    await db.execute({
      sql: `INSERT INTO media_assets (id, filename, url, mime_type, size_bytes, alt_text, caption, client_id, folder_id, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        assetId,
        cleanFilename,
        fileUrl,
        mimeType,
        sizeBytes,
        altText,
        'Uploaded via Bastion Studio',
        clientId,
        customFolder,
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
        JSON.stringify({ filename: cleanFilename, sizeBytes, url: fileUrl, clientId }),
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
        alt_text: altText,
        clientId
      }
    });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
