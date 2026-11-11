// RS-Brain login gate. Runs on Vercel's servers before any page or data file is sent.
// Set SITE_PASSWORD in Vercel: Project > Settings > Environment Variables, then redeploy.
// Signed-in browsers get a cookie that lasts 30 days. Changing SITE_PASSWORD signs everyone out.
import { next } from '@vercel/functions';

export const config = { matcher: ['/', '/:path*'] };

const COOKIE = 'rsb_auth';
const MAX_AGE = 60 * 60 * 24 * 30;
const enc = new TextEncoder();

function same(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function sign(text, secret) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64(await crypto.subtle.sign('HMAC', key, enc.encode(text)));
}

async function makeToken(secret) {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  return exp + '.' + (await sign(exp, secret));
}

async function validToken(token, secret) {
  const i = (token || '').indexOf('.');
  if (i < 1) return false;
  const exp = token.slice(0, i);
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return same(token.slice(i + 1), await sign(exp, secret));
}

function getCookie(request, name) {
  const m = (request.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : '';
}

const safeNext = (p) => (typeof p === 'string' && p.startsWith('/') && !p.startsWith('//') && !p.startsWith('/login') ? p : '/');

function page(error, nextPath, status = 200) {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sign in · RS-Brain</title>
<style>
:root{--bg:#f2f3f5;--panel:#fff;--ink:#14181f;--mute:#5b6472;--line:#d9dde4;--accent:#1f4fd8;--accent-ink:#fff;--err:#a1321f;--errbg:#f9e3df}
@media (prefers-color-scheme:dark){:root{--bg:#0b0e13;--panel:#131820;--ink:#e8ebf0;--mute:#9aa3b2;--line:#2b323d;--accent:#7ea2ff;--accent-ink:#0e1116;--err:#ffb4a8;--errbg:#3a1a16}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:20px;background:var(--bg);color:var(--ink);font:15px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.card{width:100%;max-width:380px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:32px 28px;box-shadow:0 10px 40px rgba(0,0,0,.12)}
.logo{display:flex;align-items:center;gap:12px;margin-bottom:22px}.badge{width:42px;height:42px;border-radius:11px;background:linear-gradient(135deg,#5b8cff,#3cc7c7);color:#fff;font-weight:800;display:grid;place-items:center;letter-spacing:.02em}
.logo b{display:block;font-size:18px;line-height:1.2}.logo span{font-size:12.5px;color:var(--mute)}
h1{font-size:20px;margin:0 0 4px}p{margin:0 0 20px;color:var(--mute);font-size:14px}
label{display:block;font-size:13px;font-weight:600;margin-bottom:6px}
.field{position:relative}input{width:100%;padding:11px 56px 11px 13px;border:1px solid var(--line);border-radius:10px;background:transparent;color:var(--ink);font:inherit}
input:focus{outline:2px solid var(--accent);outline-offset:1px;border-color:transparent}
.show{position:absolute;right:6px;top:50%;transform:translateY(-50%);border:0;background:none;color:var(--mute);font:inherit;font-size:12.5px;font-weight:600;padding:6px 8px;cursor:pointer;border-radius:6px}.show:hover{color:var(--ink)}
button.go{width:100%;margin-top:16px;padding:11px;border:0;border-radius:10px;background:var(--accent);color:var(--accent-ink);font:inherit;font-weight:700;cursor:pointer}button.go:hover{filter:brightness(1.08)}button.go:focus-visible{outline:2px solid var(--ink);outline-offset:2px}
.err{margin:0 0 14px;padding:9px 12px;border-radius:9px;background:var(--errbg);color:var(--err);font-size:13.5px}
small{display:block;margin-top:18px;text-align:center;color:var(--mute);font-size:12px}
</style></head><body><main class="card">
<div class="logo"><div class="badge">RS</div><div><b>RS-Brain</b><span>Market intelligence</span></div></div>
<h1>Sign in</h1><p>Enter the team password to continue.</p>
${error ? `<div class="err" role="alert">${error}</div>` : ''}
<form method="post" action="/login"><input type="hidden" name="next" value="${nextPath.replace(/"/g, '&quot;')}">
<label for="pw">Password</label><div class="field"><input id="pw" name="password" type="password" autocomplete="current-password" required autofocus><button type="button" class="show" id="sh" aria-label="Show password">Show</button></div>
<button class="go" type="submit">Sign in</button></form>
<small>You stay signed in on this device for 30 days.</small>
</main><script>var p=document.getElementById("pw"),b=document.getElementById("sh");b.onclick=function(){var s=p.type==="password";p.type=s?"text":"password";b.textContent=s?"Hide":"Show"}</script></body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY' } });
}

export default async function middleware(request) {
  const pass = process.env.SITE_PASSWORD;
  if (!pass) {
    return new Response('RS-Brain is locked. Set SITE_PASSWORD in the Vercel project settings, then redeploy.', {
      status: 503, headers: { 'Cache-Control': 'no-store' }
    });
  }
  const url = new URL(request.url);

  if (url.pathname === '/logout') {
    return new Response(null, { status: 302, headers: { Location: '/login', 'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`, 'Cache-Control': 'no-store' } });
  }

  if (url.pathname === '/login') {
    if (request.method === 'POST') {
      let given = '', nxt = '/';
      try { const f = await request.formData(); given = String(f.get('password') || ''); nxt = safeNext(f.get('next')); } catch (e) {}
      if (given && same(given, pass)) {
        return new Response(null, { status: 302, headers: { Location: nxt, 'Set-Cookie': `${COOKIE}=${await makeToken(pass)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`, 'Cache-Control': 'no-store' } });
      }
      await new Promise((r) => setTimeout(r, 500));
      return page('That password is not right. Try again.', nxt, 401);
    }
    if (await validToken(getCookie(request, COOKIE), pass)) return new Response(null, { status: 302, headers: { Location: '/' } });
    return page('', safeNext(url.searchParams.get('next')));
  }

  if (await validToken(getCookie(request, COOKIE), pass)) return next();

  const wantsPage = request.method === 'GET' && (request.headers.get('accept') || '').includes('text/html');
  if (wantsPage) {
    return new Response(null, { status: 302, headers: { Location: '/login?next=' + encodeURIComponent(url.pathname + url.search), 'Cache-Control': 'no-store' } });
  }
  return new Response('Login required', { status: 401, headers: { 'Cache-Control': 'no-store' } });
}
