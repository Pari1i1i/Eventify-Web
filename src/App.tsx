import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SystemProvider } from './context/SystemContext';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// 10 Modules Pages
import { DashboardOverviewPage } from './pages/DashboardOverviewPage';
import { OrganizerManagementPage } from './pages/OrganizerManagementPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { EventManagementPage } from './pages/EventManagementPage';
import { ParticipantTicketPage } from './pages/ParticipantTicketPage';
import { FinancePaymentPage } from './pages/FinancePaymentPage';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage';
import { NotificationBroadcastPage } from './pages/NotificationBroadcastPage';
import { SecurityAuditPage } from './pages/SecurityAuditPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SystemProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                
                {/* 1. Dashboard */}
                <Route path="dashboard" element={<DashboardOverviewPage />} />
                
                {/* 2. Manajemen Panitia */}
                <Route path="organizers" element={<OrganizerManagementPage />} />
                
                {/* 3. Manajemen User & Peserta */}
                <Route path="users" element={<UserManagementPage />} />
                
                {/* 4. Manajemen Event & Approval */}
                <Route path="events" element={<EventManagementPage />} />
                
                {/* 5. Pendaftaran & Tiket */}
                <Route path="tickets" element={<ParticipantTicketPage />} />
                
                {/* 6. Keuangan & Pembayaran */}
                <Route path="finance" element={<FinancePaymentPage />} />
                
                {/* 7. Laporan & Analitik */}
                <Route path="reports" element={<ReportsAnalyticsPage />} />
                
                {/* 8. Notifikasi & Komunikasi */}
                <Route path="notifications" element={<NotificationBroadcastPage />} />
                
                {/* 9. Hak Akses & Keamanan */}
                <Route path="security" element={<SecurityAuditPage />} />
                
                {/* 10. Pengaturan Sistem */}
                <Route path="settings" element={<SystemSettingsPage />} />
                <Route path="maintenance" element={<Navigate to="/admin/settings" replace />} />
              </Route>
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </SystemProvider>
    </AuthProvider>
  );
};

export default App;
