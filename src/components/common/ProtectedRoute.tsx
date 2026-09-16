import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-neo-bg flex items-center justify-center">
        <div className="p-6 bg-neo-yellow rounded-2xl border-3 border-neo-dark shadow-neo text-center">
          <p className="font-space font-extrabold text-lg text-neo-dark animate-pulse">
            Memuat Hak Akses Admin...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
