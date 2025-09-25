import React from 'react';
import MessageThread from '../../components/MessageThread';

const ClientMessages = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Messages
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Communicate with your credit repair specialist
      </p>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg" style={{ height: '600px' }}>
        <div className="flex flex-col h-full">
          <div className="flex-1 p-6 overflow-y-auto">
            <MessageThread />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMessages;
