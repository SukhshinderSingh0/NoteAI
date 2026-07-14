

import { GoogleGenerativeAI } from '@google/generative-ai';

// ---------------------------------------------------------------------------
// SDK initialisation
// ---------------------------------------------------------------------------
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn(
    '[Gemini] VITE_GEMINI_API_KEY is not set. ' +
    'Copy .env.example to .env and add your key.'
  );
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

const getModel = () =>
  genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// ---------------------------------------------------------------------------
// Helper: safely parse JSON from a Gemini response string.
// Gemini sometimes wraps JSON in a markdown code fence — strip it first.
// ---------------------------------------------------------------------------
function parseJsonResponse(raw) {
  // Remove ```json ... ``` or ``` ... ``` fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  return JSON.parse(cleaned);
}

// ---------------------------------------------------------------------------
// 1. Generate Study Notes (Markdown)
// ---------------------------------------------------------------------------
/**
 * Sends extracted PDF text to Gemini and requests well-structured study notes
 * in Markdown format.
 *
 * @param {string} text — Raw extracted text from the PDF
 * @returns {Promise<string>} — Markdown-formatted study notes
 */
export async function generateNotes(text) {
  const model = getModel();

  const prompt = `You are an expert educator and study coach.

TASK: Generate comprehensive, well-structured study notes from the content provided below.

FORMATTING RULES (strictly follow):
- Use Markdown with proper headings (## for main topics, ### for subtopics)
- Bold key terms and definitions using **bold**
- Use bullet points for lists and enumerated steps
- Use > blockquotes for important callouts or key takeaways
- Use code blocks (\`\`\`) for any technical content, formulas, or examples
- Include a "## 📋 Key Takeaways" section at the end summarising the 5–7 most important points
- Write clearly and concisely; avoid padding

CONTENT TO SUMMARISE:
---
${text.slice(0, 30000)}
---`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// ---------------------------------------------------------------------------
// 2. Generate Flashcards (strict JSON)
// ---------------------------------------------------------------------------
/**
 * Sends extracted text to Gemini and requests a JSON array of Q&A flashcards.
 *
 * @param {string} text — Raw extracted text from the PDF
 * @returns {Promise<Array<{question: string, answer: string}>>}
 */
export async function generateFlashcards(text) {
  const model = getModel();

  const prompt = `You are a study assistant that creates effective flashcards.

TASK: Create exactly 12 flashcard question-answer pairs based on the content below.

OUTPUT FORMAT: Return ONLY a valid JSON array. No explanations, no markdown fences, no extra text.
The array must follow this exact schema:
[
  { "question": "...", "answer": "..." },
  ...
]

GUIDELINES:
- Questions should test understanding, not just recall
- Answers should be concise (1–3 sentences max)
- Cover the most important concepts from the material
- Vary question types (definition, comparison, application, why/how)

CONTENT:
---
${text.slice(0, 25000)}
---

Return ONLY the JSON array now:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const raw = response.text();

  try {
    return parseJsonResponse(raw);
  } catch (err) {
    console.error('[Gemini] Failed to parse flashcards JSON:', raw);
    throw new Error('Gemini returned invalid JSON for flashcards. Please try regenerating.');
  }
}

// ---------------------------------------------------------------------------
// 3. Generate Quiz (strict JSON)
// ---------------------------------------------------------------------------
/**
 * Sends extracted text to Gemini and requests a JSON array of multiple-choice
 * quiz questions.
 *
 * @param {string} text
 * @returns {Promise<Array<{question: string, options: string[], correctAnswer: string}>>}
 */
export async function generateQuiz(text) {
  const model = getModel();

  const prompt = `You are an expert quiz creator for educational purposes.

TASK: Create exactly 8 multiple-choice quiz questions based on the content below.

OUTPUT FORMAT: Return ONLY a valid JSON array. No explanations, no markdown fences, no extra text.
The array must follow this exact schema:
[
  {
    "question": "...",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctAnswer": "Option A text"
  },
  ...
]

IMPORTANT RULES:
- The "correctAnswer" value must be the EXACT TEXT of the correct option (not "A", "B", etc.)
- All 4 options must be plausible (avoid obviously wrong distractors)
- Questions should test meaningful comprehension, not trivial facts
- Vary difficulty: ~2 easy, ~4 medium, ~2 hard

CONTENT:
---
${text.slice(0, 25000)}
---

Return ONLY the JSON array now:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const raw = response.text();

  try {
    return parseJsonResponse(raw);
  } catch (err) {
    console.error('[Gemini] Failed to parse quiz JSON:', raw);
    throw new Error('Gemini returned invalid JSON for the quiz. Please try regenerating.');
  }
}
