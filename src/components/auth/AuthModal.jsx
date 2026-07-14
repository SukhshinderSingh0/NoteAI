/**
 * AuthModal.jsx
 * Combined Sign In / Sign Up MUI Dialog.
 * Tabs switch between the two forms. Validation errors shown in a white-text
 * alert with a translucent red background.
 */

import { useState } from 'react';
import {
  Dialog, DialogContent, Box, Tabs, Tab,
  TextField, Button, Typography, Alert,
  InputAdornment, IconButton, CircularProgress,
  alpha, useTheme,
} from '@mui/material';
import EmailIcon        from '@mui/icons-material/Email';
import LockIcon         from '@mui/icons-material/Lock';
import PersonIcon       from '@mui/icons-material/Person';
import Visibility       from '@mui/icons-material/Visibility';
import VisibilityOff    from '@mui/icons-material/VisibilityOff';
import AutoStoriesIcon  from '@mui/icons-material/AutoStories';
import CloseIcon        from '@mui/icons-material/Close';
import { useAuthContext } from '../../context/AuthContext';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function validate(tab, fields) {
  const errs = [];
  if (tab === 1 && !fields.username?.trim()) errs.push('Username is required.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errs.push('Enter a valid email address.');
  if (!fields.password || fields.password.length < 8) errs.push('Password must be at least 8 characters.');
  if (tab === 1 && fields.password !== fields.confirm) errs.push('Passwords do not match.');
  return errs;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AuthModal({ open, onClose, onSuccess }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { login, register } = useAuthContext();

  const [tab, setTab]         = useState(0); // 0 = Sign In, 1 = Sign Up
  const [fields, setFields]   = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw]   = useState(false);
  const [errs, setErrs]       = useState([]);
  const [busy, setBusy]       = useState(false);

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientErrs = validate(tab, fields);
    if (clientErrs.length) { setErrs(clientErrs); return; }
    setErrs([]);
    setBusy(true);
    try {
      if (tab === 0) {
        await login({ email: fields.email, password: fields.password });
      } else {
        await register({ username: fields.username, email: fields.email, password: fields.password });
      }
      if (onSuccess) onSuccess();
      else onClose();
    } catch (err) {
      setErrs([err.message]);
    } finally {
      setBusy(false);
    }
  };

  const handleTabChange = (_, v) => { setTab(v); setErrs([]); };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      color: '#fff',
      '& fieldset': { borderColor: alpha('#fff', 0.2) },
      '&:hover fieldset': { borderColor: alpha('#fff', 0.4) },
      '&.Mui-focused fieldset': { borderColor: '#059669' },
    },
    '& .MuiInputLabel-root': { color: alpha('#fff', 0.6) },
    '& .MuiInputLabel-root.Mui-focused': { color: '#34D399' },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': { color: alpha('#fff', 0.5) },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: isDark
            ? 'linear-gradient(145deg, #0D2518 0%, #071A10 100%)'
            : 'linear-gradient(145deg, #064E3B 0%, #047857 100%)',
          border: `1px solid ${alpha('#059669', 0.3)}`,
          overflow: 'hidden',
          color: '#fff',  // force white text in both light and dark modes
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12, color: alpha('#fff', 0.5), '&:hover': { color: '#fff' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* Header */}
        <Box sx={{ textAlign: 'center', pt: 4, pb: 2, px: 3 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: 2.5, mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, #059669, #D97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(5,150,105,0.4)',
          }}>
            <AutoStoriesIcon sx={{ color: '#fff', fontSize: 24 }} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: '#fff' }}>
            {tab === 0 ? 'Welcome back' : 'Create your account'}
          </Typography>
          <Typography variant="body2" sx={{ color: alpha('#fff', 0.6), mt: 0.5 }}>
            {tab === 0 ? 'Sign in to access your saved studies.' : 'Start saving your study sessions.'}
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={handleTabChange}
          centered
          sx={{
            mb: 2,
            '& .MuiTab-root': { color: alpha('#fff', 0.5), fontWeight: 600, fontSize: 13 },
            '& .Mui-selected': { color: '#34D399 !important' },
            '& .MuiTabs-indicator': { backgroundColor: '#059669', height: 2 },
          }}
        >
          <Tab label="Sign In" id="auth-tab-signin" />
          <Tab label="Sign Up" id="auth-tab-signup" />
        </Tabs>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ px: 3, pb: 3 }}>
          {/* Error alert */}
          {errs.length > 0 && (
            <Alert
              severity="error"
              sx={{
                mb: 2, borderRadius: 2,
                bgcolor: alpha('#ef4444', 0.15),
                color: '#fff',
                border: `1px solid ${alpha('#ef4444', 0.3)}`,
                '& .MuiAlert-icon': { color: '#f87171' },
              }}
            >
              {errs.map((e, i) => <div key={i}>{e}</div>)}
            </Alert>
          )}

          {/* Username (sign up only) */}
          {tab === 1 && (
            <TextField
              id="auth-username"
              label="Username"
              fullWidth
              value={fields.username}
              onChange={set('username')}
              autoComplete="username"
              sx={{ ...inputSx, mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment>
                ),
              }}
            />
          )}

          {/* Email */}
          <TextField
            id="auth-email"
            label="Email address"
            type="email"
            fullWidth
            value={fields.email}
            onChange={set('email')}
            autoComplete="email"
            sx={{ ...inputSx, mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment>
              ),
            }}
          />

          {/* Password */}
          <TextField
            id="auth-password"
            label="Password"
            type={showPw ? 'text' : 'password'}
            fullWidth
            value={fields.password}
            onChange={set('password')}
            autoComplete={tab === 0 ? 'current-password' : 'new-password'}
            sx={{ ...inputSx, mb: tab === 1 ? 2 : 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPw((s) => !s)} sx={{ color: alpha('#fff', 0.5) }}>
                    {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Confirm password (sign up only) */}
          {tab === 1 && (
            <TextField
              id="auth-confirm"
              label="Confirm password"
              type={showPw ? 'text' : 'password'}
              fullWidth
              value={fields.confirm}
              onChange={set('confirm')}
              autoComplete="new-password"
              sx={{ ...inputSx, mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment>
                ),
              }}
            />
          )}

          {/* Submit */}
          <Button
            id="auth-submit"
            type="submit"
            variant="contained"
            fullWidth
            disabled={busy}
            sx={{
              py: 1.3, fontWeight: 700, fontSize: 15, borderRadius: 2,
              background: 'linear-gradient(135deg, #059669, #D97706)',
              color: '#fff',
              '&:hover': { background: 'linear-gradient(135deg, #047857, #B45309)' },
              '&.Mui-disabled': { opacity: 0.6 },
            }}
          >
            {busy
              ? <CircularProgress size={20} sx={{ color: '#fff' }} />
              : tab === 0 ? 'Sign In' : 'Create Account'}
          </Button>

          {/* Switch link */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.5) }}>
              {tab === 0 ? "Don't have an account? " : 'Already have an account? '}
              <Box
                component="span"
                onClick={() => handleTabChange(null, tab === 0 ? 1 : 0)}
                sx={{ color: '#34D399', cursor: 'pointer', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
              >
                {tab === 0 ? 'Sign Up' : 'Sign In'}
              </Box>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
