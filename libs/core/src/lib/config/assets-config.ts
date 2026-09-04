/**
 * Assets configuration
 * Centralized management of application assets (images, logos, icons, etc.)
 */

export const ASSETS_CONFIG = {
  images: {
    logo: {
      main: '/assets/images/logo/reals-logo.jpg',
      alt: 'Reals Logo',
    },
  },
} as const;

export type AssetsConfig = typeof ASSETS_CONFIG;
