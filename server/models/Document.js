const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalFileName: { type: String, required: true },
    extractedText:   { type: String, default: '' },
    notesMarkdown:   { type: String, default: '' },
    flashcardsJson:  { type: mongoose.Schema.Types.Mixed, default: [] },
    quizJson:        { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
