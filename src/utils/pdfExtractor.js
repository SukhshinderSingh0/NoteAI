/**
 * pdfExtractor.js
 * Extracts plain text from a PDF File object using pdfjs-dist v3 (browser build).
 * Runs entirely client-side — no server required.
 *
 * pdfjs-dist v3 uses .js worker files (not .mjs) and has stable Vite compatibility
 * via the `?url` import suffix.
 */

import * as pdfjsLib from 'pdfjs-dist';

// Use Vite's `?url` suffix — returns the worker's hashed public URL as a string.
// This is the correct pattern for pdfjs-dist v3 + Vite.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.js?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/**
 * Read a PDF File and extract all its text content.
 *
 * @param {File} file — A PDF File object from an <input> or drop event
 * @param {(progress: number) => void} [onProgress] — Called with 0–100 progress
 * @returns {Promise<string>} — Concatenated text from all pages
 */
export async function extractTextFromPDF(file, onProgress) {
  // Use FileReader for reliable binary reading across all browsers
  const typedArray = await readFileAsTypedArray(file);

  // Load the PDF document from a Uint8Array
  const loadingTask = pdfjsLib.getDocument({ data: typedArray });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;

  const pageTexts = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    // Join all text items on this page
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ');

    pageTexts.push(pageText);

    // Report progress (0–100)
    if (onProgress) {
      onProgress(Math.round((i / totalPages) * 100));
    }
  }

  // Collapse excessive whitespace between pages
  return pageTexts.join('\n\n').replace(/\s{3,}/g, '\n\n').trim();
}

/**
 * Read a File as a Uint8Array via FileReader.
 *
 * @param {File} file
 * @returns {Promise<Uint8Array>}
 */
function readFileAsTypedArray(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(new Uint8Array(e.target.result));
    reader.onerror = (e) => reject(new Error('Failed to read file: ' + e.target.error?.message));
    reader.readAsArrayBuffer(file);
  });
}
