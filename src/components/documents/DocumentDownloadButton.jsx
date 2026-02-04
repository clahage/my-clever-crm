// ===========================================================================
// Path: src/components/documents/DocumentDownloadButton.jsx
// Document Download Button Component with Face Detection & Lightbox
// ENHANCED: face-api.js for smart cropping + click-to-expand modal
// © 1995-2026 Speedy Credit Repair Inc. | Chris Lahage | All Rights Reserved
// ===========================================================================

import React, { useState, useEffect, useRef } from 'react';
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
  Alert,
  Modal,
  Box,
  Fade,
  Backdrop
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
  File,
  X,
  ZoomIn,
  Maximize2
} from 'lucide-react';

// =====================================================
// FACE-API.JS LOADER (Lazy loads from CDN)
// =====================================================
let faceApiLoaded = false;
let faceApiLoading = false;
let faceApiLoadPromise = null;

const loadFaceApi = () => {
  if (faceApiLoaded) return Promise.resolve(true);
  if (faceApiLoading) return faceApiLoadPromise;
  
  faceApiLoading = true;
  faceApiLoadPromise = new Promise((resolve) => {
    // Check if already loaded
    if (window.faceapi) {
      faceApiLoaded = true;
      resolve(true);
      return;
    }

    // Load face-api.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
    script.async = true;
    
    script.onload = async () => {
      try {
        // Load the tiny face detector model (smallest, fastest)
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';
        await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        console.log('✅ face-api.js loaded successfully');
        faceApiLoaded = true;
        resolve(true);
      } catch (err) {
        console.warn('⚠️ face-api.js model load failed, using fallback:', err);
        resolve(false);
      }
    };
    
    script.onerror = () => {
      console.warn('⚠️ face-api.js failed to load, using fallback');
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
  
  return faceApiLoadPromise;
};

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

// =====================================================
// DOCUMENT THUMBNAIL WITH FACE DETECTION & LIGHTBOX
// =====================================================
export const DocumentThumbnail = ({
  url,
  filename = 'document',
  alt = 'Document',
  width = 150,
  height = 100,
  showDownload = true,
  onClick = null,
  enableFaceDetection = true,
  enableLightbox = true
}) => {
  // ===== STATE =====
  const [imageError, setImageError] = useState(false);
  const [facePosition, setFacePosition] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imgRef = useRef(null);
  
  // ===== CHECK IF IMAGE =====
  const isImage = url && (
    url.toLowerCase().includes('.jpg') || 
    url.toLowerCase().includes('.jpeg') || 
    url.toLowerCase().includes('.png') || 
    url.toLowerCase().includes('.gif') ||
    url.toLowerCase().includes('.webp')
  );

  // ===== FACE DETECTION ON IMAGE LOAD =====
  useEffect(() => {
    if (!isImage || !enableFaceDetection || !url) return;
    
    const detectFace = async () => {
      setDetecting(true);
      
      try {
        const apiLoaded = await loadFaceApi();
        
        if (!apiLoaded || !window.faceapi) {
          console.log('📷 Face API not available, using default position');
          setFacePosition({ x: 50, y: 30 }); // Default: upper center
          setDetecting(false);
          return;
        }
        
        // Create temporary image for detection
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = async () => {
          try {
            const detection = await window.faceapi.detectSingleFace(
              img, 
              new window.faceapi.TinyFaceDetectorOptions({ 
                inputSize: 224,
                scoreThreshold: 0.3 
              })
            );
            
            if (detection) {
              // Calculate face center as percentage
              const faceX = ((detection.box.x + detection.box.width / 2) / img.width) * 100;
              const faceY = ((detection.box.y + detection.box.height / 2) / img.height) * 100;
              
              console.log(`✅ Face detected at ${faceX.toFixed(0)}%, ${faceY.toFixed(0)}%`);
              setFacePosition({ x: faceX, y: faceY });
            } else {
              console.log('📷 No face detected, using smart default');
              // For ID cards, face is usually in upper portion
              setFacePosition({ x: 30, y: 35 }); // Left-upper area (common for IDs)
            }
          } catch (err) {
            console.warn('Face detection error:', err);
            setFacePosition({ x: 50, y: 30 });
          }
          setDetecting(false);
        };
        
        img.onerror = () => {
          console.warn('Could not load image for face detection');
          setFacePosition({ x: 50, y: 30 });
          setDetecting(false);
        };
        
        img.src = url;
        
      } catch (err) {
        console.warn('Face detection setup error:', err);
        setFacePosition({ x: 50, y: 30 });
        setDetecting(false);
      }
    };
    
    detectFace();
  }, [url, isImage, enableFaceDetection]);

  // ===== CLICK HANDLER =====
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else if (enableLightbox && isImage) {
      setLightboxOpen(true);
    }
  };

  // ===== CALCULATE OBJECT POSITION =====
  const objectPosition = facePosition 
    ? `${facePosition.x}% ${facePosition.y}%`
    : 'center 30%'; // Default fallback

  return (
    <>
      {/* ===== THUMBNAIL ===== */}
      <div style={{ 
        position: 'relative', 
        display: 'inline-block',
        width,
        height,
        borderRadius: 8,
        overflow: 'hidden',
        border: '2px solid #e0e0e0',
        backgroundColor: '#f5f5f5',
        cursor: enableLightbox && isImage ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#1976d2';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e0e0e0';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
      >
        {isImage && !imageError ? (
          <>
            <img 
              ref={imgRef}
              src={url}
              alt={alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: objectPosition,
                transition: 'object-position 0.3s ease'
              }}
              onClick={handleClick}
              onError={() => setImageError(true)}
            />
            
            {/* Face detection loading indicator */}
            {detecting && (
              <div style={{
                position: 'absolute',
                top: 4,
                left: 4,
                backgroundColor: 'rgba(255,255,255,0.8)',
                borderRadius: 4,
                padding: '2px 6px',
                fontSize: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}>
                <CircularProgress size={10} />
                <span>Detecting...</span>
              </div>
            )}
            
            {/* Expand icon overlay */}
            {enableLightbox && (
              <div style={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 4,
                padding: 4,
                opacity: 0.7,
                transition: 'opacity 0.2s'
              }}
              className="expand-icon"
              >
                <Maximize2 size={14} color="white" />
              </div>
            )}
          </>
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
        
        {/* Download button */}
        {showDownload && (
          <div style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: 4,
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
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

      {/* ===== LIGHTBOX MODAL ===== */}
      <Modal
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
            sx: { backgroundColor: 'rgba(0,0,0,0.9)' }
          }
        }}
      >
        <Fade in={lightboxOpen}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '95vw',
            maxHeight: '95vh',
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Close button */}
            <IconButton
              onClick={() => setLightboxOpen(false)}
              sx={{
                position: 'absolute',
                top: -48,
                right: 0,
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <X size={24} />
            </IconButton>
            
            {/* Full size image */}
            <img
              src={url}
              alt={alt}
              style={{
                maxWidth: '95vw',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: 8,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
              }}
            />
            
            {/* Action buttons */}
            <Box sx={{ 
              mt: 2, 
              display: 'flex', 
              gap: 2,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 2,
              padding: '8px 16px'
            }}>
              <Tooltip title="Download">
                <IconButton 
                  sx={{ color: 'white' }}
                  onClick={() => {
                    // Trigger download
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download size={20} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Open in New Tab">
                <IconButton 
                  sx={{ color: 'white' }}
                  onClick={() => window.open(url, '_blank')}
                >
                  <ExternalLink size={20} />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Filename */}
            <Box sx={{ 
              mt: 1, 
              color: 'rgba(255,255,255,0.7)',
              fontSize: 12
            }}>
              {filename}
            </Box>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default DocumentDownloadButton;