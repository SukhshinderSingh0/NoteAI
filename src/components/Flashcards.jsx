/**
 * Flashcards.jsx
 * Interactive 3D flip-card study flashcards generated from the uploaded PDF.
 * Uses CSS perspective + rotateY transform for the flip animation.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, IconButton,
  LinearProgress, Alert, Chip, Skeleton, alpha, useTheme, Tooltip,
} from '@mui/material';
import ArrowBackIcon      from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon   from '@mui/icons-material/ArrowForward';
import AutorenewIcon      from '@mui/icons-material/Autorenew';
import StyleIcon          from '@mui/icons-material/Style';
import LightbulbIcon      from '@mui/icons-material/Lightbulb';
import { generateFlashcards } from '../services/gemini';
import { useAppContext }      from '../context/AppContext';
import EmptyState             from './EmptyState';

// ---------------------------------------------------------------------------
// Single flip-card
// ---------------------------------------------------------------------------
function FlipCard({ card, index, total }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [flipped, setFlipped] = useState(false);

  // Reset flip when card changes
  useEffect(() => setFlipped(false), [index]);

  const handleFlip = () => setFlipped((f) => !f);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlip();
    }
  };

  return (
    <Box
      className="flip-card-scene"
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={flipped ? 'Card showing answer. Press Enter to see question.' : 'Card showing question. Press Enter to flip and see answer.'}
    >
      <Box className={`flip-card-inner ${flipped ? 'is-flipped' : ''}`}>

        {/* ── Front face — Question ─────────────────────────────── */}
        <Box className="flip-card-face">
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #059669, #D97706)',
                p: 2, display: 'flex', alignItems: 'center', gap: 1,
              }}
            >
              <LightbulbIcon sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }} />
              <Typography variant="caption" fontWeight={700} sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Question
              </Typography>
              <Chip
                label={`${index + 1} / ${total}`}
                size="small"
                sx={{
                  ml: 'auto', height: 20, fontSize: 10,
                  bgcolor: 'rgba(255,255,255,0.2)', color: '#fff',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Box>

            {/* Question text */}
            <CardContent
              sx={{
                flexGrow: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', p: 3,
              }}
            >
              <Typography variant="h6" fontWeight={600} textalign="center" sx={{ lineHeight: 1.6 }}>
                {card.question}
              </Typography>
            </CardContent>

            {/* Hint */}
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Click or press Enter to reveal answer
              </Typography>
            </Box>
          </Card>
        </Box>

        {/* ── Back face — Answer ───────────────────────────────── */}
        <Box className="flip-card-face flip-card-back">
          <Card
            sx={{
              height: '100%', display: 'flex', flexDirection: 'column',
              background: isDark
                ? 'linear-gradient(135deg, #1A1A3E, #16162A)'
                : 'linear-gradient(135deg, #EEF2FF, #F5F0FF)',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                p: 2, display: 'flex', alignItems: 'center', gap: 1,
              }}
            >
              <LightbulbIcon sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }} />
              <Typography variant="caption" fontWeight={700} sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', letterSpacing: 1 }}>
                Answer
              </Typography>
              <Chip
                label={`${index + 1} / ${total}`}
                size="small"
                sx={{
                  ml: 'auto', height: 20, fontSize: 10,
                  bgcolor: 'rgba(255,255,255,0.2)', color: '#fff',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            </Box>

            {/* Answer text */}
            <CardContent
              sx={{
                flexGrow: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', p: 3,
              }}
            >
              <Typography variant="body1" textAlign="center" sx={{ lineHeight: 1.75 }} color="text.primary">
                {card.answer}
              </Typography>
            </CardContent>

            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                Click to flip back
              </Typography>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function FlashcardSkeleton() {
  return (
    <Box sx={{ height: 340 }}>
      <Skeleton variant="rounded" height="100%" sx={{ borderRadius: 4 }} />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Flashcards() {
  const theme = useTheme();
  const {
    flashcards, setFlashcards, extractedText,
    loading, setLoadingKey, error, setErrorKey,
  } = useAppContext();

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleGenerate = useCallback(async () => {
    if (!extractedText) return;
    setErrorKey('flashcards', '');
    setLoadingKey('flashcards', true);
    setCurrentIndex(0);
    try {
      const cards = await generateFlashcards(extractedText);
      setFlashcards(cards);
    } catch (err) {
      setErrorKey('flashcards', err.message);
    } finally {
      setLoadingKey('flashcards', false);
    }
  }, [extractedText, setFlashcards, setLoadingKey, setErrorKey]);

  // Auto-generate if we have text but no cards yet
  useEffect(() => {
    if (extractedText && flashcards.length === 0 && !loading.flashcards) {
      handleGenerate();
    }
  }, [extractedText]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const handleNext = () => setCurrentIndex((i) => Math.min(flashcards.length - 1, i + 1));

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft')  handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  if (!extractedText) {
    return (
      <EmptyState
        icon={<StyleIcon />}
        title="No Document Uploaded"
        description="Upload a PDF first to generate flashcards."
      />
    );
  }

  const total   = flashcards.length;
  const current = flashcards[currentIndex];

  return (
    <Box className="fade-in-up">
      {/* ── Header row ───────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight={700}>Flashcards</Typography>
          <Typography variant="body2" color="text.secondary">
            Click a card to flip it • Use ← → arrow keys to navigate
          </Typography>
        </Box>
        <Tooltip title="Regenerate flashcards">
          <Button
            variant="outlined"
            startIcon={<AutorenewIcon />}
            onClick={handleGenerate}
            disabled={loading.flashcards}
            size="small"
          >
            Regenerate
          </Button>
        </Tooltip>
      </Box>

      {/* ── Error ────────────────────────────────────────────────── */}
      {error.flashcards && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setErrorKey('flashcards', '')}>
          {error.flashcards}
        </Alert>
      )}

      {/* ── Progress bar ─────────────────────────────────────────── */}
      {total > 0 && !loading.flashcards && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={((currentIndex + 1) / total) * 100}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Card {currentIndex + 1} of {total}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(((currentIndex + 1) / total) * 100)}% complete
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── Flip card ────────────────────────────────────────────── */}
      <Box sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
        {loading.flashcards ? (
          <>
            <FlashcardSkeleton />
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
              Generating flashcards with AI…
            </Typography>
          </>
        ) : current ? (
          <FlipCard card={current} index={currentIndex} total={total} />
        ) : null}
      </Box>

      {/* ── Navigation controls ──────────────────────────────────── */}
      {total > 0 && !loading.flashcards && (
        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2,
            p: 2, borderRadius: 3,
            background: alpha(theme.palette.primary.main, 0.04),
            border: `1px solid ${theme.palette.divider}`,
            maxWidth: 600, mx: 'auto',
          }}
        >
          <IconButton
            onClick={handlePrev}
            disabled={currentIndex === 0}
            color="primary"
            sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
            aria-label="Previous card"
          >
            <ArrowBackIcon />
          </IconButton>

          {/* Dot indicators (up to 12) */}
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
            {flashcards.slice(0, 12).map((_, i) => (
              <Box
                key={i}
                onClick={() => setCurrentIndex(i)}
                sx={{
                  width: i === currentIndex ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: i === currentIndex
                    ? 'linear-gradient(90deg, #059669, #D97706)'
                    : alpha(theme.palette.primary.main, 0.25),
                }}
                aria-label={`Go to card ${i + 1}`}
              />
            ))}
          </Box>

          <IconButton
            onClick={handleNext}
            disabled={currentIndex === total - 1}
            color="primary"
            sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
            aria-label="Next card"
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
