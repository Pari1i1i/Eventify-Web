import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../ui/UserAvatar';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  return (
    <>
      <header className="sticky top-0 z-30 bg-neo-bg/90 backdrop-blur-md border-b-3 border-neo-dark px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left Section: Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 bg-white rounded-xl border-2.5 border-neo-dark shadow-neo-sm lg:hidden hover:bg-neo-yellow cursor-pointer"
            aria-label="Buka Menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Right Section: Admin User */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-white rounded-xl border-2.5 border-neo-dark shadow-neo-sm">
            <UserAvatar name={user?.name || 'Administrator'} role="admin" size="sm" />
            <div className="text-left">
              <p className="font-space font-extrabold text-xs text-neo-dark leading-tight">
                {user?.name || 'Administrator'}
              </p>
              <span className="font-space font-extrabold text-[9px] uppercase text-emerald-800 tracking-wider block">
                ADMINISTRATOR
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
