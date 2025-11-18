import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

export function exportToCSV(data, filename = 'export.csv') {
  const csvRows = [];
  const headers = Object.keys(data[0] || {});
  csvRows.push(headers.join(','));
  for (const row of data) {
    csvRows.push(headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
  }
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  saveAs(blob, filename);
}

export function exportToPDF(data, filename = 'export.pdf') {
  const doc = new jsPDF();
  const headers = Object.keys(data[0] || {});
  let y = 10;
  doc.text(headers.join(' | '), 10, y);
  y += 10;
  for (const row of data) {
    doc.text(headers.map(h => String(row[h] ?? '')).join(' | '), 10, y);
    y += 10;
    if (y > 270) { doc.addPage(); y = 10; }
  }
  doc.save(filename);
}
