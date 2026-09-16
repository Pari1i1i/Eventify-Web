import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="font-space font-extrabold text-xs uppercase tracking-wider text-neo-dark flex items-center gap-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-neo-dark pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full ${icon ? 'pl-10' : 'px-4'} py-2.5 rounded-lg border-2.5 border-neo-dark bg-white font-jakarta text-neo-dark focus:outline-none focus:ring-2 focus:ring-neo-yellow focus:shadow-neo transition-all placeholder:text-gray-400 ${
            error ? 'border-red-500 bg-red-50' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs font-bold text-red-600 font-jakarta flex items-center gap-1">
          ⚠️ {error}
        </span>
      )}
    </div>
  );
};
