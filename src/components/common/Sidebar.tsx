import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarCheck,
  Ticket,
  Wallet,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from './ConfirmModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    {
      label: 'Dashboard Overview',
      path: '/admin/dashboard',
      icon: <LayoutDashboard size={19} />,
    },
    {
      label: 'Manajemen Panitia',
      path: '/admin/organizers',
      icon: <Building2 size={19} />,
    },
    {
      label: 'Manajemen Akun',
      path: '/admin/users',
      icon: <Users size={19} />,
    },
    {
      label: 'Manajemen Event',
      path: '/admin/events',
      icon: <CalendarCheck size={19} />,
    },
    {
      label: 'Pendaftaran & Tiket',
      path: '/admin/tickets',
      icon: <Ticket size={19} />,
    },
    {
      label: 'Keuangan & Payout',
      path: '/admin/finance',
      icon: <Wallet size={19} />,
    },
    {
      label: 'Laporan',
      path: '/admin/reports',
      icon: <BarChart3 size={19} />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neo-dark/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 left-0 z-40 w-72 h-screen bg-neo-bg border-r-3 border-neo-dark transition-transform duration-300 flex flex-col justify-between p-4 lg:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="p-3 mb-5 bg-neo-yellow rounded-2xl border-3 border-neo-dark shadow-neo flex items-center justify-center">
            <img
              src="/eventify-logo.png"
              alt="Eventify Admin"
              className="h-9 object-contain drop-shadow-[1.5px_1.5px_0px_#2B2630]"
            />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pb-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl border-2.5 border-neo-dark font-space font-extrabold text-xs transition-all ${
                    isActive
                      ? 'bg-neo-mint shadow-neo text-neo-dark translate-x-1'
                      : 'bg-white hover:bg-neo-toska/60 text-neo-dark hover:shadow-neo-sm'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Logout Button */}
        <div className="mt-4 pt-2 shrink-0">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full py-3 px-4 bg-neo-pink text-neo-dark rounded-xl border-2.5 border-neo-dark shadow-neo-sm font-space font-extrabold text-xs uppercase hover:bg-red-300 transition-all cursor-pointer flex items-center justify-center gap-2.5"
          >
            <LogOut size={18} />
            <span>Keluar Akun Admin</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Dialog */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={logout}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari Web Admin Eventify?"
        confirmText="Ya, Logout"
        cancelText="Batal"
        variant="danger"
      />
    </>
  );
};
