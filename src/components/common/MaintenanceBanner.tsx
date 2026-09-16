import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

export const MaintenanceBanner: React.FC = () => {
  const { config } = useSystem();
  const navigate = useNavigate();

  if (!config.maintenance_mode) return null;

  return (
    <div className="bg-neo-pink text-neo-dark border-b-3 border-neo-dark px-4 py-3 shadow-neo flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-neo-dark text-neo-yellow rounded-xl border-2 border-neo-dark shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h4 className="font-space font-extrabold text-sm uppercase tracking-wide flex items-center gap-2">
            ⚠️ SAKLAR PEMELIHARAAN AKTIF: APLIKASI MOBILE SEDANG DIKUNCI!
          </h4>
          <p className="font-jakarta text-xs font-semibold opacity-90 line-clamp-1">
            Pesan Peserta: "{config.maintenance_message}"
          </p>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        icon={<ShieldAlert size={16} />}
        onClick={() => navigate('/admin/maintenance')}
      >
        Atur Mode Pemeliharaan
      </Button>
    </div>
  );
};
