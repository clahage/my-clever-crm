export const parsePDF = async (file) => {
  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
    });
    
    const response = await fetch('/api/parse-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pdfBase64: base64 })
    });
    
    if (!response.ok) throw new Error('PDF parsing failed');
    return await response.json();
  } catch (error) {
    console.error('PDF parsing error:', error);
    return { success: false, scores: [], error: error.message };
  }
};