// --- Dynamic Logo Component Example ---
// Usage: <BrandLogo portalType={portalType} theme={theme} />
import React from 'react';

const logoMap = {
  admin: {
    default: '/public/logo-fullcolor-lightmode-512.png',
    dark: '/public/logo-white-512.png',
  },
  client: {
    default: '/public/logo-brand-512.png',
    dark: '/public/logo-white-512.png',
  },
  affiliate: {
    default: '/public/logo-horizontal-tagline-512.png',
    dark: '/public/logo-white-512.png',
  },
  premium: {
    default: '/public/logo-fullcolor-darkmode-512.png',
    dark: '/public/logo-white-512.png',
  },
};

export function BrandLogo({ portalType = 'client', theme = 'default', ...props }) {
  const src = logoMap[portalType]?.[theme] || logoMap.client.default;
  return <img src={src} alt="Brand Logo" style={{ maxHeight: 64 }} {...props} />;
}