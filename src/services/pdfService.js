import jsPDF from 'jspdf';

const pdfService = {
  generateDisputeLetterPDF(letter) {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set font styles
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 7;
      let yPosition = margin;

      // Add header
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(letter.title || 'Dispute Letter', margin, yPosition);
      yPosition += lineHeight * 2;

      // Add metadata
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(100);
      doc.text(`Bureau: ${letter.bureau || 'N/A'}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Account: ${letter.accountNumber || 'N/A'}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Status: ${letter.status || 'Draft'}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Created: ${letter.createdAt ? new Date(letter.createdAt).toLocaleDateString() : 'N/A'}`, margin, yPosition);
      yPosition += lineHeight * 2;

      // Reset text color for body
      doc.setTextColor(0);
      doc.setFontSize(11);

      // Add letter content with word wrap
      if (letter.content) {
        const lines = doc.splitTextToSize(letter.content, pageWidth - (margin * 2));
        
        lines.forEach((line) => {
          // Check if we need a new page
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
      }

      // Add footer on last page
      yPosition = pageHeight - margin;
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Generated from CleverCRM Dispute Management System', margin, yPosition);
      doc.text(new Date().toLocaleString(), pageWidth - margin - 50, yPosition);

      // Save the PDF
      const filename = `${letter.title?.replace(/[^a-z0-9]/gi, '_') || 'dispute_letter'}_${Date.now()}.pdf`;
      doc.save(filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Error generating PDF:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate formatted professional letter PDF
  generateProfessionalPDF(letter) {
    try {
      const doc = new jsPDF();
      const margin = 25;
      const lineHeight = 7;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = margin;

      // Professional letterhead styling
      doc.setFillColor(245, 247, 250);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Title
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text('CREDIT DISPUTE LETTER', pageWidth / 2, 25, { align: 'center' });
      
      yPosition = 55;

      // From section (Client info)
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0);
      
      if (letter.clientName) {
        doc.setFont(undefined, 'bold');
        doc.text('FROM:', margin, yPosition);
        doc.setFont(undefined, 'normal');
        yPosition += lineHeight;
        doc.text(letter.clientName, margin, yPosition);
        yPosition += lineHeight;
        if (letter.clientAddress) {
          doc.text(letter.clientAddress, margin, yPosition);
          yPosition += lineHeight;
        }
        if (letter.clientCity && letter.clientState && letter.clientZip) {
          doc.text(`${letter.clientCity}, ${letter.clientState} ${letter.clientZip}`, margin, yPosition);
          yPosition += lineHeight;
        }
        yPosition += lineHeight;
      }

      // To section (Bureau info)
      doc.setFont(undefined, 'bold');
      doc.text('TO:', margin, yPosition);
      doc.setFont(undefined, 'normal');
      yPosition += lineHeight;
      doc.text(letter.bureau || 'Credit Bureau', margin, yPosition);
      yPosition += lineHeight;
      doc.text('Dispute Department', margin, yPosition);
      yPosition += lineHeight * 2;

      // Date
      doc.text(`Date: ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, margin, yPosition);
      yPosition += lineHeight * 2;

      // Re: line
      if (letter.accountNumber) {
        doc.setFont(undefined, 'bold');
        doc.text(`Re: Account Number ${letter.accountNumber}`, margin, yPosition);
        yPosition += lineHeight * 2;
      }

      // Letter body
      doc.setFont(undefined, 'normal');
      doc.setFontSize(11);
      
      if (letter.content) {
        const lines = doc.splitTextToSize(letter.content, pageWidth - (margin * 2));
        
        lines.forEach((line) => {
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        });
      }

      // Save with professional filename
      const filename = `Dispute_Letter_${letter.bureau}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('Error generating professional PDF:', error);
      return { success: false, error: error.message };
    }
  }
};

export default pdfService;