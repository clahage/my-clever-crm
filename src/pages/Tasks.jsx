import React from 'react';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';

const Tasks = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <CheckSquare className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Tasks</h1>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-600">Task management coming soon</p>
          <p className="text-sm text-gray-400 mt-2">This feature is under development</p>
        </div>
      </div>
    </div>
  );
};

export default Tasks;