import React from 'react';
import { 
  DocumentIcon, 
  ChatBubbleLeftIcon, 
  UserGroupIcon,
  ChartBarIcon,
  FolderOpenIcon 
} from '@heroicons/react/24/outline';

export const EmptyDocuments = () => (
  <div className="text-center py-12">
    <FolderOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No documents yet
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      Upload your first document to get started
    </p>
  </div>
);

export const EmptyMessages = () => (
  <div className="text-center py-12">
    <ChatBubbleLeftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No messages yet
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      Start a conversation with your credit specialist
    </p>
  </div>
);

export const EmptyClients = () => (
  <div className="text-center py-12">
    <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No clients found
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      Add your first client to begin
    </p>
  </div>
);

export const EmptyScores = () => (
  <div className="text-center py-12">
    <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No credit scores recorded
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      Scores will appear here once added
    </p>
  </div>
);
