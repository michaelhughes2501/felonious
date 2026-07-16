'use strict';

const express = require('express');

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

function readGoogleCreds() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    const missing = [
      !clientId && 'GOOGLE_OAUTH_CLIENT_ID',
      !clientSecret && 'GOOGLE_OAUTH_CLIENT_SECRET',
    ].filter(Boolean).join(', ');
    const err = new Error(`Google OAuth not configured (missing ${missing}).`);
    err.status = 500;
    throw err;
  }
  return { clientId, clientSecret };
}

// Return `expiresIn` (seconds) so the client can compute `expiresAt` against
// its own clock — avoids server/client clock-drift issues.
function shapeTokens(data) {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: Number(data.expires_in) || 0,
    scope: data.scope,
    tokenType: data.token_type,
  };
}

async function postToken(body) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  // Read as text first so we can still see the body if JSON.parse fails
  // (fetch response bodies can only be consumed once).
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    const err = new Error(`Invalid JSON from Google: ${text.slice(0, 200)}`);
    err.status = 502;
    throw err;
  }
  return { response, data };
}

const router = express.Router();

router.get('/config', (_req, res) => {
  res.json({ clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '' });
});

router.post('/oauth/exchange', async (req, res, next) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body || {};
    if (!code || !codeVerifier || !redirectUri) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const { clientId, clientSecret } = readGoogleCreds();
    const { response, data } = await postToken(new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }));
    if (!response.ok) {
      return res.status(response.status).json({
        message: data.error_description || data.error || 'Token exchange failed.',
      });
    }
    return res.json(shapeTokens(data));
  } catch (err) {
    return next(err);
  }
});

router.post('/oauth/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({ message: 'Missing refreshToken.' });
    }
    const { clientId, clientSecret } = readGoogleCreds();
    const { response, data } = await postToken(new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }));
    if (!response.ok) {
      return res.status(response.status).json({
        message: data.error_description || data.error || 'Token refresh failed.',
      });
    }
    const tokens = shapeTokens(data);
    // Google only rotates refresh tokens when explicitly configured — preserve
    // the caller's value when the response omits it.
    if (!tokens.refreshToken) tokens.refreshToken = refreshToken;
    return res.json(tokens);
  } catch (err) {
    return next(err);
  }
});

router.use((_req, res) => {
  res.status(404).json({ message: 'Integration route not found.' });
});

module.exports = router;
