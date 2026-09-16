import React from 'react';

interface BadgeProps {
  variant?: 'yellow' | 'mint' | 'pink' | 'toska' | 'orange' | 'purple' | 'gray' | 'danger';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'yellow',
  children,
  className = '',
  icon,
}) => {
  const variants = {
    yellow: 'bg-neo-yellow text-neo-dark',
    mint: 'bg-neo-mint text-neo-dark',
    pink: 'bg-neo-pink text-neo-dark',
    toska: 'bg-neo-toska text-neo-dark',
    orange: 'bg-neo-orange text-neo-dark',
    purple: 'bg-neo-purple text-neo-dark',
    gray: 'bg-neo-gray text-neo-dark',
    danger: 'bg-red-400 text-white',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border-2 border-neo-dark font-space font-extrabold text-xs uppercase tracking-wider shadow-neo-sm ${variants[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
