// ============================================================================
// src/utils/exportHelpers.js
// ============================================================================
// Shared export/download utilities to eliminate redundancy across hub components
// Previously duplicated in: MarketingHub, ContactsPipelineHub, ReportsHub,
// RevenueHub, CommunicationsHub, DisputeAdminPanel, and many more
// ============================================================================

/**
 * Download file to user's device
 * @param {string|Blob} content - File content or Blob
 * @param {string} filename - Name for the downloaded file
 * @param {string} mimeType - MIME type of the file
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = content instanceof Blob
    ? content
    : new Blob([content], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} columns - Optional column configuration [{key, header}]
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (data, columns = null) => {
  if (!data || data.length === 0) return '';

  // Determine columns from data or use provided columns
  const cols = columns || Object.keys(data[0]).map(key => ({ key, header: key }));

  // Create header row
  const headers = cols.map(col => `"${col.header || col.key}"`).join(',');

  // Create data rows
  const rows = data.map(row => {
    return cols.map(col => {
      let value = row[col.key];

      // Handle nested properties (e.g., 'user.name')
      if (col.key.includes('.')) {
        value = col.key.split('.').reduce((obj, key) => obj?.[key], row);
      }

      // Handle different value types
      if (value === null || value === undefined) return '""';
      if (typeof value === 'object') {
        // Handle Firestore timestamps
        if (value.toDate) {
          value = value.toDate().toISOString();
        } else if (Array.isArray(value)) {
          value = value.join('; ');
        } else {
          value = JSON.stringify(value);
        }
      }

      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  }).join('\n');

  return `${headers}\n${rows}`;
};

/**
 * Convert array of objects to JSON string
 * @param {Array} data - Array of objects to convert
 * @param {boolean} pretty - Whether to format with indentation
 * @returns {string} JSON formatted string
 */
export const convertToJSON = (data, pretty = true) => {
  if (!data) return '[]';
  return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
};

/**
 * Export data to CSV file
 * @param {Array} data - Data to export
 * @param {string} filename - Filename (without extension)
 * @param {Array} columns - Optional column configuration
 */
export const exportToCSV = (data, filename = 'export', columns = null) => {
  const csv = convertToCSV(data, columns);
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8');
};

/**
 * Export data to JSON file
 * @param {Array} data - Data to export
 * @param {string} filename - Filename (without extension)
 */
export const exportToJSON = (data, filename = 'export') => {
  const json = convertToJSON(data);
  downloadFile(json, `${filename}.json`, 'application/json');
};

/**
 * Export data to Excel-compatible CSV (with BOM for UTF-8)
 * @param {Array} data - Data to export
 * @param {string} filename - Filename (without extension)
 * @param {Array} columns - Optional column configuration
 */
export const exportToExcel = (data, filename = 'export', columns = null) => {
  const csv = convertToCSV(data, columns);
  // Add BOM for Excel UTF-8 compatibility
  const bom = '\ufeff';
  downloadFile(bom + csv, `${filename}.csv`, 'text/csv;charset=utf-8');
};

/**
 * Generate filename with date
 * @param {string} prefix - Filename prefix
 * @param {string} extension - File extension (without dot)
 * @returns {string} Filename with date
 */
export const generateFilename = (prefix, extension = 'csv') => {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefix}_${date}.${extension}`;
};

/**
 * Parse CSV string to array of objects
 * @param {string} csvString - CSV content
 * @returns {Array} Array of objects
 */
export const parseCSV = (csvString) => {
  if (!csvString || csvString.trim() === '') return [];

  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map(h =>
    h.replace(/^"|"$/g, '').trim()
  );

  // Parse data rows
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.replace(/^"|"$/g, '').replace(/""/g, '"'));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.replace(/^"|"$/g, '').replace(/""/g, '"'));

    // Create object from headers and values
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = values[i] || '';
    });
    return obj;
  });
};

/**
 * Create printable version of data
 * @param {string} title - Document title
 * @param {string} content - HTML content to print
 */
export const printContent = (title, content) => {
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${content}
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (e) {
      document.body.removeChild(textarea);
      return false;
    }
  }
};

export default {
  downloadFile,
  convertToCSV,
  convertToJSON,
  exportToCSV,
  exportToJSON,
  exportToExcel,
  generateFilename,
  parseCSV,
  printContent,
  copyToClipboard
};
