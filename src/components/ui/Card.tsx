import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  bgColor?: string;
  shadow?: 'neo' | 'neo-lg' | 'neo-sm' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  bgColor = 'bg-white',
  shadow = 'neo',
}) => {
  const shadowClass = shadow !== 'none' ? `shadow-${shadow}` : '';
  return (
    <div
      className={`${bgColor} rounded-xl border-3 border-neo-dark ${shadowClass} p-5 ${className}`}
    >
      {children}
    </div>
  );
};
