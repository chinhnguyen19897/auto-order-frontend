import {NextRequest} from 'next/server';

export const dynamic = 'force-dynamic';

async function proxy(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const {path} = await context.params;
  // The browser only needs these API namespaces, never ingestion endpoints.
  if (!['auth', 'admin', 'checkout', 'health'].includes(path[0]) || path.some(p => p === '.' || p === '..' || p.includes('/'))) return Response.json({message: 'Not found'}, {status: 404});
  const url = new URL(path.map(encodeURIComponent).join('/'), (process.env.API_URL || 'http://localhost:4000') + '/');
  const headers = new Headers();
  for (const name of ['content-type', 'cookie', 'origin', 'x-admin-action']) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text();
    if (body && Buffer.byteLength(body) > 32768) return Response.json({message: 'Request too large.'}, {status: 413});
    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
      redirect: 'manual',
      signal: AbortSignal.timeout(30_000)
    });
    const outputHeaders = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer'
    });
    for (const cookie of response.headers.getSetCookie()) outputHeaders.append('Set-Cookie', cookie);
    return new Response(await response.text(), {status: response.status, headers: outputHeaders});
  } catch {
    return Response.json({message: 'API unavailable. Check the backend service.'}, {status: 502});
  }
}

export const GET = proxy, POST = proxy, PATCH = proxy;
