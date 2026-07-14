/**
 * UserMenu.jsx
 * Avatar + dropdown menu shown in the Navbar when the user is authenticated.
 */

import { useState } from 'react';
import {
  Avatar, Menu, MenuItem, ListItemIcon, ListItemText,
  Typography, Box, Divider, alpha, useTheme,
} from '@mui/material';
import LogoutIcon   from '@mui/icons-material/Logout';
import { useAuthContext } from '../../context/AuthContext';
import { useAppContext }  from '../../context/AppContext';

function getInitials(name = '') {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function UserMenu() {
  const theme = useTheme();
  const { user, logout }        = useAuthContext();
  const { setActiveView, resetSession } = useAppContext();
  const [anchor, setAnchor]     = useState(null);

  const open = Boolean(anchor);

  const handleLogout = async () => {
    setAnchor(null);
    await logout();
    resetSession();
    setActiveView('home');
  };

  if (!user) return null;

  return (
    <>
      {/* Avatar button */}
      <Avatar
        id="user-menu-avatar"
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{
          width: 34, height: 34,
          background: 'linear-gradient(135deg, #059669, #D97706)',
          fontSize: 13, fontWeight: 800, cursor: 'pointer',
          border: `2px solid ${alpha('#059669', 0.4)}`,
          transition: 'box-shadow 0.2s',
          '&:hover': { boxShadow: '0 0 0 3px rgba(5,150,105,0.25)' },
        }}
      >
        {getInitials(user.username)}
      </Avatar>

      {/* Dropdown */}
      <Menu
        id="user-menu"
        anchorEl={anchor}
        open={open}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1, borderRadius: 3, minWidth: 200,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          },
        }}
      >
        {/* User info header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {user.username}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem
          onClick={() => { setAnchor(null); setActiveView('profile'); }}
          sx={{ py: 1.25, gap: 1, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) } }}
        >
          <ListItemIcon sx={{ minWidth: 'unset' }}>
            <Avatar sx={{ width: 22, height: 22, fontSize: 11, bgcolor: 'primary.main' }}>
              {getInitials(user.username)}
            </Avatar>
          </ListItemIcon>
          <ListItemText primary="My Profile" primaryTypographyProps={{ sx: { fontWeight: 600, fontSize: 14 } }} />
        </MenuItem>

        <Divider />

        <MenuItem
          id="user-menu-logout"
          onClick={handleLogout}
          sx={{ py: 1.25, gap: 1, color: 'error.main', '&:hover': { bgcolor: alpha('#ef4444', 0.06) } }}
        >
          <ListItemIcon sx={{ minWidth: 'unset' }}>
            <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText primary="Sign Out" primaryTypographyProps={{ sx: { fontWeight: 600, fontSize: 14 } }} />
        </MenuItem>
      </Menu>
    </>
  );
}
