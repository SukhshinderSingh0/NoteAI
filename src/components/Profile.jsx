import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Avatar, alpha, useTheme, Grid, Skeleton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { useAuthContext } from '../context/AuthContext';
import { apiListDocuments } from '../api/documentsApi';

function getInitials(name = '') {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

export default function Profile() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user } = useAuthContext();
  const [docCount, setDocCount] = useState(null);

  useEffect(() => {
    let active = true;
    if (user) {
      apiListDocuments().then(data => {
        if (active) setDocCount(data.documents ? data.documents.length : 0);
      }).catch(err => console.error(err));
    }
    return () => { active = false; };
  }, [user]);

  if (!user) return null;

  return (
    <Box
      sx={{
        minHeight: '60vh',
        borderRadius: 4,
        p: { xs: 3, sm: 5 },
        background: isDark
          ? `
            radial-gradient(ellipse at 10% 20%, rgba(5,150,105,0.12) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 80%, rgba(217,119,6,0.08) 0%, transparent 55%),
            linear-gradient(160deg, #071A10 0%, #0D2518 60%, #071A10 100%)
          `
          : `
            radial-gradient(ellipse at 10% 20%, rgba(5,150,105,0.06) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 80%, rgba(217,119,6,0.04) 0%, transparent 55%),
            linear-gradient(160deg, #F0FDF4 0%, #ECFDF5 60%, #F0FDF4 100%)
          `,
        boxShadow: isDark ? 'none' : '0 12px 40px rgba(5,150,105,0.05)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(5,150,105,0.1)'}`,
      }}
    >
      <Typography variant="h4" fontWeight={800} sx={{ color: isDark ? '#fff' : 'text.primary', mb: 4, letterSpacing: '-0.5px' }}>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 4,
              background: isDark
                ? 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #F8FAFC 100%)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
              backdropFilter: 'blur(12px)',
              textAlign: 'center', p: 3,
            }}
          >
            <Avatar
              sx={{
                width: 100, height: 100, mx: 'auto', mb: 2,
                background: 'linear-gradient(135deg, #059669, #D97706)',
                fontSize: 36, fontWeight: 800,
                border: `4px solid ${alpha('#059669', 0.2)}`,
              }}
            >
              {getInitials(user.username)}
            </Avatar>
            <Typography variant="h6" fontWeight={800} sx={{ color: isDark ? '#fff' : 'text.primary' }}>
              {user.username}
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.55)' : 'text.secondary', mt: 0.5 }}>
              NoteAI Member
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 4,
              background: isDark
                ? 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #F8FAFC 100%)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.06)',
              backdropFilter: 'blur(12px)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: isDark ? '#fff' : 'text.primary', mb: 3 }}>
                Account Details
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: 2,
                  background: isDark ? alpha('#059669', 0.15) : alpha('#059669', 0.1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <PersonIcon sx={{ color: '#059669', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Username
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ color: isDark ? '#fff' : 'text.primary' }}>
                    {user.username}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: 2,
                  background: isDark ? alpha('#D97706', 0.15) : alpha('#D97706', 0.1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <EmailIcon sx={{ color: '#D97706', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Email Address
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ color: isDark ? '#fff' : 'text.primary' }}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: 2,
                  background: isDark ? alpha('#0284c7', 0.15) : alpha('#0284c7', 0.1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <AutoStoriesIcon sx={{ color: '#0284c7', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                    Saved Studies
                  </Typography>
                  {docCount === null ? (
                    <Skeleton variant="text" width={40} sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                  ) : (
                    <Typography variant="body1" fontWeight={600} sx={{ color: isDark ? '#fff' : 'text.primary' }}>
                      {docCount}
                    </Typography>
                  )}
                </Box>
              </Box>

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
