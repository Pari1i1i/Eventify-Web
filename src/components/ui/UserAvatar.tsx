import React from 'react';
import type { UserRole } from '../../types';

interface UserAvatarProps {
  name: string;
  role?: UserRole;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  role = 'customer',
  size = 'md',
  className = '',
}) => {
  // Extract initials (e.g., "Budi Admin" -> "BA", "Ahmad" -> "AH")
  const getInitials = (str: string) => {
    if (!str) return 'U';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  // Neobrutalist background colors based on role or name hash
  const bgColors = {
    admin: 'bg-neo-pink text-neo-dark',
    organizer: 'bg-neo-yellow text-neo-dark',
    customer: 'bg-neo-mint text-neo-dark',
  };

  const sizes = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={`rounded-xl border-2 border-neo-dark font-space font-extrabold shadow-neo-sm flex items-center justify-center shrink-0 uppercase select-none ${
        bgColors[role] || 'bg-neo-yellow text-neo-dark'
      } ${sizes[size]} ${className}`}
      title={`${name} (${role.toUpperCase()})`}
    >
      {initials}
    </div>
  );
};
