/**
 * PDFUploader.jsx
 * Drag-and-drop PDF upload area with native HTML5 drag events,
 * MUI LinearProgress, and pdfjs-dist text extraction.
 */

import { useState, useRef, useCallback }  from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  LinearProgress, Alert, alpha, useTheme,
} from '@mui/material';
import UploadFileIcon   from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon  from '@mui/icons-material/CheckCircle';
import { extractTextFromPDF }  from '../utils/pdfExtractor';
import { generateNotes }       from '../services/gemini';
import { useAppContext }        from '../context/AppContext';

const ACCEPTED_MIME = 'application/pdf';
const MAX_BYTES     = 20 * 1024 * 1024; // 20 MB

export default function PDFUploader() {
  const theme = useTheme();
  const {
    setFileName, setExtractedText,
    setNotes, setActiveView,
    setLoadingKey, setErrorKey,
    loading, error,
  } = useAppContext();

  const [dragOver,  setDragOver]  = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [stage,     setStage]     = useState(''); // 'extracting' | 'generating' | 'done'
  const [localFile, setLocalFile] = useState(null);
  const inputRef = useRef(null);

  // ── File validation ───────────────────────────────────────────────────────
  function validateFile(file) {
    if (!file) return 'No file selected.';
    if (file.type !== ACCEPTED_MIME) return 'Only PDF files are accepted.';
    if (file.size > MAX_BYTES) return `File is too large (max 20 MB). Got ${(file.size / 1e6).toFixed(1)} MB.`;
    return null;
  }

  // ── Core processing pipeline ──────────────────────────────────────────────
  const processFile = useCallback(async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorKey('pdf', validationError);
      return;
    }

    setErrorKey('pdf', '');
    setLocalFile(file);
    setFileName(file.name);
    setLoadingKey('pdf', true);

    try {
      // Step 1 — Extract text
      setStage('extracting');
      setProgress(0);
      const text = await extractTextFromPDF(file, (p) => setProgress(p));
      setExtractedText(text);

      // Step 2 — Generate notes via Gemini
      setStage('generating');
      setProgress(0);

      // Simulate progress while waiting for Gemini (indeterminate)
      const ticker = setInterval(() => {
        setProgress((p) => Math.min(p + 2, 90));
      }, 300);

      const notes = await generateNotes(text);
      clearInterval(ticker);

      setProgress(100);
      setNotes(notes);
      setStage('done');

      // Navigate to notes view after a short delay
      setTimeout(() => setActiveView('notes'), 600);
    } catch (err) {
      setErrorKey('pdf', err.message || 'An unexpected error occurred.');
      setStage('');
    } finally {
      setLoadingKey('pdf', false);
    }
  }, [setFileName, setExtractedText, setNotes, setActiveView, setLoadingKey, setErrorKey]);

  // ── Drag events ───────────────────────────────────────────────────────────
  const onDragOver  = (e) => { e.preventDefault(); setDragOver(true);  };
  const onDragLeave = ()  => setDragOver(false);
  const onDrop      = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // ── File input ────────────────────────────────────────────────────────────
  const onFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const isLoading  = loading.pdf;
  const isDone     = stage === 'done';
  const stageLabel = stage === 'extracting' ? 'Extracting text…' : 'Generating notes with AI…';

  return (
    <Box className="fade-in-up" sx={{ maxWidth: 640, mx: 'auto', pt: 2 }}>
      {/* ── Hero heading ─────────────────────────────────────────── */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom
          sx={{
            background: 'linear-gradient(135deg, #059669, #D97706)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Upload Your PDF
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Drop any study material, lecture notes, or textbook chapter. AI does the rest.
        </Typography>
      </Box>

      {/* ── Drop zone card ───────────────────────────────────────── */}
      <Card
        className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !isLoading && inputRef.current?.click()}
        sx={{
          cursor: isLoading ? 'default' : 'pointer',
          transition: 'all 0.25s ease',
          boxShadow: dragOver
            ? `0 0 0 3px ${theme.palette.primary.main}, 0 8px 32px ${alpha(theme.palette.primary.main, 0.2)}`
            : undefined,
        }}
      >
        <CardContent sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
          {isDone ? (
            // ── Success state
            <Box>
              <CheckCircleIcon sx={{ fontSize: 56, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={700} color="success.main">
                Notes Ready!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Redirecting to Study Notes…
              </Typography>
            </Box>
          ) : isLoading ? (
            // ── Loading state
            <Box>
              <PictureAsPdfIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                {stageLabel}
              </Typography>
              {localFile && (
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  {localFile.name}
                </Typography>
              )}
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 1, mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
          ) : (
            // ── Idle / drop state
            <Box>
              <Box
                sx={{
                  width: 80, height: 80, borderRadius: '50%', mx: 'auto', mb: 2.5,
                  background: 'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(217,119,6,0.08))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.2s',
                  '.drop-zone:hover &': { transform: 'scale(1.05)' },
                }}
              >
                <UploadFileIcon sx={{ fontSize: 36, color: 'primary.main' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} gutterBottom color="text.primary">
                {dragOver ? 'Release to Upload' : 'Drag & Drop your PDF here'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                or click to browse files (max 20 MB)
              </Typography>
              <Button
                variant="contained"
                component="span"
                startIcon={<UploadFileIcon />}
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              >
                Choose PDF File
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Accepts: <strong>.pdf</strong>
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        style={{ display: 'none' }}
        onChange={onFileInput}
        aria-label="Choose PDF file"
      />

      {/* Error alert */}
      {error.pdf && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 3 }} onClose={() => setErrorKey('pdf', '')}>
          {error.pdf}
        </Alert>
      )}

      {/* ── Feature hints ────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[
          { icon: '📝', label: 'Study Notes' },
          { icon: '🃏', label: 'Flashcards' },
          { icon: '📋', label: 'Quizzes' },
        ].map((f) => (
          <Box
            key={f.label}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 2, py: 1, borderRadius: 3,
              background: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <Typography fontSize={18}>{f.icon}</Typography>
            <Typography variant="caption" fontWeight={600} color="text.secondary">
              {f.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
