const express  = require('express');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All document routes require authentication
router.use(requireAuth);

// GET /api/documents  — list user's saved studies
router.get('/', async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user.userId })
      .select('-extractedText') // omit large text in list view
      .sort({ createdAt: -1 });
    res.json({ documents: docs });
  } catch (err) {
    console.error('[documents/list]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/documents/:id  — get single document (full content)
router.get('/:id', async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    res.json({ document: doc });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/documents  — create a new saved study
router.post(
  '/',
  [body('originalFileName').trim().notEmpty().withMessage('File name is required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { originalFileName, extractedText, notesMarkdown, flashcardsJson, quizJson } = req.body;
      const doc = await Document.create({
        userId: req.user.userId,
        originalFileName,
        extractedText:  extractedText  || '',
        notesMarkdown:  notesMarkdown  || '',
        flashcardsJson: flashcardsJson || [],
        quizJson:       quizJson       || [],
      });
      res.status(201).json({ document: doc });
    } catch (err) {
      console.error('[documents/create]', err);
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// PATCH /api/documents/:id  — update notes/flashcards/quiz on existing doc
router.patch('/:id', async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!doc) return res.status(404).json({ error: 'Document not found.' });

    const allowedFields = ['notesMarkdown', 'flashcardsJson', 'quizJson', 'extractedText'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) doc[field] = req.body[field];
    });

    await doc.save();
    res.json({ document: doc });
  } catch (err) {
    console.error('[documents/update]', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/documents/:id
router.delete('/:id', async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    res.json({ message: 'Study deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
