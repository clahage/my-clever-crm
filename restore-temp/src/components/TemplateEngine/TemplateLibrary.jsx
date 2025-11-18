import React from 'react';

const TemplateLibrary = ({ templates, onSelect }) => {
  return (
    <div className="space-y-4">
      {templates.map(t => (
        <div key={t.id} className="border rounded p-4 bg-white shadow flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-gray-800">{t.name}</h3>
              <div className="text-xs text-gray-500">{t.category} • {t.type}</div>
            </div>
            <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => onSelect(t)}>
              Preview
            </button>
          </div>
          <div className="text-xs text-gray-400">Last Modified: {t.lastModified}</div>
          <div className="flex gap-2 flex-wrap">
            {t.tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{tag}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateLibrary;
