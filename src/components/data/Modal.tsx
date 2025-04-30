import React from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
      <div className="bg-white rounded-xl shadow-2xl p-0 sm:p-0 relative w-auto max-w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-green-700 hover:text-green-900 text-2xl font-bold"
          aria-label="Cerrar"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
