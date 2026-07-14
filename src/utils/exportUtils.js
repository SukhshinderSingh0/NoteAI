/**
 * exportUtils.js
 * Client-side utilities for exporting generated study notes.
 */

import jsPDF from 'jspdf';

// ---------------------------------------------------------------------------
// Copy to Clipboard
// ---------------------------------------------------------------------------
/**
 * Copy text to the system clipboard using the modern Clipboard API.
 * @param {string} text
 * @returns {Promise<void>}
 */
export async function copyToClipboard(text) {
  if (!navigator.clipboard) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return;
  }
  await navigator.clipboard.writeText(text);
}

// ---------------------------------------------------------------------------
// Export as plain text (.txt)
// ---------------------------------------------------------------------------
/**
 * Trigger a browser download of the notes as a .txt file.
 * @param {string} text — The content to download
 * @param {string} [filename='study-notes.txt']
 */
export function exportAsTxt(text, filename = 'study-notes.txt') {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Export as PDF (.pdf)
// ---------------------------------------------------------------------------
/**
 * Render the notes text into a nicely formatted PDF using jsPDF.
 * Handles automatic line-wrapping and page breaks.
 *
 * @param {string} text — Plain or markdown text (markdown syntax stripped for PDF)
 * @param {string} [filename='study-notes.pdf']
 */
export function exportAsPdf(text, filename = 'study-notes.pdf') {
  const doc      = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW    = doc.internal.pageSize.getWidth();
  const pageH    = doc.internal.pageSize.getHeight();
  const margin   = 18;
  const maxWidth = pageW - margin * 2;
  const lineH    = 6;
  let   y        = margin;

  // Strip basic markdown syntax for cleaner PDF output
  const clean = text
    .replace(/#{1,6}\s+/g, '')   // headings
    .replace(/\*\*(.*?)\*\*/g, '$1') // bold
    .replace(/\*(.*?)\*/g, '$1')     // italic
    .replace(/`{1,3}([\s\S]*?)`{1,3}/g, '$1') // code
    .replace(/^>\s+/gm, '')      // blockquotes
    .replace(/^[-*]\s+/gm, '• ') // bullets
    .replace(/\n{3,}/g, '\n\n'); // excessive newlines

  // Header
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, pageW, 14, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('AI Study Notes', margin, 9.5);
  doc.setTextColor(0, 0, 0);
  y = 24;

  // Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const lines = clean.split('\n');
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line || ' ', maxWidth);
    for (const wrappedLine of wrapped) {
      if (y + lineH > pageH - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(wrappedLine, margin, y);
      y += lineH;
    }
  }

  doc.save(filename);
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------
function triggerDownload(url, filename) {
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
