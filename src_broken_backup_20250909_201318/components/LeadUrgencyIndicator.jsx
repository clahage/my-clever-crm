// scr-admin-vite/src/components/LeadUrgencyIndicator.jsx
import React from 'react';

function LeadUrgencyIndicator({ urgency }) {
  let bgColor = '';
  let textColor = 'text-white';
  let icon = '';
  let label = '';
  let animationClass = '';

  switch ((urgency || '').toLowerCase()) {
    case 'critical': // NEW CATEGORY
      bgColor = 'bg-red-700'; // Darker, more intense red
      icon = '🚨'; // Alarm emoji
      label = 'Critical Action';
      animationClass = 'animate-blink'; // NEW: Use the blinking animation
      break;
    case 'high':
      bgColor = 'bg-red-500'; // Red
      icon = '🔥';
      label = 'High Urgency';
      animationClass = 'animate-burst-red-hot'; // Keep bursting animation
      break;
    case 'warm':
    case 'in-between':
      bgColor = 'bg-speedy-orange-500'; // Orange for Warm
      icon = '🟠';
      label = 'Getting Warm';
      textColor = 'text-white'; // Ensure white text for orange
      // No animation for now
      break;
    case 'medium':
      bgColor = 'bg-speedy-yellow-500'; // Yellow for Medium
      textColor = 'text-speedy-dark-neutral-900'; // Dark text for light yellow background
      icon = '⚠️';
      label = 'Medium Urgency';
      animationClass = 'animate-subtle-glow'; // Keep subtle glow
      break;
    case 'low':
      bgColor = 'bg-speedy-green-500'; // Green for Low
      icon = '✅';
      label = 'Low Urgency';
      textColor = 'text-white'; // Ensure white text for green
      // No animation
      break;
    case 'cold':
    case 'non-urgent':
      bgColor = 'bg-speedy-blue-500'; // Blue for Cold
      icon = '🥶';
      label = 'Cold Lead';
      textColor = 'text-white'; // Ensure white text for blue
      // No animation
      break;
    default:
      bgColor = 'bg-speedy-dark-neutral-400';
      textColor = 'text-white';
      icon = '❓';
      label = 'Unknown';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-md ${bgColor} ${textColor} ${animationClass}`}
      title={`Urgency: ${label}`}
    >
      <span className="mr-1">{icon}</span>
      {label}
    </span>
  );
}

export default LeadUrgencyIndicator;