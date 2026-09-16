import React, { useState, useEffect } from 'react';
import { eventifyApi } from '../services/api';
import type { StaticPage } from '../types';
import { useSystem } from '../context/SystemContext';
import {
  Settings,
  ShieldAlert,
  Globe,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';

export const SystemSettingsPage: React.FC = () => {
  const { config, toggleMaintenanceMode, updateMaintenanceMessage } = useSystem();
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [activeTab, setActiveTab] = useState<'identity' | 'pages' | 'smtp' | 'maintenance'>('identity');

  // Form states
  const [platformName, setPlatformName] = useState('');
  const [platformLogo, setPlatformLogo] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [refundPolicy, setRefundPolicy] = useState('');
  const [maintMsg, setMaintMsg] = useState('');

  // SMTP Form
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpFromEmail, setSmtpFromEmail] = useState('');

  // Page Editor Modal
  const [selectedPage, setSelectedPage] = useState<StaticPage | null>(null);
  const [pageContent, setPageContent] = useState('');
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cfgData, pageData] = await Promise.all([
        eventifyApi.getSystemConfig(),
        eventifyApi.getStaticPages(),
      ]);
      setPages(pageData);
      setPlatformName(cfgData.platform_name || 'Eventify Indonesia');
      setPlatformLogo(cfgData.platform_logo_url || '/eventify-logo.png');
      setSupportEmail(cfgData.support_email || 'support@eventify.id');
      setSupportPhone(cfgData.support_phone || '+62 812-9988-7766');
      setRefundPolicy(cfgData.refund_policy_text || '');
      setMaintMsg(cfgData.maintenance_message);

      if (cfgData.smtp) {
        setSmtpHost(cfgData.smtp.host);
        setSmtpPort(cfgData.smtp.port);
        setSmtpUser(cfgData.smtp.username);
        setSmtpFromEmail(cfgData.smtp.from_email);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventifyApi.updateSystemConfig({
        platform_name: platformName,
        platform_logo_url: platformLogo,
        support_email: supportEmail,
        support_phone: supportPhone,
        refund_policy_text: refundPolicy,
      });
      showNotif('Identitas platform & Kebijakan Refund berhasil disimpan!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveSMTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventifyApi.updateSystemConfig({
        smtp: {
          host: smtpHost,
          port: smtpPort,
          username: smtpUser,
          from_email: smtpFromEmail,
          from_name: platformName,
          is_enabled: true,
        },
      });
      showNotif('Pengaturan Server SMTP Email berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;
    try {
      await eventifyApi.updateStaticPage(selectedPage.id, { content: pageContent });
      showNotif(`Halaman statis "${selectedPage.title}" berhasil diperbarui!`);
      setIsPageModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 font-jakarta">
      {/* Notification */}
      {notification && (
        <div className="p-4 bg-neo-mint border-3 border-neo-dark rounded-xl shadow-neo font-space font-extrabold text-sm flex items-center justify-between animate-bounce">
          <span>{notification}</span>
          <CheckCircle2 size={20} />
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 bg-neo-yellow rounded-2xl border-3 border-neo-dark shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-space font-extrabold text-2xl md:text-3xl text-neo-dark flex items-center gap-3">
            <Settings size={32} /> Pengaturan Sistem & Platform
          </h1>
          <p className="font-jakarta font-semibold text-xs md:text-sm text-neo-dark/80 mt-1">
            Konfigurasi identitas platform, halaman statis (T&C, Privacy), SMTP email, dan mode pemeliharaan darurat.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b-3 border-neo-dark pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('identity')}
          className={`px-4 py-2 rounded-xl font-space font-extrabold text-xs uppercase cursor-pointer border-2.5 border-neo-dark ${
            activeTab === 'identity' ? 'bg-neo-mint shadow-neo' : 'bg-white hover:bg-neo-bg'
          }`}
        >
          Identitas Platform & Refund
        </button>
        <button
          onClick={() => setActiveTab('pages')}
          className={`px-4 py-2 rounded-xl font-space font-extrabold text-xs uppercase cursor-pointer border-2.5 border-neo-dark ${
            activeTab === 'pages' ? 'bg-neo-toska shadow-neo' : 'bg-white hover:bg-neo-bg'
          }`}
        >
          Halaman Statis ({pages.length})
        </button>
        <button
          onClick={() => setActiveTab('smtp')}
          className={`px-4 py-2 rounded-xl font-space font-extrabold text-xs uppercase cursor-pointer border-2.5 border-neo-dark ${
            activeTab === 'smtp' ? 'bg-neo-yellow shadow-neo' : 'bg-white hover:bg-neo-bg'
          }`}
        >
          SMTP Email Server
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2 rounded-xl font-space font-extrabold text-xs uppercase cursor-pointer border-2.5 border-neo-dark ${
            activeTab === 'maintenance' ? 'bg-neo-pink shadow-neo' : 'bg-white hover:bg-neo-bg'
          }`}
        >
          Mode Pemeliharaan (Maintenance)
        </button>
      </div>

      {/* TAB 1: IDENTITAS PLATFORM */}
      {activeTab === 'identity' && (
        <Card className="bg-white border-3 max-w-3xl">
          <h3 className="font-space font-extrabold text-lg text-neo-dark mb-4 flex items-center gap-2">
            <Globe size={20} /> Identitas Brand & Kebijakan Default
          </h3>
          <form onSubmit={handleSaveIdentity} className="space-y-4">
            <Input label="Nama Platform / Application Name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} required />
            <Input label="URL Logo Brand" value={platformLogo} onChange={(e) => setPlatformLogo(e.target.value)} required />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Email Support Official" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} required />
              <Input label="No. Handphone Support" value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} required />
            </div>
            <div>
              <label className="font-space font-extrabold text-xs text-neo-dark block mb-1">Teks Kebijakan Refund Default Platform:</label>
              <textarea
                rows={4}
                value={refundPolicy}
                onChange={(e) => setRefundPolicy(e.target.value)}
                className="w-full p-3 bg-white border-2.5 border-neo-dark rounded-xl font-jakarta text-xs focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">Simpan Identitas Platform</Button>
          </form>
        </Card>
      )}

      {/* TAB 2: HALAMAN STATIS */}
      {activeTab === 'pages' && (
        <Card className="bg-white border-3">
          <Table headers={['Judul Halaman Statis', 'URL Slug', 'Pembaruan Terakhir', 'Aksi Content Editor']}>
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-neo-yellow/15 transition-colors">
                <td className="px-4 py-3 border-r-2 border-neo-dark font-space font-extrabold text-xs">{p.title}</td>
                <td className="px-4 py-3 border-r-2 border-neo-dark font-mono text-xs text-gray-600">/{p.slug}</td>
                <td className="px-4 py-3 border-r-2 border-neo-dark font-jakarta text-xs">{new Date(p.updated_at).toLocaleDateString('id-ID')}</td>
                <td className="px-4 py-3">
                  <Button
                    onClick={() => {
                      setSelectedPage(p);
                      setPageContent(p.content);
                      setIsPageModalOpen(true);
                    }}
                    variant="secondary"
                    size="sm"
                  >
                    Edit Konten Halaman
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* TAB 3: SMTP SERVER */}
      {activeTab === 'smtp' && (
        <Card className="bg-white border-3 max-w-3xl">
          <h3 className="font-space font-extrabold text-lg text-neo-dark mb-4 flex items-center gap-2">
            <Mail size={20} /> Pengaturan Server Kirim Email (SMTP)
          </h3>
          <form onSubmit={handleSaveSMTP} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input label="SMTP Host Address" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} required />
              </div>
              <Input label="SMTP Port" type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} required />
            </div>
            <Input label="SMTP Username / API Key" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} required />
            <Input label="Email Pengirim (Sender Address)" type="email" value={smtpFromEmail} onChange={(e) => setSmtpFromEmail(e.target.value)} required />
            <Button type="submit" variant="primary" className="w-full">Simpan Konfigurasi SMTP</Button>
          </form>
        </Card>
      )}

      {/* TAB 4: MAINTENANCE MODE */}
      {activeTab === 'maintenance' && (
        <Card className="bg-white border-3 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert size={28} className="text-neo-pink" />
            <div>
              <h3 className="font-space font-extrabold text-lg text-neo-dark">Mode Pemeliharaan Darurat (Emergency Maintenance)</h3>
              <p className="font-jakarta text-xs font-semibold text-gray-600">Toggle mode perbaikan berkala untuk menutup akses pemesanan bagi pengguna umum.</p>
            </div>
          </div>

          <div className="p-4 bg-neo-pink/20 rounded-xl border-2.5 border-neo-dark space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-space font-extrabold text-sm">Status Pemeliharaan Sistem:</span>
              <button
                type="button"
                onClick={toggleMaintenanceMode}
                className={`px-4 py-2 rounded-xl font-space font-black text-xs uppercase cursor-pointer border-2 border-neo-dark shadow-neo-sm ${
                  config.maintenance_mode ? 'bg-neo-pink text-neo-dark' : 'bg-neo-mint text-neo-dark'
                }`}
              >
                {config.maintenance_mode ? 'MAINTENANCE ON (AKTIF)' : 'SYSTEM ONLINE (NORMAL)'}
              </button>
            </div>

            <div>
              <label className="font-space font-extrabold text-xs text-neo-dark block mb-1">Pesan Pengumuman Pemeliharaan:</label>
              <textarea
                rows={3}
                value={maintMsg}
                onChange={(e) => setMaintMsg(e.target.value)}
                className="w-full p-3 bg-white border-2 border-neo-dark rounded-xl font-jakarta text-xs focus:outline-none"
              />
            </div>

            <Button
              onClick={() => {
                updateMaintenanceMessage(maintMsg);
                showNotif('Pesan pengumuman maintenance berhasil diperbarui!');
              }}
              variant="secondary"
              className="w-full"
            >
              Simpan Pesan Maintenance
            </Button>
          </div>
        </Card>
      )}

      {/* MODAL EDIT HALAMAN STATIS */}
      <Modal isOpen={isPageModalOpen} onClose={() => setIsPageModalOpen(false)} title={`Edit Halaman Statis (${selectedPage?.title})`}>
        {selectedPage && (
          <form onSubmit={handleSavePage} className="space-y-4">
            <div>
              <label className="font-space font-extrabold text-xs text-neo-dark block mb-1">Konten Halaman (Markdown / Text):</label>
              <textarea
                rows={8}
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                className="w-full p-3 bg-white border-2.5 border-neo-dark rounded-xl font-jakarta text-xs focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">Update Konten Halaman</Button>
          </form>
        )}
      </Modal>
    </div>
  );
};
