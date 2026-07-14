/**
 * NotesViewer.jsx
 * Renders AI-generated study notes as beautiful Markdown
 * with a sticky action toolbar (Copy, Export TXT, Export PDF, Regenerate).
 */

import { useState, useCallback }   from 'react';
import {
  Box, Paper, Typography, Button, Tooltip, Snackbar, Alert,
  Skeleton, Divider, Chip, alpha, useTheme, IconButton,
} from '@mui/material';
import ContentCopyIcon    from '@mui/icons-material/ContentCopy';
import FileDownloadIcon   from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon   from '@mui/icons-material/PictureAsPdf';
import RefreshIcon        from '@mui/icons-material/Refresh';
import ArticleIcon        from '@mui/icons-material/Article';
import ReactMarkdown      from 'react-markdown';
import remarkGfm          from 'remark-gfm';
import { generateNotes }  from '../services/gemini';
import { useAppContext }  from '../context/AppContext';
import { copyToClipboard, exportAsTxt, exportAsPdf } from '../utils/exportUtils';
import EmptyState         from './EmptyState';

// ---------------------------------------------------------------------------
// Markdown → MUI Typography component map
// ---------------------------------------------------------------------------
function MarkdownComponents(theme) {
  return {
    h1: ({ children }) => (
      <Typography variant="h4" fontWeight={800} gutterBottom
        sx={{ mt: 3, pb: 1, borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
        {children}
      </Typography>
    ),
    h2: ({ children }) => (
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 3, mb: 1.5, color: 'primary.main' }}>
        {children}
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2, mb: 1 }}>
        {children}
      </Typography>
    ),
    p: ({ children }) => (
      <Typography variant="body1" paragraph sx={{ lineHeight: 1.85, color: 'text.primary' }}>
        {children}
      </Typography>
    ),
    li: ({ children }) => (
      <Box component="li" sx={{ mb: 0.5 }}>
        <Typography variant="body1" component="span" sx={{ lineHeight: 1.8 }}>
          {children}
        </Typography>
      </Box>
    ),
    ul: ({ children }) => (
      <Box component="ul" sx={{ pl: 3, mb: 2 }}>{children}</Box>
    ),
    ol: ({ children }) => (
      <Box component="ol" sx={{ pl: 3, mb: 2 }}>{children}</Box>
    ),
    blockquote: ({ children }) => (
      <Box
        sx={{
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          borderRadius: '0 8px 8px 0',
          px: 2.5, py: 1.5, my: 2,
        }}
      >
        {children}
      </Box>
    ),
    code: ({ inline, children }) =>
      inline ? (
        <Box
          component="code"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'secondary.main',
            px: 0.75, py: 0.25, borderRadius: 1,
            fontSize: '0.85em', fontFamily: 'monospace',
          }}
        >
          {children}
        </Box>
      ) : (
        <Box
          component="pre"
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? '#1A1A2E' : '#F1F0FF',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 2, p: 2.5, my: 2, overflow: 'auto',
            '& code': { fontFamily: 'monospace', fontSize: '0.88em' },
          }}
        >
          <code>{children}</code>
        </Box>
      ),
    strong: ({ children }) => (
      <Box component="strong" sx={{ fontWeight: 700, color: 'primary.main' }}>
        {children}
      </Box>
    ),
    hr: () => <Divider sx={{ my: 3 }} />,
  };
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function NotesSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      {[...Array(6)].map((_, i) => (
        <Box key={i} sx={{ mb: 3 }}>
          <Skeleton variant="text" width={i % 3 === 0 ? '45%' : '100%'} height={i % 3 === 0 ? 36 : 22} sx={{ mb: 1 }} />
          {i % 3 !== 0 && <Skeleton variant="text" width="90%" height={22} sx={{ mb: 0.5 }} />}
          {i % 3 !== 0 && <Skeleton variant="text" width="75%" height={22} />}
        </Box>
      ))}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function NotesViewer() {
  const theme = useTheme();
  const {
    notes, setNotes, extractedText, fileName,
    loading, setLoadingKey, error, setErrorKey,
  } = useAppContext();

  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  const showSnack = (message, severity = 'success') =>
    setSnack({ open: true, message, severity });

  // ── Actions ────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await copyToClipboard(notes);
      showSnack('Notes copied to clipboard!');
    } catch {
      showSnack('Failed to copy.', 'error');
    }
  };

  const handleExportTxt = () => {
    exportAsTxt(notes, `${fileName.replace('.pdf', '')}-notes.txt`);
    showSnack('Downloaded as .txt');
  };

  const handleExportPdf = () => {
    exportAsPdf(notes, `${fileName.replace('.pdf', '')}-notes.pdf`);
    showSnack('Downloaded as .pdf');
  };

  const handleRegenerate = useCallback(async () => {
    if (!extractedText) return;
    setErrorKey('notes', '');
    setLoadingKey('notes', true);
    try {
      const fresh = await generateNotes(extractedText);
      setNotes(fresh);
      showSnack('Notes regenerated!');
    } catch (err) {
      setErrorKey('notes', err.message);
    } finally {
      setLoadingKey('notes', false);
    }
  }, [extractedText, setNotes, setLoadingKey, setErrorKey]);

  // ── Empty / no-content state ───────────────────────────────────────────
  if (!extractedText) {
    return (
      <EmptyState
        icon={<ArticleIcon />}
        title="No Document Uploaded"
        description="Upload a PDF on the Upload page to generate AI study notes."
      />
    );
  }

  return (
    <Box className="fade-in-up">
      {/* ── Sticky toolbar ────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap',
          p: 1.5, mb: 3, borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: alpha(theme.palette.primary.main, 0.04),
          position: 'sticky', top: 100, zIndex: 10,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Chip
          label={fileName}
          size="small"
          variant="outlined"
          color="primary"
          sx={{ fontSize: 11, mr: 'auto' }}
        />

        <Tooltip title="Copy to clipboard">
          <Button
            size="small" startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            disabled={!notes || loading.notes}
            variant="outlined"
          >
            Copy
          </Button>
        </Tooltip>

        <Tooltip title="Download as .txt">
          <Button
            size="small" startIcon={<FileDownloadIcon />}
            onClick={handleExportTxt}
            disabled={!notes || loading.notes}
            variant="outlined"
          >
            TXT
          </Button>
        </Tooltip>

        <Tooltip title="Download as PDF">
          <Button
            size="small" startIcon={<PictureAsPdfIcon />}
            onClick={handleExportPdf}
            disabled={!notes || loading.notes}
            variant="outlined"
            color="secondary"
          >
            PDF
          </Button>
        </Tooltip>

        <Tooltip title="Regenerate notes">
          <IconButton
            size="small"
            onClick={handleRegenerate}
            disabled={loading.notes}
            color="primary"
            sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1.5 }}
          >
            <RefreshIcon fontSize="small"
              sx={{
                animation: loading.notes ? 'spin 1s linear infinite' : 'none',
                '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
              }}
            />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* ── Error alert ──────────────────────────────────────────── */}
      {error.notes && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} onClose={() => setErrorKey('notes', '')}>
          {error.notes}
        </Alert>
      )}

      {/* ── Notes content ────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 }, borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          minHeight: 400,
        }}
      >
        {loading.notes ? (
          <NotesSkeleton />
        ) : notes ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents(theme)}
          >
            {notes}
          </ReactMarkdown>
        ) : (
          <NotesSkeleton />
        )}
      </Paper>

      {/* ── Snackbar ─────────────────────────────────────────────── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} variant="filled" sx={{ borderRadius: 3 }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
