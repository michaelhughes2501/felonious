'use strict';

const TOKEN_KEY_PREFIX = 'felonious_integration_tokens:';
const PENDING_KEY = 'felonious_integration_pending';

function saveTokens(id, tokens) {
  const t = { ...tokens };
  if (t.expiresIn && !t.expiresAt) t.expiresAt = Date.now() + t.expiresIn * 1000;
  localStorage.setItem(TOKEN_KEY_PREFIX + id, JSON.stringify(t));
}

function showError(message) {
  const card = document.getElementById('cb');
  if (!card) return;
  card.classList.add('error');
  card.innerHTML = '';
  const h1 = document.createElement('h1'); h1.textContent = 'Hookup failed';
  const p = document.createElement('p'); p.textContent = message;
  const back = document.createElement('p'); back.style.marginTop = '1rem';
  const a = document.createElement('a'); a.href = '/integrations'; a.textContent = 'Back to Hookups'; a.style.color = '#a5b4fc';
  back.appendChild(a);
  card.append(h1, p, back);
}

async function complete() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  if (error) return showError(params.get('error_description') || error);
  const code = params.get('code'), state = params.get('state');
  if (!code || !state) return showError('Missing authorization code in callback URL.');

  const raw = sessionStorage.getItem(PENDING_KEY);
  if (!raw) return showError('No pending OAuth flow found in this browser tab.');
  let pending;
  try {
    pending = JSON.parse(raw);
    if (!pending || typeof pending !== 'object') throw new Error();
  } catch {
    sessionStorage.removeItem(PENDING_KEY);
    return showError('Pending OAuth state is corrupted.');
  }
  sessionStorage.removeItem(PENDING_KEY);
  if (pending.state !== state) return showError('OAuth state mismatch — possible tampering. Try again.');

  try {
    const r = await fetch('/api/integrations/oauth/exchange', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, codeVerifier: pending.codeVerifier, redirectUri: pending.redirectUri }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.message || 'Token exchange failed.');
    saveTokens(pending.id, data);
    // Whitelist returnTo to local same-origin paths. Chrome normalizes
    // backslashes, so /\foo → //foo would be an open-redirect footgun.
    const returnTo = typeof pending.returnTo === 'string' ? pending.returnTo : '';
    const safe = returnTo.startsWith('/')
      && !returnTo.startsWith('//')
      && !returnTo.startsWith('/\\')
      ? returnTo
      : '/integrations';
    window.location.replace(safe);
  } catch (e) {
    showError(e.message || String(e));
  }
}

complete();
