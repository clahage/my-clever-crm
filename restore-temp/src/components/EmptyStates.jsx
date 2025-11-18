import React from 'react';
import {
  DocumentIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  ChartBarIcon,
  FolderOpenIcon,
  ExclamationCircleIcon,
  UserPlusIcon,
  BanknotesIcon,
  CheckCircleIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon
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

export const EmptyDisputes = ({ onCreateDispute }) => (
  <div className="text-center py-12">
    <ExclamationCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No active disputes
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      Create your first dispute to start improving credit scores
    </p>
    {onCreateDispute && (
      <button
        onClick={onCreateDispute}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <DocumentTextIcon className="h-5 w-5 mr-2" />
        Create Dispute
      </button>
    )}
  </div>
);

export const EmptyLeads = ({ onAddLead }) => (
  <div className="text-center py-12">
    <UserPlusIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No leads yet
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      Start adding leads to grow your business
    </p>
    {onAddLead && (
      <button
        onClick={onAddLead}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <UserPlusIcon className="h-5 w-5 mr-2" />
        Add Lead
      </button>
    )}
  </div>
);

export const EmptyInvoices = ({ onCreateInvoice }) => (
  <div className="text-center py-12">
    <BanknotesIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No invoices found
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      Create your first invoice to start billing clients
    </p>
    {onCreateInvoice && (
      <button
        onClick={onCreateInvoice}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <BanknotesIcon className="h-5 w-5 mr-2" />
        Create Invoice
      </button>
    )}
  </div>
);

export const EmptyTasks = ({ onCreateTask }) => (
  <div className="text-center py-12">
    <CheckCircleIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No tasks assigned
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      Create a task to get started with your workflow
    </p>
    {onCreateTask && (
      <button
        onClick={onCreateTask}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <CheckCircleIcon className="h-5 w-5 mr-2" />
        Add Task
      </button>
    )}
  </div>
);

export const EmptyAppointments = ({ onScheduleAppointment }) => (
  <div className="text-center py-12">
    <CalendarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No appointments scheduled
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      Schedule your first appointment with a client
    </p>
    {onScheduleAppointment && (
      <button
        onClick={onScheduleAppointment}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <CalendarIcon className="h-5 w-5 mr-2" />
        Schedule Appointment
      </button>
    )}
  </div>
);

export const EmptyReports = () => (
  <div className="text-center py-12">
    <ClipboardDocumentListIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No credit reports available
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      Credit reports will appear here once uploaded or imported
    </p>
  </div>
);

export const EmptyActivities = () => (
  <div className="text-center py-12">
    <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No recent activity
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      Your recent activity will be displayed here
    </p>
  </div>
);

export const EmptyContacts = ({ onAddContact }) => (
  <div className="text-center py-12">
    <UserGroupIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No contacts found
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-4">
      Start building your contact list
    </p>
    {onAddContact && (
      <button
        onClick={onAddContact}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <UserPlusIcon className="h-5 w-5 mr-2" />
        Add Contact
      </button>
    )}
  </div>
);
