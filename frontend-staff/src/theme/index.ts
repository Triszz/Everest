// ============================================================
// Theme System
// ============================================================
// Phong cách: ShopeeFood Merchant / GrabMerchant / POS hiện đại

export const colors = {
  // Primary colors
  primary: "#0F766E", // Teal chính
  primaryDark: "#0D5A54",
  primaryLight: "#14B8A6",

  // Accent
  accent: "#10B981", // Emerald
  accentDark: "#059669",
  accentLight: "#34D399",

  // Status colors
  success: "#10B981",
  successBg: "#ECFDF5",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  warning: "#F59E0B",
  warningBg: "#FFFBEB",
  info: "#3B82F6",
  infoBg: "#EFF6FF",

  // Neutrals
  white: "#FFFFFF",
  black: "#000000",
  background: "#F8FAFC", // Slate 50
  card: "#FFFFFF",
  border: "#E2E8F0", // Slate 200
  borderLight: "#F1F5F9", // Slate 100

  // Text
  textPrimary: "#1E293B", // Slate 800
  textSecondary: "#64748B", // Slate 500
  textTertiary: "#94A3B8", // Slate 400
  textInverse: "#FFFFFF",

  // Overlay
  overlay: "rgba(0, 0, 0, 0.5)",
  overlayLight: "rgba(0, 0, 0, 0.3)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
} as const;

export const fontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

// Touch targets (accessibility)
export const touchTarget = {
  min: 44, // iOS minimum
  recommended: 48,
  large: 56,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Animation
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  touchTarget,
  shadows,
  animation,
} as const;

export type Theme = typeof theme;
