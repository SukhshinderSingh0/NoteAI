/**
 * authApi.js
 * Thin fetch wrappers for /api/auth/* endpoints.
 * All requests include credentials:include so the httpOnly JWT cookie is sent.
 */

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const BASE = `${API_BASE}/api/auth`;

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    // Prefer the first validation error message, else generic error
    const msg = data?.errors?.[0]?.msg || data?.error || 'Something went wrong.';
    throw new Error(msg);
  }
  return data;
}

export async function apiRegister({ username, email, password }) {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return handleResponse(res);
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function apiLogout() {
  const res = await fetch(`${BASE}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleResponse(res);
}

export async function apiGetMe() {
  const res = await fetch(`${BASE}/me`, { credentials: 'include' });
  if (res.status === 401) return null; // not authenticated — silent
  return handleResponse(res);
}
