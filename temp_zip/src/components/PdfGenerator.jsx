// scr-admin-vite/src/components/PdfGenerator.jsx
import React, { useState } from 'react';
import Button from './ui/button'; // Relative path
import Loader from './ui/loader'; // Relative path

function PdfGenerator({ documentContent, fileName = 'document' }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const handleGeneratePdf = () => {
    if (!documentContent) {
      setMessage('No content to generate PDF from.');
      return;
    }

    setIsGenerating(true);
    setMessage('Generating PDF...');

    // Simulate PDF generation process
    setTimeout(() => {
      // In a real application, you would use a library like jsPDF or html2pdf
      // or send the content to a backend service to generate the PDF.
      // ...removed for production...
      setMessage(`PDF "${fileName}.pdf" generated successfully! (Simulated)`);
      setIsGenerating(false);

      // Simulate download (optional: for a real download, you'd get a blob/URL)
      const blob = new Blob([documentContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2500); // Simulate 2.5-second generation time
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Button onClick={handleGeneratePdf} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate PDF'}
      </Button>
      {isGenerating && <Loader className="mt-4" />}
      {message && <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">{message}</p>}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        (Note: This is a simulated PDF generation and download from text content.)
      </p>
    </div>
  );
}

export default PdfGenerator;