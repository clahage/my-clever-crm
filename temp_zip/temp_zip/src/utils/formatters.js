// src/utils/formatters.js
// Utility functions for formatting data

export const formatDate = (date) => {
  if (!date) return '';
  
  if (date.seconds) {
    // Firestore timestamp
    return new Date(date.seconds * 1000).toLocaleDateString();
  }
  
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString();
  }
  
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  
  return '';
};

export const formatDateTime = (date) => {
  if (!date) return '';
  
  if (date.seconds) {
    // Firestore timestamp
    return new Date(date.seconds * 1000).toLocaleString();
  }
  
  if (typeof date === 'string') {
    return new Date(date).toLocaleString();
  }
  
  if (date instanceof Date) {
    return date.toLocaleString();
  }
  
  return '';
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0.00';
  
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(num);
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Format as +X (XXX) XXX-XXXX
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
};

export const formatSSN = (ssn, showFull = false) => {
  if (!ssn) return '';
  
  const cleaned = ssn.replace(/\D/g, '');
  
  if (showFull && cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  
  // Show only last 4
  if (cleaned.length >= 4) {
    return `XXX-XX-${cleaned.slice(-4)}`;
  }
  
  return ssn;
};

export const formatZipCode = (zip) => {
  if (!zip) return '';
  
  const cleaned = zip.replace(/\D/g, '');
  
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  return cleaned.slice(0, 5);
};

export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return '0%';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  return `${num.toFixed(decimals)}%`;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatDuration = (seconds) => {
  if (!seconds) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);
  
  return parts.join(' ') || '0s';
};

export const formatName = (firstName, lastName, middleName = '') => {
  const parts = [];
  if (firstName) parts.push(firstName);
  if (middleName) parts.push(middleName);
  if (lastName) parts.push(lastName);
  
  return parts.join(' ').trim();
};

export const formatAddress = (address, city, state, zip) => {
  const parts = [];
  if (address) parts.push(address);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zip) parts.push(zip);
  
  if (city && state) {
    return `${address || ''}\n${city}, ${state} ${zip || ''}`.trim();
  }
  
  return parts.join(', ').trim();
};

export const formatCreditScore = (score) => {
  if (!score) return 'N/A';
  
  const num = typeof score === 'string' ? parseInt(score) : score;
  
  if (num >= 800) return `${num} (Excellent)`;
  if (num >= 740) return `${num} (Very Good)`;
  if (num >= 670) return `${num} (Good)`;
  if (num >= 580) return `${num} (Fair)`;
  return `${num} (Poor)`;
};

export const formatStatus = (status) => {
  if (!status) return '';
  
  // Convert snake_case to Title Case
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const formatTimeAgo = (date) => {
  if (!date) return '';
  
  const now = new Date();
  let past = date;
  
  if (date.seconds) {
    past = new Date(date.seconds * 1000);
  } else if (typeof date === 'string') {
    past = new Date(date);
  }
  
  const seconds = Math.floor((now - past) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  
  return `${Math.floor(seconds / 31536000)} years ago`;
};

export default {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatPhoneNumber,
  formatSSN,
  formatZipCode,
  formatPercentage,
  formatFileSize,
  formatDuration,
  formatName,
  formatAddress,
  formatCreditScore,
  formatStatus,
  formatTimeAgo
};