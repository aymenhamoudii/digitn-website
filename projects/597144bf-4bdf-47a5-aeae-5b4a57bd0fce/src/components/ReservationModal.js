import React from 'react';
import { FaTimes } from 'react-icons/fa';

const ReservationModal = ({ content, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-lg w-full max-w-md p-6 shadow-lg">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-700"
          aria-label="Close modal"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        <div className="text-center">
          <h3 className="text-2xl font-display text-neutral-900 mb-4">
            {content.title}
          </h3>
          <p className="text-neutral-600 mb-6">
            {content.message}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={content.ctaAction}
              className="bg-primary-500 text-white px-6 py-2 rounded-md hover:bg-primary-600 transition-colors w-full"
            >
              {content.ctaText}
            </button>
            <button
              onClick={content.secondaryAction}
              className="border border-neutral-300 text-neutral-700 px-6 py-2 rounded-md hover:bg-neutral-50 transition-colors w-full"
            >
              {content.secondaryText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;