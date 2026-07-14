/**
 * documentsApi.js
 * Fetch wrappers for /api/documents/* endpoints.
 */

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const BASE = `${API_BASE}/api/documents`;

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.errors?.[0]?.msg || data?.error || 'Something went wrong.';
    throw new Error(msg);
  }
  return data;
}

/** List all saved studies for the current user. */
export async function apiListDocuments() {
  const res = await fetch(BASE, { credentials: 'include' });
  return handleResponse(res);
}

/** Fetch a single document's full content (including extractedText). */
export async function apiGetDocument(id) {
  const res = await fetch(`${BASE}/${id}`, { credentials: 'include' });
  return handleResponse(res);
}

/**
 * Create a new saved study.
 * @param {{ originalFileName, extractedText, notesMarkdown, flashcardsJson, quizJson }} payload
 */
export async function apiCreateDocument(payload) {
  const res = await fetch(BASE, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Update an existing study's content fields.
 * @param {string} id
 * @param {{ notesMarkdown?, flashcardsJson?, quizJson? }} fields
 */
export async function apiUpdateDocument(id, fields) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  return handleResponse(res);
}

/** Permanently delete a saved study. */
export async function apiDeleteDocument(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(res);
}
