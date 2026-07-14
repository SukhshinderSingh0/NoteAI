/**
 * Dashboard.jsx
 * The main landing view for logged-in users. Shows a grid of saved study
 * cards plus a prominent "New Study Session" CTA.
 *
 * Design: responsive light/dark mesh-gradient background, adaptive text colors,
 * emerald/gold accents, glassmorphism cards.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Grid, Card, CardContent,
  CardActions, IconButton, Chip, Skeleton, Tooltip,
  alpha, useTheme, Divider,
} from '@mui/material';
import AddIcon           from '@mui/icons-material/Add';
import ArticleIcon       from '@mui/icons-material/Article';
import StyleIcon         from '@mui/icons-material/Style';
import QuizIcon          from '@mui/icons-material/Quiz';
import DeleteIcon        from '@mui/icons-material/Delete';
import UploadFileIcon    from '@mui/icons-material/UploadFile';
import LockIcon          from '@mui/icons-material/Lock';
import FolderOffIcon     from '@mui/icons-material/FolderOff';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAuthContext }    from '../context/AuthContext';
import { useAppContext }     from '../context/AppContext';
import { apiListDocuments, apiDeleteDocument, apiGetDocument } from '../api/documentsApi';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function hasContent(doc) {
  return !!(doc.notesMarkdown || (doc.flashcardsJson?.length > 0) || (doc.quizJson?.length > 0));
}

// ---------------------------------------------------------------------------
// Skeleton card
// ---------------------------------------------------------------------------
function SkeletonCard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card sx={{ borderRadius: 4, bgcolor: isDark ? alpha('#fff', 0.05) : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
      <CardContent sx={{ p: 2.5 }}>
        <Skeleton variant="text" width="70%" height={24} sx={{ bgcolor: isDark ? alpha('#fff', 0.08) : 'rgba(0,0,0,0.06)' }} />
        <Skeleton variant="text" width="40%" height={18} sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'rgba(0,0,0,0.04)', mt: 1 }} />
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          {[1,2,3].map(i => <Skeleton key={i} variant="rounded" width={72} height={26} sx={{ bgcolor: isDark ? alpha('#fff', 0.05) : 'rgba(0,0,0,0.04)' }} />)}
        </Box>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Study card
// ---------------------------------------------------------------------------
function StudyCard({ doc, onDelete, onOpen }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${doc.originalFileName}"? This cannot be undone.`)) return;
    setDeleting(true);
    await onDelete(doc._id);
  };

  const badges = [
    doc.notesMarkdown && { label: 'Notes', color: '#059669' },
    doc.flashcardsJson?.length > 0 && { label: `${doc.flashcardsJson.length} Cards`, color: '#D97706' },
    doc.quizJson?.length > 0 && { label: 'Quiz', color: '#0D9488' },
  ].filter(Boolean);

  return (
    <Card
      sx={{
        borderRadius: 4,
        background: isDark
          ? 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #F8FAFC 100%)',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
        backdropFilter: 'blur(12px)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 30px rgba(0,0,0,0.08)',
          border: '1px solid rgba(5,150,105,0.35)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, pb: 1 }}>
        {/* File name */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 2, flexShrink: 0,
              background: 'linear-gradient(135deg, rgba(5,150,105,0.3), rgba(217,119,6,0.2))',
              border: '1px solid rgba(5,150,105,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <UploadFileIcon sx={{ fontSize: 18, color: '#34D399' }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle2" fontWeight={700} noWrap
                sx={{ color: isDark ? '#fff' : 'text.primary', fontSize: 14 }}
                title={doc.originalFileName}
              >
                {doc.originalFileName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                <CalendarTodayIcon sx={{ fontSize: 11, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} />
                <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'text.secondary', fontSize: 11 }}>
                  {formatDate(doc.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Box>
          {/* Delete */}
          <Tooltip title="Delete study">
            <IconButton
              size="small"
              onClick={handleDelete}
              disabled={deleting}
              sx={{
                color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                '&:hover': { color: '#f87171', bgcolor: alpha('#ef4444', 0.1) }, flexShrink: 0
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Content badges */}
        {badges.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 1.5 }}>
            {badges.map((b) => (
              <Chip
                key={b.label}
                label={b.label}
                size="small"
                sx={{
                  height: 20, fontSize: 10, fontWeight: 700,
                  bgcolor: alpha(b.color, 0.2),
                  color: b.color,
                  border: `1px solid ${alpha(b.color, 0.3)}`,
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>

      <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', mx: 2 }} />

      {/* Actions */}
      <CardActions sx={{ p: 1.5, pt: 1, gap: 0.5, flexWrap: 'wrap' }}>
        {[
          { label: 'Notes',      icon: ArticleIcon, view: 'notes',      disabled: !doc.notesMarkdown },
          { label: 'Flashcards', icon: StyleIcon,   view: 'flashcards', disabled: !doc.flashcardsJson?.length },
          { label: 'Quiz',       icon: QuizIcon,    view: 'quiz',       disabled: !doc.quizJson?.length },
        ].map(({ label, icon: Icon, view, disabled }) => (
          <Button
            key={label}
            size="small"
            startIcon={<Icon sx={{ fontSize: '14px !important' }} />}
            disabled={disabled}
            onClick={() => onOpen(doc, view)}
            sx={{
              fontSize: 12, fontWeight: 600, borderRadius: 1.5,
              color: disabled
                ? (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)')
                : (isDark ? '#fff' : 'text.primary'),
              bgcolor: disabled ? 'transparent' : (isDark ? alpha('#fff', 0.06) : alpha('#000', 0.04)),
              border: `1px solid ${disabled ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)')}`,
              '&:hover': { bgcolor: disabled ? 'transparent' : alpha('#059669', 0.15), borderColor: '#059669' },
              px: 1.25, py: 0.4,
            }}
          >
            {label}
          </Button>
        ))}
      </CardActions>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ onNew }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <FolderOffIcon sx={{ fontSize: 56, color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', mb: 2 }} />
      <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? '#fff' : 'text.primary', mb: 1 }}>
        No saved studies yet
      </Typography>
      <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary', mb: 3 }}>
        Upload a PDF and generate notes, flashcards, or a quiz to get started.
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onNew}
        sx={{
          background: 'linear-gradient(135deg, #059669, #D97706)',
          color: '#fff', fontWeight: 700, borderRadius: 2, px: 3,
          '&:hover': { background: 'linear-gradient(135deg, #047857, #B45309)' },
        }}
      >
        New Study Session
      </Button>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Unauthenticated overlay
// ---------------------------------------------------------------------------
function GuestOverlay({ onSignIn }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Blurred fake grid */}
      <Grid container spacing={2.5} sx={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
        {[1, 2, 3].map((i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Card sx={{ borderRadius: 4, bgcolor: isDark ? alpha('#fff', 0.04) : '#ffffff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, height: 160 }} />
          </Grid>
        ))}
      </Grid>
      {/* Lock overlay */}
      <Box sx={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 2,
      }}>
        <Box sx={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(5,150,105,0.3), rgba(217,119,6,0.2))',
          border: '1px solid rgba(5,150,105,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LockIcon sx={{ color: '#34D399', fontSize: 24 }} />
        </Box>
        <Typography variant="h6" fontWeight={800} sx={{ color: isDark ? '#fff' : 'text.primary' }}>
          Sign in to save your studies
        </Typography>
        <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'text.secondary', textAlign: 'center', maxWidth: 320 }}>
          Create a free account to save and revisit your notes, flashcards, and quizzes at any time.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={onSignIn}
          sx={{
            background: 'linear-gradient(135deg, #059669, #D97706)',
            color: '#fff', fontWeight: 700, borderRadius: 2, px: 3.5,
            '&:hover': { background: 'linear-gradient(135deg, #047857, #B45309)' },
          }}
        >
          Sign In / Sign Up
        </Button>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------
export default function Dashboard({ onOpenAuth }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { isAuthenticated, user } = useAuthContext();
  const {
    setActiveView,
    setFileName, setExtractedText, setNotes,
    setFlashcards, setQuiz, setCurrentDocId,
  } = useAppContext();

  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Load saved studies
  const loadDocs = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError('');
    try {
      const data = await apiListDocuments();
      setDocs(data.documents || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { loadDocs(); }, [loadDocs]);

  // Open a saved study and navigate to a workspace
  const handleOpen = async (doc, view) => {
    try {
      const full = await apiGetDocument(doc._id);
      const d = full.document;
      setFileName(d.originalFileName);
      setExtractedText(d.extractedText || '');
      setNotes(d.notesMarkdown || '');
      setFlashcards(d.flashcardsJson || []);
      setQuiz(d.quizJson || []);
      setCurrentDocId(d._id);
      setActiveView(view);
    } catch (err) {
      console.error('Failed to load document', err);
    }
  };

  // Delete a study
  const handleDelete = async (id) => {
    try {
      await apiDeleteDocument(id);
      setDocs((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleNew = () => setActiveView('upload');

  return (
    <Box
      sx={{
        minHeight: '80vh',
        borderRadius: 4,
        p: { xs: 2.5, sm: 3.5 },
        position: 'relative',
        overflow: 'hidden',
        // Mesh gradient background adaptive to theme mode
        background: isDark
          ? `
            radial-gradient(ellipse at 10% 20%, rgba(5,150,105,0.12) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 80%, rgba(217,119,6,0.08) 0%, transparent 55%),
            repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.015) 31px),
            repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.015) 31px),
            linear-gradient(160deg, #071A10 0%, #0D2518 60%, #071A10 100%)
          `
          : `
            radial-gradient(ellipse at 10% 20%, rgba(5,150,105,0.06) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 80%, rgba(217,119,6,0.04) 0%, transparent 55%),
            repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(0,0,0,0.02) 31px),
            repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(0,0,0,0.02) 31px),
            linear-gradient(160deg, #F0FDF4 0%, #ECFDF5 60%, #F0FDF4 100%)
          `,
      }}
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ color: isDark ? '#fff' : 'text.primary', letterSpacing: '-0.5px' }}>
            {isAuthenticated ? `Welcome back, ${user?.username} 👋` : 'Your Study Dashboard'}
          </Typography>
          <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'text.secondary', mt: 0.5 }}>
            {isAuthenticated
              ? `${docs.length} saved stud${docs.length === 1 ? 'y' : 'ies'}`
              : 'Sign in to save and revisit your studies'}
          </Typography>
        </Box>

        <Button
          id="dashboard-new-session"
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleNew}
          sx={{
            background: 'linear-gradient(135deg, #059669, #D97706)',
            color: '#fff', fontWeight: 700, borderRadius: 2.5, px: 3,
            boxShadow: isDark ? '0 4px 20px rgba(5,150,105,0.4)' : '0 4px 15px rgba(5,150,105,0.2)',
            '&:hover': {
              background: 'linear-gradient(135deg, #047857, #B45309)',
              transform: 'translateY(-1px)',
              boxShadow: isDark ? '0 8px 28px rgba(5,150,105,0.5)' : '0 6px 20px rgba(5,150,105,0.3)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          + New Study Session
        </Button>
      </Box>

      {/* ── Content ─────────────────────────────────────────────── */}
      {!isAuthenticated ? (
        <GuestOverlay onSignIn={onOpenAuth} />
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography sx={{ color: '#f87171' }}>{error}</Typography>
          <Button onClick={loadDocs} sx={{ mt: 2, color: '#34D399' }}>Retry</Button>
        </Box>
      ) : loading ? (
        <Grid container spacing={2.5}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}><SkeletonCard /></Grid>
          ))}
        </Grid>
      ) : docs.length === 0 ? (
        <EmptyState onNew={handleNew} />
      ) : (
        <Grid container spacing={2.5}>
          {docs.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc._id}>
              <StudyCard doc={doc} onDelete={handleDelete} onOpen={handleOpen} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
