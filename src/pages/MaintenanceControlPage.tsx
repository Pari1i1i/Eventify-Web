import React, { useState } from 'react';
import {
  ShieldAlert,
  Smartphone,
  MessageSquare,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { useSystem } from '../context/SystemContext';
import { Card } from '../components/ui/Card';
import { Switch } from '../components/ui/Switch';
import { Button } from '../components/ui/Button';

export const MaintenanceControlPage: React.FC = () => {
  const { config, toggleMaintenanceMode, updateMaintenanceMessage } = useSystem();
  const [messageInput, setMessageInput] = useState(config.maintenance_message);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateMaintenanceMessage(messageInput);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed saving message', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-jakarta">
      {/* Page Header */}
      <div>
        <h1 className="font-space font-extrabold text-2xl lg:text-3xl text-neo-dark tracking-tight flex items-center gap-3">
          <ShieldAlert size={32} className="text-neo-pink" /> SAKLAR PEMELIHARAAN APLIKASI MOBILE
        </h1>
        <p className="font-jakarta text-xs font-semibold text-gray-600 mt-1">
          Kontrol darurat Maintenance Mode untuk mengunci / membuka akses aplikasi mobile Eventify
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Toggle Switch & Maintenance Message Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Switch Card */}
          <Card
            bgColor={config.maintenance_mode ? 'bg-neo-pink/30' : 'bg-neo-mint/30'}
            shadow="neo-lg"
            className="border-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-space font-extrabold text-xs uppercase tracking-wider text-neo-dark">
                  STATUS INTEGRASI APLIKASI MOBILE
                </span>
                <h3 className="font-space font-extrabold text-2xl text-neo-dark mt-1 flex items-center gap-2">
                  {config.maintenance_mode ? (
                    <>
                      <Lock size={26} className="text-neo-dark" /> MODE MAINTENANCE (KUNCI)
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={26} className="text-emerald-700" /> STATUS ONLINE (NORMAL)
                    </>
                  )}
                </h3>
                <p className="font-jakarta text-xs font-semibold text-gray-700 mt-1">
                  {config.maintenance_mode
                    ? 'Aplikasi mobile peserta sedang dikunci. Pembelian tiket dan login mobile ditutup sementara.'
                    : 'Aplikasi mobile beroperasi secara normal. Peserta dapat memesan tiket dan presensi QR.'}
                </p>
              </div>

              <div className="shrink-0 pt-2 sm:pt-0">
                <Switch
                  checked={config.maintenance_mode}
                  onChange={toggleMaintenanceMode}
                />
              </div>
            </div>
          </Card>

          {/* Maintenance Message Form Card */}
          <Card className="shadow-neo-lg space-y-4">
            <h3 className="font-space font-extrabold text-lg text-neo-dark uppercase flex items-center gap-2">
              <MessageSquare size={20} /> Pengaturan Pesan Pemeliharaan (Mobile User Message)
            </h3>
            <p className="font-jakarta text-xs text-gray-600 font-semibold">
              Tuliskan pesan yang akan ditampilkan secara langsung di layar smartphone peserta ketika Mode Maintenance aktif:
            </p>

            <form onSubmit={handleSaveMessage} className="space-y-4">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                rows={4}
                className="w-full p-4 rounded-xl border-2.5 border-neo-dark font-jakarta text-sm text-neo-dark focus:outline-none focus:ring-2 focus:ring-neo-yellow focus:shadow-neo transition-all bg-white"
                placeholder="Tuliskan alasan pemeliharaan server..."
                required
              />

              {saveSuccess && (
                <div className="p-3 bg-neo-mint text-neo-dark rounded-xl border-2 border-neo-dark font-jakarta text-xs font-extrabold flex items-center gap-2">
                  <CheckCircle2 size={18} /> Pesan pemeliharaan berhasil diperbarui!
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                icon={<Save size={18} />}
                isLoading={isSaving}
              >
                Simpan Pesan Pemeliharaan
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Live Interactive Mobile Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-xs bg-neo-dark p-4 rounded-[40px] border-4 border-neo-dark shadow-neo-xl">
            {/* Phone Mockup Header Frame */}
            <div className="w-24 h-4 bg-black mx-auto rounded-full mb-3 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gray-800" />
            </div>

            {/* Mobile Screen Inner Canvas */}
            <div className="bg-neo-bg rounded-[28px] border-2 border-neo-dark p-5 min-h-[460px] flex flex-col justify-between text-center relative overflow-hidden font-jakarta">
              {/* Screen Top Status Bar */}
              <div className="flex items-center justify-between text-[10px] font-space font-extrabold text-neo-dark opacity-70">
                <span>09:41</span>
                <span>5G 🔋 100%</span>
              </div>

              {/* Dynamic Content based on Maintenance Mode */}
              {config.maintenance_mode ? (
                <div className="my-auto space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-neo-pink rounded-2xl border-3 border-neo-dark shadow-neo mx-auto flex items-center justify-center text-neo-dark">
                    <AlertTriangle size={32} />
                  </div>
                  <h4 className="font-space font-extrabold text-lg text-neo-dark uppercase tracking-tight">
                    Sistem Pemeliharaan
                  </h4>
                  <div className="p-3 bg-white rounded-xl border-2 border-neo-dark shadow-neo-sm text-left">
                    <p className="font-jakarta text-xs font-semibold text-gray-700 leading-relaxed">
                      "{config.maintenance_message}"
                    </p>
                  </div>
                  <span className="inline-block font-space font-extrabold text-[10px] uppercase bg-neo-yellow px-3 py-1 rounded border border-neo-dark text-neo-dark">
                    🔒 Fitur Mobile Ditolak
                  </span>
                </div>
              ) : (
                <div className="my-auto space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-neo-mint rounded-2xl border-3 border-neo-dark shadow-neo mx-auto flex items-center justify-center text-neo-dark">
                    <Smartphone size={32} />
                  </div>
                  <h4 className="font-space font-extrabold text-lg text-neo-dark uppercase tracking-tight">
                    Eventify Mobile Online
                  </h4>
                  <div className="p-3 bg-white rounded-xl border-2 border-neo-dark shadow-neo-sm text-left">
                    <p className="font-jakarta text-xs font-semibold text-gray-700 leading-relaxed">
                      Selamat Datang! Temukan event & beli tiket impian Anda sekarang.
                    </p>
                  </div>
                  <span className="inline-block font-space font-extrabold text-[10px] uppercase bg-neo-mint px-3 py-1 rounded border border-neo-dark text-neo-dark">
                    ✅ Aplikasi Berjalan Normal
                  </span>
                </div>
              )}

              {/* Screen Bottom Bar */}
              <div className="w-20 h-1 bg-neo-dark rounded-full mx-auto" />
            </div>
          </div>
          <span className="font-space font-extrabold text-xs text-neo-dark uppercase mt-3 tracking-wider">
            📱 Live Preview Layar Mobile Peserta
          </span>
        </div>
      </div>
    </div>
  );
};
