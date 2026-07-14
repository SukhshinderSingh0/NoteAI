/**
 * EmptyState.jsx
 * Reusable empty / error / info state placeholder card.
 */

import { Box, Typography, Button, alpha, useTheme } from '@mui/material';

/**
 * @param {{
 *   icon: React.ReactNode,
 *   title: string,
 *   description: string,
 *   actionLabel?: string,
 *   onAction?: () => void,
 *   variant?: 'default' | 'error'
 * }} props
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}) {
  const theme  = useTheme();
  const isErr  = variant === 'error';
  const color  = isErr ? theme.palette.error.main : theme.palette.primary.main;

  return (
    <Box
      className="fade-in-up"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 3,
        borderRadius: 4,
        background: alpha(color, 0.04),
        border: `1.5px dashed ${alpha(color, 0.2)}`,
      }}
    >
      {/* Icon circle */}
      <Box
        sx={{
          width: 72, height: 72, borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(color, 0.15)}, ${alpha(color, 0.05)})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mb: 2.5,
          '& .MuiSvgIcon-root': { fontSize: 34, color },
        }}
      >
        {icon}
      </Box>

      <Typography variant="h6" fontWeight={700} gutterBottom color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mb: actionLabel ? 3 : 0 }}>
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
