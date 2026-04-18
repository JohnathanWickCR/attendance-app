const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30;

export const AUTH_COOKIE_NAME = 'attendance_app_session';
export const DEFAULT_LOGIN_REDIRECT = '/attendance';

function getAuthPassword() {
  return process.env.APP_LOGIN_PASSWORD ?? process.env.AUTH_PASSWORD ?? '';
}

function getAuthSecret() {
  return (
    process.env.APP_SESSION_SECRET ??
    process.env.AUTH_SECRET ??
    getAuthPassword()
  );
}

function textToBytes(value: string) {
  return new TextEncoder().encode(value);
}

function bytesToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function signValue(value: string) {
  const secret = getAuthSecret();

  if (!secret) {
    return '';
  }

  const key = await crypto.subtle.importKey(
    'raw',
    textToBytes(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, textToBytes(value));
  return bytesToHex(signature);
}

export function isAuthConfigured() {
  return Boolean(getAuthPassword());
}

export function getSessionDurationSeconds() {
  return SESSION_DURATION_SECONDS;
}

export function isValidLoginPassword(password: string) {
  return isAuthConfigured() && password === getAuthPassword();
}

export async function createSessionToken() {
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const payload = String(expiresAt);
  const signature = await signValue(payload);

  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string) {
  const [expiresAt, signature] = token.split('.');

  if (!expiresAt || !signature) {
    return false;
  }

  if (Number.isNaN(Number(expiresAt)) || Number(expiresAt) <= Date.now()) {
    return false;
  }

  const expectedSignature = await signValue(expiresAt);
  return expectedSignature === signature;
}

export function normalizeRedirectTarget(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return DEFAULT_LOGIN_REDIRECT;
  }

  if (value === '/login') {
    return DEFAULT_LOGIN_REDIRECT;
  }

  return value;
}
