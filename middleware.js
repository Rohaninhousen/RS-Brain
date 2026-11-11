// RS-Brain login gate. Runs on Vercel's servers before any page or data file is sent.
// Set SITE_USER and SITE_PASSWORD in Vercel: Project > Settings > Environment Variables.
import { next } from '@vercel/functions';

export const config = { matcher: ['/', '/:path*'] };

function same(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

export default function middleware(request) {
  const user = process.env.SITE_USER || 'team';
  const pass = process.env.SITE_PASSWORD;
  if (!pass) {
    return new Response('RS-Brain is locked. Set SITE_PASSWORD in the Vercel project settings, then redeploy.', {
      status: 503, headers: { 'Cache-Control': 'no-store' }
    });
  }
  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const i = decoded.indexOf(':');
      if (i > -1 && same(decoded.slice(0, i), user) && same(decoded.slice(i + 1), pass)) return next();
    } catch (e) {}
  }
  return new Response('Login required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="RS-Brain", charset="UTF-8"', 'Cache-Control': 'no-store' }
  });
}
