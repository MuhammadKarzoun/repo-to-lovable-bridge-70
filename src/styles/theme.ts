import { colors, dimensions } from '@octobots/ui/src/styles';

// TODO: remove this file and get styles from @octobots/ui instead
export const modernColors = {
  primary: '#1F97FF',
  secondary: '#f1b500',
  background: '#F5F8FA',
  sidebarBackground: '#FFFFFF',
  contentBackground: '#FFFFFF',
  textPrimary: '#333333',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  success: '#3CCC38',
  warning: '#FDA50F',
  danger: '#EA475D',
  info: '#3B85F4',
  messageBackground: '#F3F4F6',
  messageBackgroundOwn: '#1F97FF',
  messageTextOwn: '#FFFFFF',
  unread: '#EBF5FF',
  hover: '#F9FAFB',
  active: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.05)',
  avatarBackground: '#E5E7EB',
  
  // New colors for enhanced sidebar
  sidebarDark: '#1A202C',
  sidebarMedium: '#2D3748',
  sidebarLight: '#4A5568',
  sidebarText: '#E2E8F0',
  sidebarTextMuted: '#A0AEC0',
  sidebarHover: '#2D3748',
  sidebarActive: '#3182CE',
  sidebarBorder: '#2D3748',
  sidebarItemHover: 'rgba(255, 255, 255, 0.1)',
  sidebarItemActive: 'rgba(255, 255, 255, 0.2)',
  
  // Accent colors
  accentBlue: '#3182CE',
  accentGreen: '#38A169',
  accentPurple: '#805AD5',
  accentPink: '#D53F8C',
  accentOrange: '#DD6B20',
  
  // Status colors
  statusOnline: '#38A169',
  statusAway: '#DD6B20',
  statusOffline: '#A0AEC0',
  statusBusy: '#E53E3E',
};

// Spacing system
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
};

// Border radius
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  circle: '50%',
  pill: '9999px',
};

// Typography
export const typography = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSizes: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '18px',
    xxl: '20px',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8,
  },
};

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  outline: '0 0 0 3px rgba(66, 153, 225, 0.5)',
  none: 'none',
};

// Transitions
export const transitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '350ms ease-in-out',
};

// Z-index
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};
