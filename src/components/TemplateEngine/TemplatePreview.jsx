import React from 'react';

// Simple variable substitution for preview
const substituteVariables = (content, sampleData) => {
  let result = content;
  Object.entries(sampleData).forEach(([key, value]) => {
    result = result.replaceAll(`{${key}}`, value);
  });
  return result;
};

const TemplatePreview = ({ template, sampleData }) => {
  if (!template) return <div className="italic text-gray-400">Select a template to preview.</div>;
  return (
    <div className="border rounded p-4 bg-gray-50">
      <h2 className="font-bold text-lg mb-2">Preview: {template.name}</h2>
      <pre className="bg-white p-3 rounded text-sm whitespace-pre-wrap">{substituteVariables(template.content, sampleData)}</pre>
    </div>
  );
};

export default TemplatePreview;
