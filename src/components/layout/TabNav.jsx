/**
 * TabNav.jsx
 * Browser-style horizontal tab navigation.
 * Tab structure:
 *   1. Dashboard  — always visible (default)
 *   2. Upload PDF — always visible
 *   3. Notes      — always visible, highlighted when notes content exists
 *   4. Flashcards — always visible
 *   5. Quiz       — always visible
 */

import { Box, Chip, alpha, useTheme } from '@mui/material';
import DashboardIcon    from '@mui/icons-material/Dashboard';
import UploadFileIcon   from '@mui/icons-material/UploadFile';
import ArticleIcon      from '@mui/icons-material/Article';
import StyleIcon        from '@mui/icons-material/Style';
import QuizIcon         from '@mui/icons-material/Quiz';
import { useAppContext }  from '../../context/AppContext';

const TABS = [
  { id: 'dashboard',  label: 'Dashboard',   icon: DashboardIcon },
  { id: 'upload',     label: 'Upload PDF',  icon: UploadFileIcon },
  { id: 'notes',      label: 'Notes',       icon: ArticleIcon,   badge: 'AI' },
  { id: 'flashcards', label: 'Flashcards',  icon: StyleIcon,     badge: 'AI' },
  { id: 'quiz',       label: 'Quiz',        icon: QuizIcon,      badge: 'AI' },
];

export default function TabNav() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { activeView, setActiveView } = useAppContext();

  const bgActive   = isDark ? theme.palette.background.paper : '#ffffff';
  const bgInactive = isDark ? alpha('#ffffff', 0.04) : alpha('#000', 0.04);
  const bgHover    = isDark ? alpha('#ffffff', 0.08) : alpha('#000', 0.07);
  const borderClr  = theme.palette.divider;

  return (
    <Box
      role="tablist"
      aria-label="Main navigation"
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '2px',
        px: { xs: 1, sm: 2 },
        pt: '6px',
        borderBottom: `1px solid ${borderClr}`,
        bgcolor: isDark ? '#071A10' : '#ECFDF5',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeView === tab.id;
        const Icon = tab.icon;

        return (
          <Box
            key={tab.id}
            role="tab"
            tabIndex={0}
            aria-selected={isActive}
            onClick={() => setActiveView(tab.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActiveView(tab.id)}
            sx={{
              /* Safari-style: each tab grows equally to fill all space */
              flex: 1,
              minWidth: 80,
              maxWidth: 240,
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              px: { xs: 1, sm: 1.5 },
              py: '9px',
              cursor: 'pointer',
              userSelect: 'none',
              borderRadius: '8px 8px 0 0',
              border: isActive
                ? `1px solid ${borderClr}`
                : '1px solid transparent',
              borderBottom: isActive ? `1px solid ${bgActive}` : '1px solid transparent',
              bgcolor: isActive ? bgActive : bgInactive,
              mb: isActive ? '-1px' : 0,
              transition: 'background-color 0.15s ease, border-color 0.15s ease',
              outline: 'none',

              '&:hover': {
                bgcolor: isActive ? bgActive : bgHover,
              },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: -2,
              },

              /* Left curve */
              '&::before': isActive ? {
                content: '""',
                position: 'absolute',
                bottom: -1, left: -8,
                width: 8, height: 8,
                background: bgActive,
                borderBottomRightRadius: '50%',
                boxShadow: `4px 0 0 0 ${bgActive}`,
              } : {},

              /* Right curve */
              '&::after': isActive ? {
                content: '""',
                position: 'absolute',
                bottom: -1, right: -8,
                width: 8, height: 8,
                background: bgActive,
                borderBottomLeftRadius: '50%',
                boxShadow: `-4px 0 0 0 ${bgActive}`,
              } : {},
            }}
          >
            {/* Icon */}
            <Icon
              sx={{
                fontSize: 16,
                flexShrink: 0,
                color: isActive ? 'primary.main' : 'text.secondary',
                transition: 'color 0.15s',
              }}
            />

            {/* Label */}
            <Box
              component="span"
              sx={{
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'text.primary' : 'text.secondary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'color 0.15s, font-weight 0.15s',
                display: { xs: 'none', sm: 'block' },
                minWidth: 0,
              }}
            >
              {tab.label}
            </Box>

            {/* AI badge */}
            {tab.badge && (
              <Chip
                label={tab.badge}
                size="small"
                sx={{
                  height: 16, fontSize: 9, fontWeight: 700, flexShrink: 0,
                  background: isActive
                    ? 'linear-gradient(135deg, #059669, #D97706)'
                    : alpha(theme.palette.primary.main, 0.3),
                  color: '#fff',
                  '& .MuiChip-label': { px: 0.6 },
                  transition: 'background 0.15s',
                }}
              />
            )}

            {/* Active top bar */}
            {isActive && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0, left: 8, right: 8,
                  height: 2,
                  borderRadius: '0 0 2px 2px',
                  background: 'linear-gradient(90deg, #059669, #D97706)',
                }}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
}
