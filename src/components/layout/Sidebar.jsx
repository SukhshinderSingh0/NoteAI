/**
 * Sidebar.jsx
 * Responsive collapsible navigation sidebar.
 * - Permanent drawer on desktop (md+)
 * - Temporary (overlay) drawer on mobile
 */

import {
  Box, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Chip, alpha, useTheme,
} from '@mui/material';
import UploadFileIcon       from '@mui/icons-material/UploadFile';
import ArticleIcon          from '@mui/icons-material/Article';
import StyleIcon            from '@mui/icons-material/Style';
import QuizIcon             from '@mui/icons-material/Quiz';
import AutoStoriesIcon      from '@mui/icons-material/AutoStories';
import { useAppContext }    from '../../context/AppContext';

export const DRAWER_WIDTH = 250;

const NAV_ITEMS = [
  { id: 'upload',     label: 'Upload PDF',    icon: <UploadFileIcon />,  },
  { id: 'notes',      label: 'Study Notes',   icon: <ArticleIcon />,      badge: 'AI' },
  { id: 'flashcards', label: 'Flashcards',    icon: <StyleIcon />,        badge: 'AI' },
  { id: 'quiz',       label: 'Quiz',          icon: <QuizIcon />,         badge: 'AI' },
];

function SidebarContent() {
  const theme = useTheme();
  const { activeView, setActiveView, fileName } = useAppContext();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', py: 2 }}>
      {/* ── Brand ─────────────────────────────────────────────── */}
      <Box sx={{ px: 2.5, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 38, height: 38, borderRadius: 2,
            background: 'linear-gradient(135deg, #059669, #D97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(5,150,105,0.4)',
            flexShrink: 0,
          }}
        >
          <AutoStoriesIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}
            sx={{ lineHeight: 1.2, color: 'text.primary' }}>
            NoteAI
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            AI Notes Generator
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* ── Nav items ─────────────────────────────────────────── */}
      <List sx={{ px: 1.5, flexGrow: 1 }} disablePadding>
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <ListItemButton
              key={item.id}
              onClick={() => setActiveView(item.id)}
              sx={{
                borderRadius: 2.5,
                mb: 0.5,
                px: 1.5,
                py: 1,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(5,150,105,0.18), rgba(217,119,6,0.12))'
                  : 'transparent',
                '&:hover': {
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(5,150,105,0.22), rgba(217,119,6,0.16))'
                    : alpha(theme.palette.primary.main, 0.06),
                },
                // Active left accent bar
                '&::before': isActive ? {
                  content: '""',
                  position: 'absolute',
                  left: 0, top: '20%', bottom: '20%',
                  width: 3,
                  borderRadius: '0 3px 3px 0',
                  background: 'linear-gradient(180deg, #059669, #D97706)',
                } : {},
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: isActive ? 'primary.main' : 'text.secondary',
                  transition: 'color 0.2s',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'primary.main' : 'text.primary',
                    },
                  },
                }}
              />
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  sx={{
                    height: 18, fontSize: 10, fontWeight: 700,
                    background: 'linear-gradient(135deg, #059669, #D97706)',
                    color: '#fff',
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      <Divider sx={{ mb: 2 }} />

      {/* ── Current file chip ──────────────────────────────────── */}
      {fileName && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Current file
          </Typography>
          <Chip
            icon={<UploadFileIcon sx={{ fontSize: '14px !important' }} />}
            label={fileName.length > 22 ? fileName.slice(0, 22) + '…' : fileName}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ width: '100%', justifyContent: 'flex-start', fontSize: 11 }}
          />
        </Box>
      )}

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Box sx={{ px: 2.5, pt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Powered by Gemini AI
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Sidebar component.
 * @param {{ mobileOpen: boolean, onMobileClose: () => void }} props
 */
export default function Sidebar({ mobileOpen, onMobileClose }) {
  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile drawer (temporary) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
        }}
      >
        <SidebarContent />
      </Drawer>

      {/* Desktop drawer (permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
        open
      >
        <SidebarContent />
      </Drawer>
    </Box>
  );
}
