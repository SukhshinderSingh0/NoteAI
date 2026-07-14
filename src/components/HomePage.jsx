/**
 * HomePage.jsx — NoteAI conversion-focused landing page.
 *
 * Adapted for both Dark Mode (Emerald/Gold) and Light Mode (Airy Emerald).
 */

import { useState } from 'react';
import {
  Box, Typography, Button, Grid, Chip, alpha, useTheme
} from '@mui/material';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ArticleIcon from '@mui/icons-material/Article';
import StyleIcon from '@mui/icons-material/Style';
import QuizIcon from '@mui/icons-material/Quiz';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SparklesIcon from '@mui/icons-material/AutoFixHigh';

import { useAppContext } from '../context/AppContext';
import { useAuthContext } from '../context/AuthContext';

// ── Design tokens & Theme Logic ───────────────────────────────────────────
const GOLD = '#D4AF37';
const GOLD_SOFT = '#FDF2B5';
const GOLD_DIM = 'rgba(212,175,55,0.65)';
const GOLD_FAINT = 'rgba(212,175,55,0.22)';
const CTA = '#20BC7F';

function getThemeColors(isDark) {
  return {
    pageBg: isDark
      ? `
        radial-gradient(ellipse at 8%  25%, rgba(5,150,105,0.45) 0%, transparent 52%),
        radial-gradient(ellipse at 88% 12%, rgba(4,120,87,0.30)  0%, transparent 48%),
        radial-gradient(ellipse at 55% 88%, rgba(16,185,129,0.22) 0%, transparent 52%),
        radial-gradient(ellipse at 95% 68%, rgba(6,95,70,0.28)   0%, transparent 42%),
        linear-gradient(160deg, #071A10 0%, #0D2518 50%, #071A10 100%)
      `
      : `
        radial-gradient(ellipse at 8%  25%, rgba(5,150,105,0.12) 0%, transparent 52%),
        radial-gradient(ellipse at 88% 12%, rgba(4,120,87,0.08)  0%, transparent 48%),
        radial-gradient(ellipse at 55% 88%, rgba(16,185,129,0.05) 0%, transparent 52%),
        radial-gradient(ellipse at 95% 68%, rgba(217,119,6,0.08)   0%, transparent 42%),
        linear-gradient(160deg, #F0FDF4 0%, #ECFDF5 50%, #F0FDF4 100%)
      `,
    glass: {
      background: isDark ? 'rgba(16,60,40,0.45)' : 'rgba(255,255,255,0.65)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: isDark ? `1px solid ${GOLD_FAINT}` : '1px solid rgba(5,150,105,0.15)',
      boxShadow: isDark ? 'none' : '0 8px 32px rgba(5,150,105,0.06)',
    },
    heading: isDark ? GOLD : '#064E3B',
    body: isDark ? GOLD_DIM : '#065F46',
    text: isDark ? GOLD_SOFT : '#064E3B',
    accent: isDark ? GOLD : '#D97706',
    accentBg: isDark ? alpha(GOLD, 0.1) : alpha('#D97706', 0.1),
    accentBorder: isDark ? GOLD_FAINT : alpha('#D97706', 0.3),
    iconBox: isDark
      ? 'linear-gradient(135deg, rgba(32,188,127,0.22), rgba(212,175,55,0.14))'
      : 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(217,119,6,0.1))',
    cardHover: isDark
      ? `0 20px 52px rgba(212,175,55,0.14), 0 0 0 1px ${alpha(GOLD, 0.35)}`
      : `0 20px 52px rgba(5,150,105,0.12), 0 0 0 1px ${alpha('#059669', 0.35)}`,
    orbColor: isDark ? '212,175,55' : '5,150,105',
    tabActive: isDark ? GOLD : '#059669',
    tabHover: isDark ? alpha(GOLD, 0.05) : alpha('#059669', 0.08),
  };
}

// ── Static data ───────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: ArticleIcon,
    badge: 'AI NOTES',
    title: 'Intelligent Summaries',
    desc: 'Upload any PDF and receive beautifully structured markdown notes with headings, bullet points, key term highlights, and concise takeaways — generated in seconds.',
  },
  {
    icon: StyleIcon,
    badge: 'FLASHCARDS',
    title: 'Interactive Flip Cards',
    desc: "Gemini AI crafts Q&A flashcard decks from your document's core concepts. Flip through them with smooth 3D animations to reinforce memory efficiently.",
  },
  {
    icon: QuizIcon,
    badge: 'QUIZZES',
    title: 'Instant Self-Testing',
    desc: 'Auto-generated multiple-choice questions with carefully crafted distractors test real comprehension. Get immediate feedback and track your performance.',
  },
];

const STATS = [
  { value: '10K+', label: 'PDFs Processed' },
  { value: '12',   label: 'Cards per Study' },
  { value: '8',    label: 'Quiz Questions' },
  { value: '<30s', label: 'Generation Time' },
];

const QUIZ_OPTIONS = [
  'Stochastic Gradient Descent',
  'Adam Optimizer',
  'Perceptron Algorithm',
  'K-Means Clustering',
];
const CORRECT_OPT = 'Adam Optimizer';

// ── Live preview sub-components ───────────────────────────────────────────
function NotesPreview() {
  const isDark = useTheme().palette.mode === 'dark';
  const tc = getThemeColors(isDark);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
        <BoltIcon sx={{ color: tc.accent, fontSize: 16 }} />
        <Typography sx={{ color: tc.accent, fontWeight: 800, fontSize: 15 }}>
          Machine Learning Fundamentals
        </Typography>
      </Box>
      <Typography sx={{ color: tc.text, fontSize: 12.5, lineHeight: 1.9, mb: 1.5 }}>
        <Box component="span" sx={{ color: tc.heading, fontWeight: 700 }}>Artificial neural networks</Box>
        {' '}are computing systems inspired by biological neural networks. They learn
        by adjusting connection weights across layers during training.
      </Typography>

      {/* Blockquote */}
      <Box sx={{ bgcolor: isDark ? alpha(GOLD, 0.07) : alpha('#059669', 0.08), borderLeft: `3px solid ${tc.accent}`, pl: 1.5, py: 1, borderRadius: '0 8px 8px 0', mb: 1.5 }}>
        <Typography sx={{ color: tc.body, fontSize: 11.5, fontStyle: 'italic' }}>
          💡 Training cycles alternate forward propagation with backpropagation
        </Typography>
      </Box>

      {/* Bullet list */}
      {[
        'Input Layer → Hidden Layers → Output Layer',
        'Activation functions introduce non-linearity',
        'Gradient descent optimises weights iteratively',
      ].map((pt, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: CTA, mt: 0.85, flexShrink: 0 }} />
          <Typography sx={{ color: tc.text, fontSize: 11.5 }}>{pt}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function FlashcardPreview({ flipped, onFlip }) {
  const isDark = useTheme().palette.mode === 'dark';
  const tc = getThemeColors(isDark);

  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* 3-D flip card */}
      <Box onClick={onFlip} sx={{ width: '100%', height: 155, cursor: 'pointer', perspective: '1000px', mb: 1.5 }}>
        <Box sx={{
          width: '100%', height: '100%', position: 'relative',
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s cubic-bezier(0.4,0,0.2,1)',
        }}>
          {/* Front */}
          <Box sx={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            bgcolor: isDark ? alpha(GOLD, 0.07) : '#fff', border: tc.glass.border, borderRadius: 3,
            boxShadow: isDark ? 'none' : '0 4px 12px rgba(5,150,105,0.05)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2,
          }}>
            <Chip label="QUESTION" size="small" sx={{ mb: 1.5, bgcolor: tc.accentBg, color: tc.accent, fontSize: 9, fontWeight: 800, border: `1px solid ${tc.accentBorder}` }} />
            <Typography sx={{ color: tc.text, fontWeight: 600, fontSize: 13, lineHeight: 1.5 }}>
              What is the vanishing gradient problem in deep neural networks?
            </Typography>
          </Box>
          {/* Back */}
          <Box sx={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            bgcolor: isDark ? 'rgba(32,188,127,0.09)' : '#F0FDF4', border: '1px solid rgba(32,188,127,0.28)', borderRadius: 3,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2,
          }}>
            <Chip label="ANSWER" size="small" sx={{ mb: 1.5, bgcolor: 'rgba(32,188,127,0.15)', color: CTA, fontSize: 9, fontWeight: 800, border: '1px solid rgba(32,188,127,0.3)' }} />
            <Typography sx={{ color: tc.text, fontSize: 12, lineHeight: 1.65 }}>
              When gradients become extremely small during backpropagation, preventing earlier
              layers from learning effectively — common in very deep networks.
            </Typography>
          </Box>
        </Box>
      </Box>
      <Typography sx={{ color: alpha(tc.accent, 0.6), fontSize: 11 }}>
        {flipped ? '← Click to see question' : 'Click card to reveal answer →'}
      </Typography>
    </Box>
  );
}

function QuizPreview({ selected, onSelect }) {
  const isDark = useTheme().palette.mode === 'dark';
  const tc = getThemeColors(isDark);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
        <Chip label="Q1" size="small" sx={{ bgcolor: tc.accentBg, color: tc.accent, fontSize: 10, fontWeight: 800, flexShrink: 0 }} />
        <Typography sx={{ color: tc.text, fontWeight: 600, fontSize: 12.5, lineHeight: 1.6 }}>
          Which optimizer is best known for using adaptive learning rates per parameter?
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
        {QUIZ_OPTIONS.map((opt, i) => {
          const letter = String.fromCharCode(65 + i);
          const picked = selected === opt;
          const correct = opt === CORRECT_OPT;
          const answered = selected !== null;

          let bg = isDark ? alpha('#fff', 0.04) : '#fff';
          let border = isDark ? alpha(GOLD, 0.15) : alpha('#059669', 0.15);
          let txt = tc.text;
          let ltrBg = tc.accentBg;

          if (picked && correct) { bg = alpha(CTA, 0.18); border = CTA; txt = isDark ? CTA : '#059669'; ltrBg = alpha(CTA, 0.25); }
          else if (picked) { bg = 'rgba(239,68,68,0.12)'; border = '#ef4444'; txt = '#ef4444'; ltrBg = 'rgba(239,68,68,0.2)'; }
          else if (answered && correct) { bg = alpha(CTA, 0.07); border = alpha(CTA, 0.35); txt = CTA; }

          return (
            <Box
              key={opt}
              onClick={() => !answered && onSelect(opt)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.25,
                px: 1.5, py: 0.9, borderRadius: 2,
                bgcolor: bg, border: `1px solid ${border}`,
                cursor: answered ? 'default' : 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': answered ? {} : { bgcolor: tc.tabHover, borderColor: tc.accent },
              }}
            >
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: ltrBg, fontSize: 9, fontWeight: 800, color: txt }}>
                {letter}
              </Box>
              <Typography sx={{ color: txt, fontSize: 11.5, flex: 1 }}>{opt}</Typography>
              {answered && correct && <CheckCircleIcon sx={{ fontSize: 14, color: CTA }} />}
            </Box>
          );
        })}
      </Box>

      {selected && (
        <Typography sx={{ color: selected === CORRECT_OPT ? CTA : '#ef4444', fontSize: 11, mt: 1.25, textAlign: 'center', fontWeight: 700 }}>
          {selected === CORRECT_OPT
            ? '✓ Correct! Adam uses adaptive per-parameter learning rates.'
            : '✗ Incorrect — the answer is Adam Optimizer.'}
        </Typography>
      )}
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function HomePage({ onOpenAuth }) {
  const { setActiveView } = useAppContext();
  const { isAuthenticated } = useAuthContext();
  const isDark = useTheme().palette.mode === 'dark';
  const tc = getThemeColors(isDark);

  const [previewTab, setPreviewTab] = useState('notes');
  const [cardFlipped, setCardFlipped] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);

  const handleCTA = () => isAuthenticated ? setActiveView('dashboard') : onOpenAuth();

  const switchPreviewTab = (id) => {
    setPreviewTab(id);
    if (id !== 'flashcards') setCardFlipped(false);
    if (id !== 'quiz') setQuizAnswer(null);
  };

  const previewTabs = [
    { id: 'notes', label: 'Notes', Icon: ArticleIcon },
    { id: 'flashcards', label: 'Flashcards', Icon: StyleIcon },
    { id: 'quiz', label: 'Quiz', Icon: QuizIcon },
  ];

  return (
    <Box sx={{ background: tc.pageBg, minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>

      {/* ── Decorative orbs ───────────────────────────────────── */}
      {[
        { top: '10%', left: '3%', size: 360, op: 0.10 },
        { top: '-8%', right: '8%', size: 440, op: 0.08 },
        { bottom: '15%', left: '48%', size: 380, op: 0.07 },
      ].map((o, i) => (
        <Box key={i} sx={{
          position: 'absolute', width: o.size, height: o.size, borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${tc.orbColor},${o.op}) 0%, transparent 70%)`,
          top: o.top, left: o.left, right: o.right, bottom: o.bottom,
          pointerEvents: 'none',
        }} />
      ))}

      {/* ════════════════════════════════════════════════════════════
          HERO SECTION
         ════════════════════════════════════════════════════════════ */}
      <Box sx={{
        minHeight: 'calc(100vh - 96px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        px: { xs: 3, sm: 6, md: 12 },
        py: { xs: 8, md: 10 },
        position: 'relative',
      }}>
        {/* Gemini badge */}
        <Chip
          icon={<AutoAwesomeIcon sx={{ color: `${tc.accent} !important`, fontSize: '14px !important' }} />}
          label="Powered by Gemini AI"
          sx={{
            mb: 4, bgcolor: tc.accentBg, color: tc.accent,
            border: `1px solid ${tc.accentBorder}`, fontWeight: 700, fontSize: 12,
            backdropFilter: 'blur(8px)',
          }}
        />

        {/* H1 headline */}
        <Typography
          component="h1"
          sx={{
            fontSize: { xs: '2.1rem', sm: '3rem', md: '3.9rem', lg: '4.5rem' },
            fontWeight: 900, lineHeight: 1.12,
            color: tc.heading,
            mb: 3, maxWidth: 860,
            letterSpacing: '-1px',
            textShadow: isDark ? '0 0 80px rgba(212,175,55,0.28)' : 'none',
          }}
        >
          Transform PDFs into Masterclass Study Material{' '}
          <Box component="span" sx={{ color: isDark ? GOLD_SOFT : '#059669', fontStyle: 'italic' }}>Instantly.</Box>
        </Typography>

        {/* Subtitle */}
        <Typography sx={{
          fontSize: { xs: 15, sm: 17, md: 18 },
          color: tc.body, lineHeight: 1.75, maxWidth: 620, mb: 5,
        }}>
          NoteAI harnesses the Gemini API to transform dense, complex documents into
          beautifully structured study notes, dynamic flip-card decks, and challenging
          interactive quizzes — all in seconds.
        </Typography>

        {/* ── Primary CTA ── */}
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={handleCTA}
          sx={{
            bgcolor: CTA, color: isDark ? GOLD : '#fff',
            fontWeight: 800, fontSize: { xs: 14, sm: 16 },
            px: 5, py: 1.8, borderRadius: 3,
            border: `1px solid ${isDark ? alpha(GOLD, 0.3) : 'transparent'}`,
            letterSpacing: 0.3,
            '&:hover': {
              bgcolor: '#17A36D',
              transform: 'translateY(-2px)',
              boxShadow: '0 14px 36px rgba(32,188,127,0.45)',
            },
            transition: 'all 0.25s ease',
            // Gentle pulse
            '@keyframes heroPulse': {
              '0%,100%': { boxShadow: '0 4px 24px rgba(32,188,127,0.35)' },
              '50%': { boxShadow: '0 4px 40px rgba(32,188,127,0.65)' },
            },
            animation: 'heroPulse 2.6s ease-in-out infinite',
          }}
        >
          Start Studying for Free
        </Button>

        {/* Stats row */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0, mt: 6, justifyContent: 'center' }}>
          {STATS.map((s, i) => (
            <Box key={s.label} sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ textAlign: 'center', px: { xs: 2, sm: 3 } }}>
                <Typography sx={{ color: tc.heading, fontSize: { xs: 20, sm: 24 }, fontWeight: 900, lineHeight: 1 }}>
                  {s.value}
                </Typography>
                <Typography sx={{ color: tc.body, fontSize: { xs: 10, sm: 11 }, mt: 0.3, whiteSpace: 'nowrap' }}>
                  {s.label}
                </Typography>
              </Box>
              {i < STATS.length - 1 && (
                <Box sx={{ width: 1, height: 36, bgcolor: tc.accentBorder, display: { xs: 'none', sm: 'block' } }} />
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ════════════════════════════════════════════════════════════
          FEATURES SECTION
         ════════════════════════════════════════════════════════════ */}
      <Box sx={{ px: { xs: 3, sm: 5, md: 10 }, py: { xs: 8, md: 12 } }}>
        {/* Section header */}
        <Box sx={{ textAlign: 'center', mb: 7 }}>
          <Chip label="THE TOOLS" sx={{ mb: 2, bgcolor: tc.accentBg, color: tc.accent, border: `1px solid ${tc.accentBorder}`, fontWeight: 700, fontSize: 11, letterSpacing: '0.1em' }} />
          <Typography component="h2" sx={{ color: tc.heading, fontWeight: 800, fontSize: { xs: '1.8rem', sm: '2.5rem' }, letterSpacing: '-0.5px', mb: 1 }}>
            Three Pillars of Mastery
          </Typography>
          <Typography sx={{ color: tc.body, fontSize: 15.5, maxWidth: 480, mx: 'auto', lineHeight: 1.65 }}>
            Every tool you need to go from raw PDF to total comprehension.
          </Typography>
        </Box>

        {/* Cards grid */}
        <Grid container spacing={3} justifyContent="center">
          {FEATURES.map(({ icon: Icon, badge, title, desc }) => (
            <Grid item xs={12} sm={6} md={4} key={title}>
              <Box sx={{
                ...tc.glass, borderRadius: 4, p: 3.5, height: '100%',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: tc.cardHover,
                },
              }}>
                {/* Icon */}
                <Box sx={{
                  width: 58, height: 58, borderRadius: 3, mb: 2.5,
                  background: tc.iconBox,
                  border: `1px solid ${tc.accentBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon sx={{ color: tc.accent, fontSize: 28 }} />
                </Box>
                <Chip label={badge} size="small" sx={{ mb: 1.5, bgcolor: tc.accentBg, color: tc.accent, border: `1px solid ${tc.accentBorder}`, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em' }} />
                <Typography sx={{ color: tc.heading, fontWeight: 800, fontSize: 18.5, mb: 1.25, lineHeight: 1.3 }}>
                  {title}
                </Typography>
                <Typography sx={{ color: tc.body, fontSize: 14, lineHeight: 1.8 }}>
                  {desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ════════════════════════════════════════════════════════════
          LIVE PREVIEW WIDGET
         ════════════════════════════════════════════════════════════ */}
      <Box sx={{ px: { xs: 3, sm: 5, md: 10 }, py: { xs: 8, md: 12 } }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Chip label="LIVE DEMO" sx={{ mb: 2, bgcolor: 'rgba(32,188,127,0.1)', color: CTA, border: '1px solid rgba(32,188,127,0.25)', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em' }} />
          <Typography component="h2" sx={{ color: tc.heading, fontWeight: 800, fontSize: { xs: '1.8rem', sm: '2.5rem' }, letterSpacing: '-0.5px', mb: 1 }}>
            See NoteAI in Action
          </Typography>
          <Typography sx={{ color: tc.body, fontSize: 15.5, maxWidth: 480, mx: 'auto', lineHeight: 1.65 }}>
            A real interactive preview — no sign-up required.
          </Typography>
        </Box>

        {/* Widget container */}
        <Box sx={{ ...tc.glass, borderRadius: 5, p: { xs: 2, sm: 3 }, maxWidth: 960, mx: 'auto' }}>
          <Grid container spacing={2.5} alignItems="stretch">

            {/* LEFT — PDF mock */}
            <Grid item xs={12} md={4}>
              <Box sx={{ ...tc.glass, borderRadius: 3, p: 2.5, height: '100%', minHeight: 380 }}>
                {/* Window dots */}
                <Box sx={{ display: 'flex', gap: 0.6, mb: 2 }}>
                  {['#ef4444', '#f59e0b', '#22c55e'].map((c) => (
                    <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c, opacity: 0.65 }} />
                  ))}
                </Box>

                {/* File name */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 1.5, borderBottom: `1px solid ${tc.accentBorder}` }}>
                  <UploadFileIcon sx={{ color: tc.accent, fontSize: 17, flexShrink: 0 }} />
                  <Typography sx={{ color: tc.heading, fontSize: 11.5, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ML_Fundamentals.pdf
                  </Typography>
                </Box>

                {/* Fake text lines */}
                {[1, 0.75, 0.9, 0.55, 1, 0.82, 0.48, 0.9, 0.7, 1, 0.63, 0.87, 0.44, 0.95, 0.58].map((w, i) => (
                  <Box key={i} sx={{ height: 5, width: `${w * 100}%`, bgcolor: isDark ? alpha('#fff', i % 4 === 0 ? 0.11 : 0.055) : alpha('#000', i % 4 === 0 ? 0.08 : 0.04), borderRadius: 1, mb: 0.9 }} />
                ))}

                {/* Footer */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  <Chip label="42 pages" size="small" sx={{ bgcolor: tc.accentBg, color: tc.accent, border: `1px solid ${tc.accentBorder}`, fontSize: 9 }} />
                  <Chip label="✓ Ready" size="small" sx={{ bgcolor: 'rgba(32,188,127,0.1)', color: CTA, fontSize: 9 }} />
                </Box>
              </Box>
            </Grid>

            {/* RIGHT — Workspace preview */}
            <Grid item xs={12} md={8}>
              <Box sx={{ ...tc.glass, borderRadius: 3, overflow: 'hidden', height: '100%', minHeight: 380, display: 'flex', flexDirection: 'column' }}>

                {/* Tab bar */}
                <Box sx={{ display: 'flex', borderBottom: `1px solid ${tc.accentBorder}`, px: 1, pt: 0.5, flexShrink: 0 }}>
                  {previewTabs.map(({ id, label, Icon }) => (
                    <Box
                      key={id}
                      onClick={() => switchPreviewTab(id)}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 0.75,
                        px: 1.75, py: 1.2, cursor: 'pointer',
                        borderBottom: previewTab === id ? `2px solid ${tc.tabActive}` : '2px solid transparent',
                        mb: '-1px',
                        color: previewTab === id ? tc.tabActive : tc.body,
                        fontSize: 12.5, fontWeight: previewTab === id ? 700 : 400,
                        transition: 'all 0.15s ease',
                        borderRadius: '6px 6px 0 0',
                        '&:hover': { color: tc.tabActive, bgcolor: tc.tabHover },
                      }}
                    >
                      <Icon sx={{ fontSize: 14 }} />
                      {label}
                    </Box>
                  ))}
                </Box>

                {/* Content */}
                <Box sx={{
                  p: 2.5, flexGrow: 1, overflowY: 'auto',
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: isDark ? alpha(GOLD, 0.2) : alpha('#059669', 0.2), borderRadius: 2 },
                }}>
                  {previewTab === 'notes' && <NotesPreview />}
                  {previewTab === 'flashcards' && <FlashcardPreview flipped={cardFlipped} onFlip={() => setCardFlipped(f => !f)} />}
                  {previewTab === 'quiz' && <QuizPreview selected={quizAnswer} onSelect={setQuizAnswer} />}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* ════════════════════════════════════════════════════════════
          CTA BANNER
         ════════════════════════════════════════════════════════════ */}
      <Box sx={{ px: { xs: 3, sm: 5, md: 10 }, pb: { xs: 10, md: 14 } }}>
        <Box sx={{
          ...tc.glass, borderRadius: 5,
          textAlign: 'center', py: { xs: 7, md: 10 }, px: { xs: 3, sm: 6 },
          background: isDark
            ? 'linear-gradient(135deg, rgba(32,188,127,0.14) 0%, rgba(16,60,40,0.55) 50%, rgba(212,175,55,0.07) 100%)'
            : 'linear-gradient(135deg, rgba(32,188,127,0.1) 0%, rgba(255,255,255,0.7) 50%, rgba(5,150,105,0.05) 100%)',
          border: isDark ? '1px solid rgba(32,188,127,0.22)' : '1px solid rgba(5,150,105,0.2)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top glow */}
          <Box sx={{
            position: 'absolute', top: '-50%', left: '50%', transform: 'translateX(-50%)',
            width: 500, height: 250,
            background: 'radial-gradient(ellipse, rgba(32,188,127,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <SparklesIcon sx={{ color: tc.accent, fontSize: 40, mb: 2 }} />
          <Typography component="h2" sx={{ color: tc.heading, fontWeight: 900, fontSize: { xs: '1.9rem', sm: '2.6rem' }, mb: 1.5, letterSpacing: '-0.5px' }}>
            Ready to Study Smarter?
          </Typography>
          <Typography sx={{ color: tc.body, fontSize: { xs: 15, sm: 16 }, mb: 4.5, maxWidth: 500, mx: 'auto', lineHeight: 1.75 }}>
            Join thousands of students already transforming how they study. Free to start — no credit card needed.
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={handleCTA}
            sx={{
              bgcolor: CTA, color: isDark ? GOLD : '#fff', fontWeight: 800, fontSize: { xs: 14, sm: 15 },
              px: 5, py: 1.7, borderRadius: 3,
              border: `1px solid ${isDark ? alpha(GOLD, 0.3) : 'transparent'}`,
              '&:hover': { bgcolor: '#17A36D', transform: 'translateY(-2px)', boxShadow: '0 14px 36px rgba(32,188,127,0.45)' },
              transition: 'all 0.25s ease',
            }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Start Studying for Free'}
          </Button>
        </Box>
      </Box>

      {/* ════════════════════════════════════════════════════════════
          FOOTER
         ════════════════════════════════════════════════════════════ */}
      <Box sx={{ borderTop: `1px solid ${tc.accentBorder}`, py: 3.5, px: { xs: 3, sm: 5 }, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mb: 1 }}>
          <AutoStoriesIcon sx={{ color: alpha(tc.accent, 0.5), fontSize: 16 }} />
          <Typography sx={{ color: alpha(tc.accent, 0.6), fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}>
            NoteAI
          </Typography>
        </Box>
        <Typography sx={{ color: alpha(tc.accent, 0.4), fontSize: 12 }}>
          © 2026 NoteAI. All rights reserved.
          {['Terms', 'Privacy', 'Contact'].map((link, i) => (
            <Box key={link} component="span">
              <Box component="span" sx={{ mx: 1, color: alpha(tc.accent, 0.22) }}>·</Box>
              <Box
                component="span"
                sx={{ color: alpha(tc.accent, 0.7), cursor: 'pointer', '&:hover': { color: tc.accent }, transition: 'color 0.15s' }}
              >
                {link}
              </Box>
            </Box>
          ))}
        </Typography>
      </Box>
    </Box>
  );
}
