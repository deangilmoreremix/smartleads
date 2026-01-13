import { useState, InputHTMLAttributes } from 'react';
import { Check, X } from 'lucide-react';

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
}

export function AnimatedInput({
  label,
  error,
  success,
  icon,
  className = '',
  ...props
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    props.onChange?.(e);
  };

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          {...props}
          onChange={handleChange}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            peer w-full px-4 py-3 ${icon ? 'pl-10' : ''} ${success || error ? 'pr-10' : ''}
            rounded-lg border-2 transition-all duration-200
            ${error ? 'border-red-500' : success ? 'border-green-500' : 'border-gray-200'}
            ${isFocused ? 'border-blue-500 shadow-lg shadow-blue-100' : ''}
            focus:outline-none
            ${className}
          `}
        />

        <label
          className={`
            absolute left-4 transition-all duration-200 pointer-events-none
            ${icon ? 'left-10' : ''}
            ${isFocused || hasValue
              ? '-top-2 text-xs bg-white px-1'
              : 'top-1/2 -translate-y-1/2 text-base'
            }
            ${error ? 'text-red-500' : isFocused ? 'text-blue-500' : 'text-gray-500'}
          `}
        >
          {label}
        </label>

        {success && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white animate-in zoom-in">
              <Check className="w-4 h-4" />
            </div>
          </div>
        )}

        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white animate-in zoom-in">
              <X className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-500 animate-in slide-in-from-top-1 fade-in">
          {error}
        </p>
      )}
    </div>
  );
}
