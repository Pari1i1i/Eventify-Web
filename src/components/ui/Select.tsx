import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="font-space font-extrabold text-xs uppercase tracking-wider text-neo-dark">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-4 py-2.5 rounded-lg border-2.5 border-neo-dark bg-white font-jakarta text-neo-dark focus:outline-none focus:ring-2 focus:ring-neo-yellow focus:shadow-neo transition-all cursor-pointer ${
          error ? 'border-red-500 bg-red-50' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-xs font-bold text-red-600 font-jakarta">
          {error}
        </span>
      )}
    </div>
  );
};
