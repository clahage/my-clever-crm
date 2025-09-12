// scr-admin-vite/src/components/DocumentEditor.jsx
import React, { useState } from 'react';
import Card from './ui/card'; // Relative path
import Button from './ui/button'; // Relative path

function DocumentEditor({ templateName, initialContent, onSave }) {
  const [content, setContent] = useState(initialContent || `
    <h2>${templateName || 'New Document Template'}</h2>
    <p>This is a placeholder for your editable document content.</p>
    <p>You can customize terms, add client-specific details, and manage legal clauses here.</p>
    <p><strong>Client Name:</strong> [CLIENT_NAME_PLACEHOLDER]</p>
    <p><strong>Date:</strong> [DATE_PLACEHOLDER]</p>
    <p>Future integration with a rich text editor (like TinyMCE or Quill) or a form builder will allow dynamic fields and advanced formatting.</p>
  `);

  const handleSave = () => {
    if (onSave) {
      onSave(templateName, content);
      alert(`Template "${templateName}" saved! (Placeholder action)`); // Using alert for now, will replace with custom modal later
    }
  };

  return (
    <Card className="p-6 flex flex-col h-full">
      <h3 className="text-xl font-semibold mb-4">Edit Document Template: {templateName}</h3>
      <textarea
        className="flex-1 w-full p-3 border border-gray-300 rounded-md mb-4 resize-y min-h-[300px]
                   dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing your document template here..."
      ></textarea>
      <Button onClick={handleSave} className="self-end">Save Template</Button>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
        Note: This is a basic text area. A full rich-text editor will be integrated later for advanced formatting and dynamic field insertion.
      </p>
    </Card>
  );
}

export default DocumentEditor;