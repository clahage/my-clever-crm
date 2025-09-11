// scr-admin-vite/src/components/ui/Modal.jsx
import React from 'react';
import { MdClose } from 'react-icons/md'; // Import a close icon

// Modal component expects isOpen (boolean), onClose (function), and children (content)
function Modal({ isOpen, onClose, children, title = "Modal Title", size = "md" }) {
  if (!isOpen) return null; // Don't render if not open

  const modalSizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl', // For larger forms like Contacts
  };

  return (
    // Overlay for the modal
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose} // Close modal when clicking outside
    >
      {/* Modal content area */}
      <div
        className={`bg-speedy-dark-neutral-50 dark:bg-speedy-dark-neutral-800 rounded-lg shadow-xl p-6 relative w-full ${modalSizeClass[size] || modalSizeClass.md} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-speedy-dark-neutral-200 dark:border-speedy-dark-neutral-700">
          <h3 className="text-xl font-semibold text-speedy-dark-neutral-700 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-speedy-dark-neutral-500 hover:text-speedy-dark-neutral-700 dark:text-speedy-dark-neutral-300 dark:hover:text-speedy-dark-neutral-100 transition-colors"
            aria-label="Close modal"
          >
            <MdClose className="text-2xl" /> {/* Close icon */}
          </button>
        </div>
        {/* Modal Body */}
        {children}
      </div>
    </div>
  );
}

export default Modal;