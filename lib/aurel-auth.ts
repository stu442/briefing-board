const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function sessionKey(secret: string) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function createAurelSession(secret: string) {
  const expiresAt = String(Date.now() + 1000 * 60 * 60 * 24 * 30);
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', await sessionKey(secret), encoder.encode(expiresAt)));
  return `${expiresAt}.${toBase64Url(signature)}`;
}

export async function verifyAurelSession(token: string | undefined, secret: string | undefined) {
  if (!token || !secret) return false;
  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt) || Number(expiresAt) < Date.now()) return false;
  try {
    return crypto.subtle.verify('HMAC', await sessionKey(secret), fromBase64Url(signature), encoder.encode(expiresAt));
  } catch {
    return false;
  }
}
