// ===========================================================================
// Path: src/components/documents/DocumentDownloadButton.jsx
// Document Download Button Component with multiple variants
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ===========================================================================

import React, { useState } from 'react';
import { 
  Button, 
  IconButton, 
  Tooltip, 
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  Download, 
  FileDown, 
  Eye, 
  ExternalLink,
  Copy,
  Check,
  Image as ImageIcon,
  FileText,
  File
} from 'lucide-react';

// ===== DOCUMENT DOWNLOAD BUTTON COMPONENT =====
const DocumentDownloadButton = ({ 
  url, 
  filename = 'document', 
  variant = 'icon', // 'icon', 'button', 'menu'
  label = 'Download',
  size = 'small',
  color = 'primary',
  showPreview = true,
  showCopyLink = true,
  disabled = false,
  onDownloadStart = null,
  onDownloadComplete = null,
  onError = null
}) => {
  // ===== STATE =====
  const [downloading, setDownloading] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [copied, setCopied] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ===== DETERMINE FILE TYPE FROM URL =====
  const getFileType = () => {
    const lower = url.toLowerCase();
    if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.gif') || lower.includes('.webp')) {
      return 'image';
    }
    if (lower.includes('.pdf')) {
      return 'pdf';
    }
    if (lower.includes('.doc') || lower.includes('.docx')) {
      return 'word';
    }
    return 'file';
  };

  const fileType = getFileType();

  // ===== DOWNLOAD HANDLER =====
  const handleDownload = async () => {
    if (!url) {
      setSnackbar({ open: true, message: 'No file URL provided', severity: 'error' });
      onError?.('No file URL provided');
      return;
    }

    try {
      setDownloading(true);
      onDownloadStart?.();

      console.log('📥 Starting download:', filename);

      // Fetch the file
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log('✅ Download complete:', filename);
      setSnackbar({ open: true, message: `Downloaded: ${filename}`, severity: 'success' });
      onDownloadComplete?.();
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      
      // Fallback: open in new tab
      window.open(url, '_blank');
      
      setSnackbar({ 
        open: true, 
        message: 'Download failed - opened in new tab instead', 
        severity: 'warning' 
      });
      onError?.(error.message);
    } finally {
      setDownloading(false);
      setMenuAnchor(null);
    }
  };

  // ===== PREVIEW HANDLER =====
  const handlePreview = () => {
    window.open(url, '_blank');
    setMenuAnchor(null);
  };

  // ===== COPY LINK HANDLER =====
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setSnackbar({ open: true, message: 'Link copied to clipboard', severity: 'success' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setSnackbar({ open: true, message: 'Link copied to clipboard', severity: 'success' });
      setTimeout(() => setCopied(false), 2000);
    }
    setMenuAnchor(null);
  };

  // ===== RENDER ICON VARIANT =====
  if (variant === 'icon') {
    return (
      <>
        <Tooltip title={downloading ? 'Downloading...' : label}>
          <span>
            <IconButton 
              onClick={handleDownload}
              disabled={disabled || downloading}
              size={size}
              color={color}
            >
              {downloading ? (
                <CircularProgress size={18} />
              ) : (
                <Download size={18} />
              )}
            </IconButton>
          </span>
        </Tooltip>
        
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // ===== RENDER BUTTON VARIANT =====
  if (variant === 'button') {
    return (
      <>
        <Button 
          startIcon={downloading ? <CircularProgress size={16} /> : <FileDown size={16} />}
          onClick={handleDownload}
          size={size}
          variant="outlined"
          color={color}
          disabled={disabled || downloading}
        >
          {downloading ? 'Downloading...' : label}
        </Button>
        
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // ===== RENDER MENU VARIANT (with preview and copy options) =====
  if (variant === 'menu') {
    return (
      <>
        <Tooltip title="Document options">
          <span>
            <IconButton 
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              disabled={disabled}
              size={size}
              color={color}
            >
              {fileType === 'image' ? (
                <ImageIcon size={18} />
              ) : fileType === 'pdf' ? (
                <FileText size={18} />
              ) : (
                <File size={18} />
              )}
            </IconButton>
          </span>
        </Tooltip>
        
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem onClick={handleDownload} disabled={downloading}>
            <ListItemIcon>
              {downloading ? <CircularProgress size={18} /> : <Download size={18} />}
            </ListItemIcon>
            <ListItemText>Download</ListItemText>
          </MenuItem>
          
          {showPreview && (
            <MenuItem onClick={handlePreview}>
              <ListItemIcon>
                <ExternalLink size={18} />
              </ListItemIcon>
              <ListItemText>Open in New Tab</ListItemText>
            </MenuItem>
          )}
          
          {showCopyLink && (
            <MenuItem onClick={handleCopyLink}>
              <ListItemIcon>
                {copied ? <Check size={18} color="green" /> : <Copy size={18} />}
              </ListItemIcon>
              <ListItemText>{copied ? 'Copied!' : 'Copy Link'}</ListItemText>
            </MenuItem>
          )}
        </Menu>
        
        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Default fallback
  return null;
};

// ===== DOCUMENT THUMBNAIL WITH DOWNLOAD =====
export const DocumentThumbnail = ({
  url,
  filename = 'document',
  alt = 'Document',
  width = 150,
  height = 100,
  showDownload = true,
  onClick = null
}) => {
  const [imageError, setImageError] = useState(false);
  
  const isImage = url && (
    url.toLowerCase().includes('.jpg') || 
    url.toLowerCase().includes('.jpeg') || 
    url.toLowerCase().includes('.png') || 
    url.toLowerCase().includes('.gif') ||
    url.toLowerCase().includes('.webp')
  );

  return (
    <div style={{ 
      position: 'relative', 
      display: 'inline-block',
      width,
      height,
      borderRadius: 8,
      overflow: 'hidden',
      border: '1px solid #ddd',
      backgroundColor: '#f5f5f5'
    }}>
      {isImage && !imageError ? (
        <img 
          src={url}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%', // Focus on upper portion (faces usually there)
            cursor: onClick ? 'pointer' : 'default'
          }}
          onClick={onClick}
          onError={() => setImageError(true)}
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 4
        }}>
          <FileText size={32} style={{ opacity: 0.5 }} />
          <span style={{ fontSize: 10, opacity: 0.7 }}>{filename}</span>
        </div>
      )}
      
      {showDownload && (
        <div style={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: 4
        }}>
          <DocumentDownloadButton 
            url={url}
            filename={filename}
            variant="icon"
            size="small"
          />
        </div>
      )}
    </div>
  );
};

export default DocumentDownloadButton;