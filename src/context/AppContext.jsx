import { createContext, useContext, useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Context definition
// ---------------------------------------------------------------------------
const AppContext = createContext(null);

/**
 * Global application state provider.
 * Wraps the entire app and exposes study-session state via useAppContext().
 */
export function AppProvider({ children }) {
  // Uploaded content
  const [fileName, setFileName]           = useState('');
  const [extractedText, setExtractedText] = useState('');

  // Generated content
  const [notes, setNotes]           = useState('');
  const [flashcards, setFlashcards] = useState([]); // [{ question, answer }]
  const [quiz, setQuiz]             = useState([]);  // [{ question, options, correctAnswer }]

  // Currently open saved document ID (set after auto-save or when opening a saved study)
  const [currentDocId, setCurrentDocId] = useState(null);

  // Navigation
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard'|'upload'|'notes'|'flashcards'|'quiz'

  // Per-feature loading / error
  const [loading, setLoading] = useState({
    notes: false,
    flashcards: false,
    quiz: false,
    pdf: false,
  });
  const [error, setError] = useState({
    notes: '',
    flashcards: '',
    quiz: '',
    pdf: '',
  });

  /** Set a single loading key without touching others */
  const setLoadingKey = useCallback((key, value) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Set a single error key without touching others */
  const setErrorKey = useCallback((key, value) => {
    setError((prev) => ({ ...prev, [key]: value }));
  }, []);

  /**
   * Load a saved document's full data into session state.
   * Called by Dashboard when user clicks "Open Notes / Flashcards / Quiz".
   */
  const loadDocument = useCallback((doc) => {
    setFileName(doc.originalFileName || '');
    setExtractedText(doc.extractedText || '');
    setNotes(doc.notesMarkdown || '');
    setFlashcards(doc.flashcardsJson || []);
    setQuiz(doc.quizJson || []);
    setCurrentDocId(doc._id || null);
  }, []);

  /** Reset everything back to the initial upload state */
  const resetSession = useCallback(() => {
    setFileName('');
    setExtractedText('');
    setNotes('');
    setFlashcards([]);
    setQuiz([]);
    setCurrentDocId(null);
    setActiveView('upload');
    setLoading({ notes: false, flashcards: false, quiz: false, pdf: false });
    setError({ notes: '', flashcards: '', quiz: '', pdf: '' });
  }, []);

  const value = {
    fileName,     setFileName,
    extractedText, setExtractedText,
    notes,        setNotes,
    flashcards,   setFlashcards,
    quiz,         setQuiz,
    currentDocId, setCurrentDocId,
    activeView,   setActiveView,
    loading,      setLoadingKey,
    error,        setErrorKey,
    loadDocument,
    resetSession,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Hook for consuming the app context. Throws if used outside AppProvider. */
export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}
