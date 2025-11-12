// src/dev/beacon.tsx
import React from "react";

const DEV_BEACONS = import.meta.env.VITE_DEV_BEACONS === 'true';

export default function DevBeacon({ label }: { label: string }) {
  if (!DEV_BEACONS) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      background: '#fbbf24',
      color: '#1f2937',
      fontSize: 12,
      fontWeight: 'bold',
      padding: '2px 8px',
      borderBottomRightRadius: 8,
      boxShadow: '0 2px 8px #0002',
    }}>
      {label}
    </div>
  );
}
