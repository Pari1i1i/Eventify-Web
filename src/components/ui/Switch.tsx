import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label className={`inline-flex items-center gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={`relative w-16 h-9 rounded-full border-2.5 border-neo-dark transition-colors duration-200 ease-in-out shadow-neo-sm ${
          checked ? 'bg-neo-pink' : 'bg-neo-mint'
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-6 h-6 rounded-full border-2 border-neo-dark bg-white transform transition-transform duration-200 ease-in-out shadow-sm flex items-center justify-center font-extrabold text-[10px] ${
            checked ? 'translate-x-7 text-neo-dark' : 'translate-x-0 text-neo-dark'
          }`}
        >
          {checked ? 'OFF' : 'ON'}
        </div>
      </div>
      {label && (
        <span className="font-space font-extrabold text-xs uppercase tracking-wider text-neo-dark">
          {label}
        </span>
      )}
    </label>
  );
};
