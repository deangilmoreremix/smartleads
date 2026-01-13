import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Action {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: string;
}

interface FloatingActionButtonProps {
  actions: Action[];
}

export function FloatingActionButton({ actions }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 mb-2">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-center gap-3 animate-in slide-in-from-bottom-4 fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="bg-gray-900 text-white text-sm py-1 px-3 rounded-lg shadow-lg whitespace-nowrap">
                {action.label}
              </span>
              <button
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className={`w-12 h-12 rounded-full shadow-lg ${
                  action.color || 'bg-blue-600'
                } text-white flex items-center justify-center hover:scale-110 transition-transform`}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </div>
  );
}
