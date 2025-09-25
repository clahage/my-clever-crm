import jsPDF from 'jspdf';

export const generateDisputePDF = (letterData) => {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set font settings
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // Page margins
    const leftMargin = 20;
    const rightMargin = 20;
    const topMargin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const maxWidth = pageWidth - leftMargin - rightMargin;
    
    let yPosition = topMargin;
    const lineHeight = 7;
    
    // Helper function to add text with automatic page breaks
    const addText = (text, fontSize = 11, fontStyle = 'normal', indent = 0) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      
      const lines = doc.splitTextToSize(text, maxWidth - indent);
      
      lines.forEach((line) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = topMargin;
        }
        
        doc.text(line, leftMargin + indent, yPosition);
        yPosition += lineHeight;
      });
    };
    
    // Format date
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Add date
    addText(today, 11, 'normal');
    yPosition += lineHeight;
    
    // Add client information
    if (letterData.clientName) {
      addText(letterData.clientName, 11, 'bold');
    }
    if (letterData.clientAddress) {
      addText(letterData.clientAddress);
    }
    if (letterData.clientEmail) {
      addText(letterData.clientEmail);
    }
    if (letterData.clientPhone) {
      addText(letterData.clientPhone);
    }
    yPosition += lineHeight * 2;
    
    // Add bureau information
    if (letterData.bureauInfo) {
      addText(letterData.bureauInfo.name, 11, 'bold');
      addText(letterData.bureauInfo.address);
      if (letterData.bureauInfo.phone) {
        addText(letterData.bureauInfo.phone);
      }
    } else {
      // Fallback bureau info based on bureauType
      const bureauDetails = {
        equifax: {
          name: 'Equifax',
          address: 'P.O. Box 740256, Atlanta, GA 30348'
        },
        experian: {
          name: 'Experian',
          address: 'P.O. Box 4500, Allen, TX 75013'
        },
        transunion: {
          name: 'TransUnion',
          address: 'P.O. Box 2000, Chester, PA 19016'
        }
      };
      
      if (letterData.bureauType && bureauDetails[letterData.bureauType]) {
        const bureau = bureauDetails[letterData.bureauType];
        addText(bureau.name, 11, 'bold');
        addText(bureau.address);
      }
    }
    yPosition += lineHeight * 2;
    
    // Add RE line
    addText('RE: Dispute of Inaccurate Information', 11, 'bold');
    
    // Add account details if available
    if (letterData.accountNumber) {
      addText(`Account Number: ${letterData.accountNumber}`);
    }
    if (letterData.creditorName) {
      addText(`Creditor: ${letterData.creditorName}`);
    }
    yPosition += lineHeight;
    
    // Add letter content
    if (letterData.letterContent) {
      // Split content by paragraphs
      const paragraphs = letterData.letterContent.split('\n\n');
      
      paragraphs.forEach((paragraph) => {
        if (paragraph.trim()) {
          // Handle special formatting for the RE line and headers
          if (paragraph.startsWith('RE:') || paragraph.startsWith('Dear')) {
            addText(paragraph, 11, 'bold');
          } else if (paragraph === 'Sincerely,' || paragraph === 'Respectfully,') {
            yPosition += lineHeight;
            addText(paragraph);
          } else if (paragraph === letterData.clientName && paragraphs.indexOf(paragraph) === paragraphs.length - 1) {
            // Signature line
            yPosition += lineHeight * 2;
            addText('_______________________________');
            addText(paragraph);
          } else {
            // Regular paragraph
            addText(paragraph);
          }
          yPosition += lineHeight / 2;
        }
      });
    } else {
      // Fallback content if letterContent is not provided
      addText('Dear Dispute Department,', 11, 'bold');
      yPosition += lineHeight;
      
      addText('I am writing to formally dispute inaccurate information appearing on my credit report.');
      yPosition += lineHeight;
      
      if (letterData.disputeReason) {
        const reasons = {
          'not_mine': 'This account does not belong to me.',
          'incorrect_balance': 'The balance reported is incorrect.',
          'incorrect_payment': 'The payment status is incorrectly reported.',
          'duplicate': 'This is a duplicate account entry.',
          'identity_theft': 'This account was opened fraudulently as a result of identity theft.',
          'closed': 'This account was closed by me but is still showing as open.',
          'paid_settlement': 'This account was paid as part of a settlement agreement.',
          'incorrect_dates': 'The dates associated with this account are incorrect.',
          'other': 'The information reported is inaccurate.'
        };
        
        const reasonText = reasons[letterData.disputeReason] || reasons['other'];
        addText(reasonText);
        yPosition += lineHeight;
      }
      
      addText('Under the Fair Credit Reporting Act, I have the right to dispute any inaccurate information on my credit report. Please investigate this matter and correct or delete the inaccurate information within 30 days.');
      yPosition += lineHeight;
      
      addText('Please send me written confirmation of your investigation results and any corrections made to my credit report.');
      yPosition += lineHeight * 2;
      
      addText('Sincerely,');
      yPosition += lineHeight * 3;
      
      addText('_______________________________');
      addText(letterData.clientName || 'Client Name');
    }
    
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
    
    // Generate filename
    const fileName = `Dispute_Letter_${letterData.bureauType || 'Bureau'}_${letterData.clientName || 'Client'}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save the PDF
    doc.save(fileName.replace(/[^a-z0-9_\-\.]/gi, '_'));
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Export function to generate batch PDFs
export const generateBatchPDFs = async (letters) => {
  try {
    const results = [];
    
    for (const letter of letters) {
      try {
        await generateDisputePDF(letter);
        results.push({ success: true, letterId: letter.id });
      } catch (error) {
        results.push({ success: false, letterId: letter.id, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error generating batch PDFs:', error);
    throw error;
  }
};

// Export function to preview PDF content without downloading
export const previewDisputePDF = (letterData) => {
  try {
    // Format date
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    let preview = '';
    
    // Add date
    preview += `${today}\n\n`;
    
    // Add client information
    if (letterData.clientName) {
      preview += `${letterData.clientName}\n`;
    }
    if (letterData.clientAddress) {
      preview += `${letterData.clientAddress}\n`;
    }
    if (letterData.clientEmail) {
      preview += `${letterData.clientEmail}\n`;
    }
    if (letterData.clientPhone) {
      preview += `${letterData.clientPhone}\n`;
    }
    preview += '\n';
    
    // Add bureau information
    if (letterData.bureauInfo) {
      preview += `${letterData.bureauInfo.name}\n`;
      preview += `${letterData.bureauInfo.address}\n`;
    }
    preview += '\n';
    
    // Add RE line
    preview += 'RE: Dispute of Inaccurate Information\n';
    
    // Add account details if available
    if (letterData.accountNumber) {
      preview += `Account Number: ${letterData.accountNumber}\n`;
    }
    if (letterData.creditorName) {
      preview += `Creditor: ${letterData.creditorName}\n`;
    }
    preview += '\n';
    
    // Add letter content
    if (letterData.letterContent) {
      preview += letterData.letterContent;
    } else {
      preview += 'Dear Dispute Department,\n\n';
      preview += 'I am writing to formally dispute inaccurate information appearing on my credit report.\n\n';
      preview += 'Under the Fair Credit Reporting Act, I have the right to dispute any inaccurate information on my credit report. Please investigate this matter and correct or delete the inaccurate information within 30 days.\n\n';
      preview += 'Please send me written confirmation of your investigation results and any corrections made to my credit report.\n\n';
      preview += 'Sincerely,\n\n\n';
      preview += '_______________________________\n';
      preview += letterData.clientName || 'Client Name';
    }
    
    return preview;
  } catch (error) {
    console.error('Error generating preview:', error);
    throw error;
  }
};

// Export function to generate email-ready version of letter
export const generateEmailContent = (letterData) => {
  try {
    let emailContent = '';
    
    // Format date
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Build email content
    emailContent += `Date: ${today}\n\n`;
    emailContent += `From: ${letterData.clientName || 'Client'}\n`;
    
    if (letterData.clientEmail) {
      emailContent += `Email: ${letterData.clientEmail}\n`;
    }
    if (letterData.clientPhone) {
      emailContent += `Phone: ${letterData.clientPhone}\n`;
    }
    if (letterData.clientAddress) {
      emailContent += `Address: ${letterData.clientAddress}\n`;
    }
    emailContent += '\n';
    
    // Add bureau information
    const bureauDetails = {
      equifax: {
        name: 'Equifax',
        email: 'disputes@equifax.com',
        address: 'P.O. Box 740256, Atlanta, GA 30348'
      },
      experian: {
        name: 'Experian',
        email: 'disputes@experian.com',
        address: 'P.O. Box 4500, Allen, TX 75013'
      },
      transunion: {
        name: 'TransUnion',
        email: 'disputes@transunion.com',
        address: 'P.O. Box 2000, Chester, PA 19016'
      }
    };
    
    const bureau = bureauDetails[letterData.bureauType] || bureauDetails.equifax;
    emailContent += `To: ${bureau.name}\n`;
    emailContent += `${bureau.address}\n\n`;
    emailContent += '---\n\n';
    
    // Add subject line
    emailContent += `Subject: Dispute of Inaccurate Information - ${letterData.clientName}\n\n`;
    
    // Add letter content
    if (letterData.letterContent) {
      emailContent += letterData.letterContent;
    } else {
      emailContent += `Dear ${bureau.name} Dispute Department,\n\n`;
      emailContent += 'I am writing to formally dispute inaccurate information appearing on my credit report.\n\n';
      
      if (letterData.accountNumber) {
        emailContent += `Account Number: ${letterData.accountNumber}\n`;
      }
      if (letterData.creditorName) {
        emailContent += `Creditor: ${letterData.creditorName}\n\n`;
      }
      
      if (letterData.disputeReason) {
        const reasons = {
          'not_mine': 'This account does not belong to me.',
          'incorrect_balance': 'The balance reported is incorrect.',
          'incorrect_payment': 'The payment status is incorrectly reported.',
          'duplicate': 'This is a duplicate account entry.',
          'identity_theft': 'This account was opened fraudulently as a result of identity theft.',
          'closed': 'This account was closed by me but is still showing as open.',
          'paid_settlement': 'This account was paid as part of a settlement agreement.',
          'incorrect_dates': 'The dates associated with this account are incorrect.',
          'other': 'The information reported is inaccurate.'
        };
        
        const reasonText = reasons[letterData.disputeReason] || reasons['other'];
        emailContent += `${reasonText}\n\n`;
      }
      
      emailContent += 'Under the Fair Credit Reporting Act, I have the right to dispute any inaccurate information on my credit report. Please investigate this matter and correct or delete the inaccurate information within 30 days.\n\n';
      emailContent += 'Please send me written confirmation of your investigation results and any corrections made to my credit report.\n\n';
      emailContent += 'Sincerely,\n\n';
      emailContent += letterData.clientName || 'Client Name';
    }
    
    return {
      subject: `Dispute of Inaccurate Information - ${letterData.clientName}`,
      body: emailContent,
      recipientEmail: bureau.email,
      recipientName: bureau.name
    };
  } catch (error) {
    console.error('Error generating email content:', error);
    throw error;
  }
};

// Default export for convenience
const pdfService = {
  generateDisputePDF,
  generateBatchPDFs,
  previewDisputePDF,
  generateEmailContent
};

export default pdfService;