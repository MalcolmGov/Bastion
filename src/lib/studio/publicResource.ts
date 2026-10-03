import { lookup } from 'node:dns/promises';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { isIP } from 'node:net';

export function publicAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b] = address.split('.').map(Number);
    return !(a === 0 || a === 10 || a === 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && (b === 168 || b === 0) || a === 100 && b >= 64 && b <= 127 || a === 198 && (b === 18 || b === 19) || a >= 224);
  }
  // Only global unicast IPv6. Mapped, local, link-local and multicast addresses are excluded.
  return isIP(address) === 6 && /^[23][0-9a-f]{3}:/i.test(address);
}
export async function readPublicResource(raw: string, maxBytes = 1500000, redirects = 0): Promise<{ url: string; body: Buffer; contentType: string; status: number }> {
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port && !['80', '443'].includes(url.port)) throw new Error('Use a public HTTP or HTTPS website on a standard port.');
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  if (hostname === 'localhost' || /\.(localhost|local|internal)$/.test(hostname)) throw new Error('Private website addresses are not allowed.');
  const addresses = await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(item => !publicAddress(item.address))) throw new Error('The website resolves to a private or reserved network.');
  const selected = addresses.find(item => item.family === 4) || addresses[0];
  return new Promise((resolve, reject) => {
    // Pin the checked address while preserving the original Host header and TLS server name.
    const req = (url.protocol === 'https:' ? httpsRequest : httpRequest)(url, {
      method: 'GET', headers: { 'User-Agent': 'BastionBrandStudio/1.0', Accept: '*/*' },
      lookup: (_host, options, callback) => {
        if (options.all) {
          (callback as unknown as (error: NodeJS.ErrnoException | null, entries: typeof addresses) => void)(null, [selected]);
        } else callback(null, selected.address, selected.family);
      },
    }, response => {
      const status = response.statusCode || 500;
      if (status >= 300 && status < 400) {
        response.resume();
        if (!response.headers.location || redirects >= 3) { reject(new Error('The website redirected too many times.')); return; }
        readPublicResource(new URL(response.headers.location, url).href, maxBytes, redirects + 1).then(resolve, reject);
        return;
      }
      if (status >= 400) { response.resume(); reject(new Error(`The website returned HTTP ${status}.`)); return; }
      const chunks: Buffer[] = []; let bytes = 0;
      response.on('data', (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes > maxBytes) { req.destroy(new Error('The website resource exceeds the extraction size limit.')); return; }
        chunks.push(chunk);
      });
      response.on('error', reject);
      response.on('end', () => resolve({ url: url.href, body: Buffer.concat(chunks), contentType: String(response.headers['content-type'] || ''), status }));
    });
    const timer = setTimeout(() => req.destroy(new Error('The website took too long to respond.')), 12000);
    req.on('close', () => clearTimeout(timer));
    req.on('error', reject); req.end();
  });
}
