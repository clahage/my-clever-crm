import React, { useState } from 'react';

// Simple rich text editor (can be replaced with a full-featured editor later)
const TemplateEditor = ({ value, onChange }) => {
  return (
    <textarea
      className="w-full h-64 p-3 border rounded resize-none font-mono text-sm"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Write your template here... Use {variables} for dynamic fields."
    />
  );
};

export default TemplateEditor;
