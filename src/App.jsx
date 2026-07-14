/**
 * App.jsx — Root component.
 *
 * Auth modal is lifted here so both Navbar and HomePage can trigger it.
 * After auth success the user is routed to 'dashboard'.
 * Unauthenticated visitors are redirected to 'home' once the auth check resolves.
 * Home view is rendered full-width (no px/maxWidth constraints).
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { buildTheme }      from './theme';
import { AuthProvider }    from './context/AuthContext';
import { AppProvider, useAppContext } from './context/AppContext';
import { useAuthContext }  from './context/AuthContext';
import Navbar              from './components/layout/Navbar';
import TabNav              from './components/layout/TabNav';
import HomePage            from './components/HomePage';
import Dashboard           from './components/Dashboard';
import PDFUploader         from './components/PDFUploader';
import NotesViewer         from './components/NotesViewer';
import Flashcards          from './components/Flashcards';
import Quiz                from './components/Quiz';
import Profile             from './components/Profile';
import AuthModal           from './components/auth/AuthModal';
import { apiCreateDocument, apiUpdateDocument } from './api/documentsApi';

// ── Constants ─────────────────────────────────────────────────────────────
const NAVBAR_H    = 52;  // px — AppBar height
const TABNAV_H    = 44;  // px — TabNav height
const CHROME_H    = NAVBAR_H + TABNAV_H;

// ── AutoSave ─────────────────────────────────────────────────────────────
function AutoSave() {
  const { notes, flashcards, quiz, fileName, extractedText, currentDocId, setCurrentDocId } = useAppContext();
  const { isAuthenticated } = useAuthContext();

  const prevNotes      = useRef('');
  const prevFlashcards = useRef([]);
  const prevQuiz       = useRef([]);
  const saving         = useRef(false);

  const save = async ({ field, value }) => {
    if (!isAuthenticated || saving.current) return;
    saving.current = true;
    try {
      if (currentDocId) {
        await apiUpdateDocument(currentDocId, { [field]: value });
      } else if (fileName) {
        const res = await apiCreateDocument({
          originalFileName: fileName,
          extractedText,
          notesMarkdown:    field === 'notesMarkdown'  ? value : notes,
          flashcardsJson:   field === 'flashcardsJson' ? value : flashcards,
          quizJson:         field === 'quizJson'       ? value : quiz,
        });
        setCurrentDocId(res.document._id);
      }
    } catch (err) {
      console.warn('[AutoSave] Failed:', err.message);
    } finally {
      saving.current = false;
    }
  };

  useEffect(() => {
    if (!notes || notes === prevNotes.current) return;
    prevNotes.current = notes;
    save({ field: 'notesMarkdown', value: notes });
  }, [notes, isAuthenticated]); // eslint-disable-line

  useEffect(() => {
    if (!flashcards.length || flashcards === prevFlashcards.current) return;
    prevFlashcards.current = flashcards;
    save({ field: 'flashcardsJson', value: flashcards });
  }, [flashcards, isAuthenticated]); // eslint-disable-line

  useEffect(() => {
    if (!quiz.length || quiz === prevQuiz.current) return;
    prevQuiz.current = quiz;
    save({ field: 'quizJson', value: quiz });
  }, [quiz, isAuthenticated]); // eslint-disable-line

  return null;
}

// ── Inner layout — consumes both contexts ─────────────────────────────────
function AppLayout({ onToggleTheme }) {
  const { activeView, setActiveView } = useAppContext();
  const { isAuthenticated, authLoading } = useAuthContext();

  // Lifted auth modal state — shared between Navbar, HomePage, and Dashboard
  const [authOpen, setAuthOpen] = useState(false);
  const openAuth = () => setAuthOpen(true);

  // After auth bootstrap resolves, redirect unauthenticated visitors to homepage
  const didInitRef = useRef(false);
  useEffect(() => {
    if (authLoading || didInitRef.current) return;
    didInitRef.current = true;
    if (!isAuthenticated) setActiveView('home');
  }, [authLoading]); // eslint-disable-line

  // When user logs in while on the homepage, go to dashboard
  useEffect(() => {
    if (isAuthenticated && activeView === 'home') {
      setActiveView('dashboard');
    }
  }, [isAuthenticated]); // eslint-disable-line

  const isHome = activeView === 'home';

  const renderView = () => {
    switch (activeView) {
      case 'home':       return <HomePage     onOpenAuth={openAuth} />;
      case 'dashboard':  return <Dashboard    onOpenAuth={openAuth} />;
      case 'upload':     return <PDFUploader />;
      case 'notes':      return <NotesViewer />;
      case 'flashcards': return <Flashcards />;
      case 'quiz':       return <Quiz />;
      case 'profile':    return <Profile />;
      default:           return <HomePage     onOpenAuth={openAuth} />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* ── Fixed chrome: Navbar + TabNav ────────────────────── */}
      <Box
        component="header"
        sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: (t) => t.zIndex.appBar }}
      >
        <Navbar onToggleTheme={onToggleTheme} onOpenAuth={openAuth} />
        <Box sx={{ mt: `${NAVBAR_H}px` }}>
          <TabNav />
        </Box>
      </Box>

      {/* ── Scrollable content ─────────────────────────────────── */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: `${CHROME_H}px`,
          // Home view: full-width, no padding / max-width constraints
          ...(isHome
            ? {}
            : {
                px: { xs: 2, sm: 3, md: 4 },
                pb: 6,
                maxWidth: activeView === 'dashboard' ? 1100 : 900,
                width: '100%',
                mx: 'auto',
              }),
        }}
      >
        {isHome
          ? renderView()
          : <Box sx={{ pt: 3 }}>{renderView()}</Box>
        }
      </Box>

      {/* ── Side-effects ───────────────────────────────────────── */}
      <AutoSave />

      {/* ── Global auth modal ─────────────────────────────────── */}
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          setActiveView('dashboard');
        }}
      />
    </Box>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [mode, setMode] = useState(() => localStorage.getItem('theme-mode') || 'dark');
  const theme = useMemo(() => buildTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((m) => {
      const next = m === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', next);
      return next;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppProvider>
          <AppLayout onToggleTheme={toggleTheme} />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
