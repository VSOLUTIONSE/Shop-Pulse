import type { CSSProperties } from "react";

export const COLORS = {
  primary: "#4030e8",
  dark: "#121215",
  darkCard: "#1a1a1a",
  darkSurface: "#0a0a0a",
  darkBorder: "#504f5b",
  textPrimary: "#18181b",
  textSecondary: "#364153",
  textMuted: "#52525b",
  textLight: "#71717a",
  textOnDark: "#87899f",
  textOnDarkLight: "#cdcde4",
  white: "#ffffff",
  black: "#000000",
  grayBorder: "#a1a1aa",
  lightSurface: "#f9fafb",
} as const;

export const FONTS = {
  inter: "'Inter', system-ui, sans-serif",
  satoshi: "'Satoshi', system-ui, sans-serif",
  plusJakarta: "'Plus Jakarta Sans', system-ui, sans-serif",
} as const;

export const GRADIENTS = {
  darkRadial:
    "radial-gradient(260.859% 260.877% at 50% -204.07%, #0d0a2e 67.298%, #09090b 100%)",
  deviceFrame:
    "linear-gradient(150.983deg, #999a9b -8.937%, #595c72 108.937%)",
  glassOverlay:
    "linear-gradient(150.918deg, rgba(255, 255, 255, 0.08) -8.854%, rgba(255, 255, 255, 0.03) 108.854%)",
  ctaGlow:
    "linear-gradient(90deg, #44bcff -0.548%, #44b0ff 22.864%, #ff44ec 48.357%, #ff44ec 73.33%, #ff675e 99.343%)",
} as const;

export const SHADOWS = {
  cardWhite: "0px 4px 4px rgba(0, 0, 0, 0.25)",
  navWhite: "0px 3px 2px rgba(196, 196, 202, 0.25)",
  deviceOuter:
    "-7px 10px 28px 0px rgba(0, 0, 0, 0.1), -29px 41px 50px 0px rgba(0, 0, 0, 0.09), -66px 91px 68px 0px rgba(0, 0, 0, 0.05), -117px 162px 80px 0px rgba(0, 0, 0, 0.01)",
  browserFrame:
    "inset 0px 1px 0px 0px rgba(255, 255, 255, 0.1), 0px 0px 0px 1px rgba(255, 255, 255, 0.08)",
  browserInner:
    "inset 0px 0.418px 0px 0px rgba(255, 255, 255, 0.1), 0px 0px 0px 0.418px rgba(255, 255, 255, 0.08)",
  phoneNotch:
    "inset 0px 0.418px 0px 0px rgba(255, 255, 255, 0.05), drop-shadow(0px 0.836px 2.507px rgba(0, 0, 0, 0.8))",
  testimonialCard:
    "inset 0 0 0 1px #504f5b",
} as const;

export const sectionPadding = "px-4 py-16 sm:px-6 lg:px-8 lg:py-[120px]" as const;
export const containerMax = "mx-auto max-w-7xl" as const;
export const sectionHeading = "text-center" as const;
