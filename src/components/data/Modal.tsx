import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-green-50 bg-opacity-50 overflow-y-auto py-4">
      <div className="bg-white rounded-xl shadow-2xl p-0 sm:p-0 relative w-auto max-w-5xl mx-4 my-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-green-700 hover:text-green-900 text-2xl font-bold z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center"
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="max-h-[calc(90vh-2rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
