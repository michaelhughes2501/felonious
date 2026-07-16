'use strict';

const PROVIDERS = [
  { id: 'google-classroom', label: 'Google Classroom', description: 'Post updates as Classroom announcements.',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/classroom.courses.readonly', 'https://www.googleapis.com/auth/classroom.announcements'] },
  { id: 'google-docs', label: 'Google Docs', description: 'Drop kit lists or plans into a Google Doc.',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/documents', 'https://www.googleapis.com/auth/drive.file'] },
  { id: 'google-forms', label: 'Google Forms', description: 'Generate intake forms from a template.',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/forms.body', 'https://www.googleapis.com/auth/drive.file'] },
  { id: 'google-keep', label: 'Google Keep', description: 'Save quick notes (Workspace + service account required).',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes: ['https://www.googleapis.com/auth/keep'] },
];

const TOKEN_KEY_PREFIX = 'felonious_integration_tokens:';
const PENDING_KEY = 'felonious_integration_pending';

const tokenKey = (id) => TOKEN_KEY_PREFIX + id;

function loadTokens(id) {
  try { const raw = localStorage.getItem(tokenKey(id)); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}
function saveTokens(id, tokens) {
  // Compute expiresAt on the client to avoid server/client clock drift.
  const t = { ...tokens };
  if (t.expiresIn && !t.expiresAt) t.expiresAt = Date.now() + t.expiresIn * 1000;
  localStorage.setItem(tokenKey(id), JSON.stringify(t));
}
function clearTokens(id) { localStorage.removeItem(tokenKey(id)); }
function isExpired(t) { return !t || !t.expiresAt || Date.now() > t.expiresAt - 60000; }

function randomB64Url(bytes) {
  const arr = new Uint8Array(bytes); crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function sha256B64Url(input) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

let cachedClientId = null;
async function getClientId() {
  if (cachedClientId !== null) return cachedClientId;
  const r = await fetch('/api/integrations/config');
  const d = await r.json();
  cachedClientId = d.clientId || '';
  return cachedClientId;
}

async function startConnect(provider) {
  const clientId = await getClientId();
  if (!clientId) throw new Error('Google OAuth client id is not configured (backend env).');
  const redirectUri = `${window.location.origin}/integrations/callback`;
  const state = randomB64Url(16);
  const codeVerifier = randomB64Url(64);
  const codeChallenge = await sha256B64Url(codeVerifier);
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ id: provider.id, state, codeVerifier, redirectUri, returnTo: '/integrations' }));
  const url = new URL(provider.authorizationEndpoint);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', provider.scopes.join(' '));
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  window.location.assign(url.toString());
}

function setStatus(msg, kind) {
  const el = document.getElementById('status');
  if (!el) return;
  el.textContent = msg || '';
  el.className = 'i-status' + (kind ? ' ' + kind : '');
}

async function refreshIfExpired() {
  for (const p of PROVIDERS) {
    const t = loadTokens(p.id);
    if (!t || !isExpired(t) || !t.refreshToken) continue;
    try {
      const r = await fetch('/api/integrations/oauth/refresh', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: t.refreshToken }),
      });
      if (r.ok) {
        const data = await r.json();
        saveTokens(p.id, { ...data, refreshToken: data.refreshToken || t.refreshToken });
      } else {
        clearTokens(p.id);
      }
    } catch { /* leave tokens; user can retry */ }
  }
}

function render() {
  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = '';
  for (const p of PROVIDERS) {
    const t = loadTokens(p.id);
    const on = !!t && !isExpired(t);
    const card = document.createElement('article');
    card.className = 'i-card';
    card.innerHTML = `
      <div class="i-card-h">
        <h2 class="i-card-t"></h2>
        <span class="i-badge ${on ? 'on' : ''}"></span>
      </div>
      <p class="i-desc"></p>
      <div class="i-actions"></div>`;
    card.querySelector('.i-card-t').textContent = p.label;
    card.querySelector('.i-badge').textContent = on ? 'Connected' : 'Not connected';
    card.querySelector('.i-desc').textContent = p.description;
    const actions = card.querySelector('.i-actions');
    if (on) {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = 'Cut ties';
      b.addEventListener('click', () => { clearTokens(p.id); setStatus(`${p.label} disconnected.`, 'success'); render(); });
      actions.appendChild(b);
    } else {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'primary'; b.textContent = 'Hook up';
      b.addEventListener('click', async () => {
        try { b.disabled = true; b.textContent = 'Redirecting…'; await startConnect(p); }
        catch (e) { b.disabled = false; b.textContent = 'Hook up'; setStatus(e.message || String(e), 'error'); }
      });
      actions.appendChild(b);
    }
    grid.appendChild(card);
  }
}

window.addEventListener('storage', (e) => {
  if (e.key && e.key.startsWith(TOKEN_KEY_PREFIX)) render();
});

(async () => { await refreshIfExpired(); render(); })();
