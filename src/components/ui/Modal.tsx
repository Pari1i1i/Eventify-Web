import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neo-dark/60 backdrop-blur-sm animate-fadeIn">
      {/* Light Dismiss Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div
        className={`relative w-full ${widthClasses[maxWidth]} bg-white rounded-2xl border-3 border-neo-dark shadow-neo-xl overflow-hidden z-10`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-neo-yellow border-b-3 border-neo-dark">
          <h3 className="font-space font-extrabold text-lg text-neo-dark uppercase tracking-wide flex items-center gap-2">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg border-2 border-neo-dark bg-white hover:bg-neo-pink text-neo-dark transition-all cursor-pointer shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5"
            aria-label="Tutup Dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto font-jakarta">
          {children}
        </div>
      </div>
    </div>
  );
};
