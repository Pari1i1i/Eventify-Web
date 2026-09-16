import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'mint' | 'orange' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  isLoading = false,
  ...props
}) => {
  const baseClasses = 'font-space font-bold rounded-xl border-2.5 border-neo-dark shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_#2B2630] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-neo cursor-pointer inline-flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-neo-yellow text-neo-dark hover:bg-yellow-300',
    secondary: 'bg-white text-neo-dark hover:bg-neo-gray',
    danger: 'bg-neo-pink text-neo-dark hover:bg-pink-300',
    mint: 'bg-neo-mint text-neo-dark hover:bg-emerald-200',
    orange: 'bg-neo-orange text-neo-dark hover:bg-orange-300',
    outline: 'bg-transparent text-neo-dark border-neo-dark hover:bg-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin text-neo-dark" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
