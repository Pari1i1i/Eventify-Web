import React from 'react';
import { Card } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  badgeText?: string;
  color?: 'yellow' | 'mint' | 'pink' | 'toska';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badgeText,
  color = 'yellow',
}) => {
  const bgClasses = {
    yellow: 'bg-neo-yellow/20 border-neo-dark',
    mint: 'bg-neo-mint/20 border-neo-dark',
    pink: 'bg-neo-pink/20 border-neo-dark',
    toska: 'bg-neo-toska/20 border-neo-dark',
  };

  const tagBgClasses = {
    yellow: 'bg-amber-100 text-amber-900 border-amber-300',
    mint: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    pink: 'bg-rose-100 text-rose-900 border-rose-300',
    toska: 'bg-teal-100 text-teal-900 border-teal-300',
  };

  return (
    <Card className={`${bgClasses[color]} border-3 transition-transform hover:-translate-y-1 h-full flex flex-col justify-between min-h-[145px]`}>
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 bg-white rounded-xl border-2 border-neo-dark shadow-neo-sm text-neo-dark">
            {icon}
          </div>
          {badgeText && (
            <span className={`px-2 py-0.5 rounded-md border text-[10px] font-space font-bold uppercase tracking-wider ${tagBgClasses[color]}`}>
              {badgeText}
            </span>
          )}
        </div>

        <p className="font-space font-extrabold text-xs text-neo-dark uppercase tracking-wider">
          {title}
        </p>
        <p className="font-space font-black text-2xl text-neo-dark my-1 truncate">
          {value}
        </p>
      </div>
      <div>
        {subtitle ? (
          <p className="font-jakarta font-semibold text-[11px] text-gray-600 truncate">
            {subtitle}
          </p>
        ) : (
          <div className="h-4" />
        )}
      </div>
    </Card>
  );
};
