import React from 'react';

const VariableManager = ({ variables, sampleData, onSampleChange }) => {
  return (
    <div className="mb-4">
      <h3 className="font-semibold mb-2">Template Variables</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variables.map(v => (
          <div key={v} className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">{v}</label>
            <input
              className="border px-2 py-1 rounded text-sm"
              value={sampleData[v.replace(/[{}]/g,"")] || ""}
              onChange={e => onSampleChange(v.replace(/[{}]/g,""), e.target.value)}
              placeholder={`Sample value for ${v}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VariableManager;
