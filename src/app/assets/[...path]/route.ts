import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const pathSegments = resolvedParams?.path || [];
  const cleanPath = pathSegments.join('/');

  const decodedPath = decodeURIComponent(cleanPath);
  // Prevent directory traversal attacks
  const safeFilename = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '');
  const assetsDir = path.join(process.cwd(), 'public/assets');
  let filePath = path.join(assetsDir, safeFilename);

  if (!fs.existsSync(filePath)) {
    // Check direct public root fallback
    const publicFallback = path.join(process.cwd(), 'public', safeFilename);
    if (fs.existsSync(publicFallback) && fs.statSync(publicFallback).isFile()) {
      filePath = publicFallback;
    } else {
      return new NextResponse('Asset not found', { status: 404 });
    }
  }

  const stat = fs.statSync(filePath);
  if (!stat.isFile()) {
    return new NextResponse('Invalid asset path', { status: 400 });
  }

  const ext = path.extname(safeFilename).toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.ico': 'image/x-icon',
    '.json': 'application/json'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
    }
  });
}
