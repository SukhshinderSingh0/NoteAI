import { createTheme, alpha } from '@mui/material/styles';

// ---------------------------------------------------------------------------
// Design tokens — Seagreen / Emerald + Gold / Amber
// ---------------------------------------------------------------------------
const EMERALD      = '#059669';  // emerald-600
const EMERALD_DARK = '#047857';  // emerald-700
const EMERALD_LIGHT= '#34D399';  // emerald-400
const GOLD         = '#D97706';  // amber-600
const GOLD_LIGHT   = '#FCD34D';  // amber-300

/**
 * Build a MUI theme for the given color-mode.
 * @param {'light'|'dark'} mode
 */
export const buildTheme = (mode) => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main:         EMERALD,
        dark:         EMERALD_DARK,
        light:        EMERALD_LIGHT,
        contrastText: '#fff',
      },
      secondary: {
        main:         GOLD,
        light:        GOLD_LIGHT,
        contrastText: '#fff',
      },
      background: {
        default: isDark ? '#071A10' : '#F0FDF4',
        paper:   isDark ? '#0D2518' : '#FFFFFF',
      },
      success: {
        main:  '#10B981',
        light: '#34D399',
      },
      error: {
        main:  '#EF4444',
        light: '#F87171',
      },
      text: {
        primary:   isDark ? '#ECFDF5' : '#064E3B',
        secondary: isDark ? '#6EE7B7' : '#065F46',
      },
      divider: isDark
        ? alpha(EMERALD_LIGHT, 0.15)
        : alpha(EMERALD, 0.12),
    },

    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0.3 },
    },

    shape: { borderRadius: 14 },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 20px',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${EMERALD} 0%, ${EMERALD_DARK} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${EMERALD_DARK} 0%, #065F46 100%)`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDark
              ? '0 4px 24px rgba(0,0,0,0.4)'
              : `0 4px 24px ${alpha(EMERALD, 0.08)}`,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundImage: isDark
              ? `linear-gradient(180deg, #0D2518 0%, #071A10 100%)`
              : `linear-gradient(180deg, #ECFDF5 0%, #F0FDF4 100%)`,
            borderRight: `1px solid ${isDark ? alpha(EMERALD_LIGHT, 0.15) : alpha(EMERALD, 0.12)}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? '0 1px 0 rgba(255,255,255,0.05)'
              : `0 1px 0 ${alpha(EMERALD, 0.1)}`,
            backdropFilter: 'blur(10px)',
            background: isDark
              ? alpha('#071A10', 0.88)
              : alpha('#FFFFFF', 0.88),
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 8, height: 6 },
          bar: {
            borderRadius: 8,
            background: `linear-gradient(90deg, ${EMERALD}, ${GOLD})`,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 8 },
        },
      },
    },
  });
};
