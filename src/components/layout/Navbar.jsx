/**
 * Navbar.jsx
 * Top application bar — brand logo, file chip, dark/light mode toggle,
 * and auth button (Sign In or UserMenu avatar).
 */

import {
  AppBar, Toolbar, IconButton, Typography,
  Box, Chip, Tooltip, Button, useTheme, alpha,
} from '@mui/material';
import Brightness4Icon    from '@mui/icons-material/Brightness4';
import Brightness7Icon    from '@mui/icons-material/Brightness7';
import UploadFileIcon     from '@mui/icons-material/UploadFile';
import AutoStoriesIcon    from '@mui/icons-material/AutoStories';
import { useAppContext }  from '../../context/AppContext';
import { useAuthContext } from '../../context/AuthContext';
import UserMenu           from '../auth/UserMenu';

/**
 * @param {{ onToggleTheme: () => void, onOpenAuth: () => void }} props
 */
export default function Navbar({ onToggleTheme, onOpenAuth }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { fileName, setActiveView } = useAppContext();
  const { isAuthenticated, authLoading } = useAuthContext();

  return (
    <>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: '52px !important' }}>

          {/* ── Brand ─────────────────────────────────────────── */}
          <Box 
            onClick={() => setActiveView('home')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mr: 1, cursor: 'pointer' }}
          >
            <Box
              sx={{
                width: 30, height: 30, borderRadius: 1.5,
                background: 'linear-gradient(135deg, #059669, #D97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(5,150,105,0.4)',
                flexShrink: 0,
              }}
            >
              <AutoStoriesIcon sx={{ color: '#fff', fontSize: 17 }} />
            </Box>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(135deg, #059669, #D97706)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.3px',
              }}
            >
              NoteAI
            </Typography>
          </Box>

          {/* ── Spacer ────────────────────────────────────────── */}
          <Box sx={{ flexGrow: 1 }} />

          {/* ── Active file chip ─────────────────────────────── */}
          {fileName && (
            <Chip
              icon={<UploadFileIcon sx={{ fontSize: '13px !important' }} />}
              label={fileName.length > 22 ? fileName.slice(0, 22) + '…' : fileName}
              size="small"
              variant="outlined"
              color="primary"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                fontSize: 11,
                height: 26,
                background: alpha(theme.palette.primary.main, 0.06),
              }}
            />
          )}

          {/* ── Dark / Light mode toggle ──────────────────────── */}
          <Tooltip title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}>
            <IconButton
              onClick={onToggleTheme}
              aria-label="Toggle colour theme"
              size="small"
              sx={{
                borderRadius: 1.5,
                border: `1px solid ${theme.palette.divider}`,
                color: 'text.secondary',
                width: 32, height: 32,
                '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                transition: 'all 0.2s',
              }}
            >
              {isDark
                ? <Brightness7Icon sx={{ fontSize: 17 }} />
                : <Brightness4Icon sx={{ fontSize: 17 }} />}
            </IconButton>
          </Tooltip>

          {/* ── Auth area ─────────────────────────────────────── */}
          {!authLoading && (
            isAuthenticated
              ? <UserMenu />
              : (
                <Button
                  id="navbar-signin-btn"
                  variant="contained"
                  size="small"
                  onClick={onOpenAuth}
                  sx={{
                    background: 'linear-gradient(135deg, #059669, #D97706)',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 2,
                    py: 0.6,
                    fontSize: 13,
                    '&:hover': { background: 'linear-gradient(135deg, #047857, #B45309)' },
                  }}
                >
                  Sign In
                </Button>
              )
          )}
        </Toolbar>
      </AppBar>
    </>
  );
}
