import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeColors = {
    danger: 'from-red-500 to-red-600',
    warning: 'from-amber-400 to-orange-500',
    info: 'from-amber-400 to-orange-500'
  };

  const typeIconColors = {
    danger: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-orange-500'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="max-w-md w-full bg-white border border-amber-200 rounded-2xl shadow-2xl">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${typeColors[type]} opacity-20 rounded-xl flex items-center justify-center`}>
                <AlertTriangle className={`w-6 h-6 ${typeIconColors[type]}`} />
              </div>
              <h3 className="text-xl font-bold text-stone-800">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-stone-600 mb-6">{message}</p>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-3 rounded-lg font-medium transition border border-stone-200"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 bg-gradient-to-r ${typeColors[type]} text-white px-4 py-3 rounded-lg font-medium hover:shadow-lg transition`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
