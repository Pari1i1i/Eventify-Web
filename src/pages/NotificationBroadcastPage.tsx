import React, { useState, useEffect } from 'react';
import { eventifyApi } from '../services/api';
import type { SupportTicket, BroadcastMessage, EmailTemplate } from '../types';
import {
  Bell,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const NotificationBroadcastPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'support' | 'broadcast' | 'templates'>('support');

  // Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState<'all_users' | 'all_organizers' | 'all_customers'>('all_users');

  // Reply Modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tktData, brdData, tplData] = await Promise.all([
        eventifyApi.getSupportTickets(),
        eventifyApi.getBroadcasts(),
        eventifyApi.getEmailTemplates(),
      ]);
      setTickets(tktData);
      setBroadcasts(brdData);
      setTemplates(tplData);
    } catch (err) {
      console.error(err);
    }
  };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    try {
      await eventifyApi.sendBroadcast({
        title: broadcastTitle,
        message: broadcastMessage,
        target_audience: targetAudience,
      });
      showNotif('Pengumuman broadcast berhasil TERKIRIM!');
      setBroadcastTitle('');
      setBroadcastMessage('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText) return;
    try {
      await eventifyApi.replySupportTicket(selectedTicket.id, replyText, 'resolved');
      showNotif(`Tiket support #${selectedTicket.ticket_code} berhasil DIBALAS & RESOLVED!`);
      setIsReplyModalOpen(false);
      setReplyText('');
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
      <div className="p-6 bg-neo-pink/80 rounded-2xl border-3 border-neo-dark shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-space font-extrabold text-2xl md:text-3xl text-neo-dark flex items-center gap-3">
            <Bell size={32} /> Broadcast & Tiket Support Komplain
          </h1>
          <p className="font-jakarta font-semibold text-xs md:text-sm text-neo-dark/80 mt-1">
            Kirim pengumuman broadcast pengingat event, kelola tiket keluhan user/panitia, dan atur template email.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b-3 border-neo-dark pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2 rounded-xl font-space font-extrabold text-xs uppercase cursor-pointer border-2.5 border-neo-dark ${
            activeTab === 'support' ? 'bg-neo-yellow shadow-neo' : 'bg-white hover:bg-neo-bg'
          }`}
        >
          Tiket Support / Keluhan ({tickets.filter((t) => t.status !== 'resolved').length} Open)
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2 rounded-xl font-space font-extrabold text-xs uppercase cursor-pointer border-2.5 border-neo-dark ${
            activeTab === 'broadcast' ? 'bg-neo-mint shadow-neo' : 'bg-white hover:bg-neo-bg'
          }`}
        >
          Kirim Broadcast Pengumuman
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2 rounded-xl font-space font-extrabold text-xs uppercase cursor-pointer border-2.5 border-neo-dark ${
            activeTab === 'templates' ? 'bg-neo-toska shadow-neo' : 'bg-white hover:bg-neo-bg'
          }`}
        >
          Template Email Otomatis ({templates.length})
        </button>
      </div>

      {/* TAB 1: TIKET SUPPORT */}
      {activeTab === 'support' && (
        <Card className="bg-white border-3">
          <Table headers={['Kode Tiket', 'Pengirim', 'Subjek Keluhan', 'Prioritas', 'Status Tiket', 'Aksi Balasan']}>
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-neo-yellow/15 transition-colors">
                <td className="px-4 py-3 border-r-2 border-neo-dark font-space font-extrabold text-xs">{t.ticket_code}</td>
                <td className="px-4 py-3 border-r-2 border-neo-dark font-jakarta text-xs">
                  <p className="font-bold">{t.sender_name}</p>
                  <p className="text-[11px] text-gray-500">{t.sender_email} ({t.sender_role.toUpperCase()})</p>
                </td>
                <td className="px-4 py-3 border-r-2 border-neo-dark font-space font-bold text-xs">
                  <p>{t.subject}</p>
                  <p className="font-jakarta text-[11px] text-gray-600 truncate max-w-[200px]">{t.message}</p>
                </td>
                <td className="px-4 py-3 border-r-2 border-neo-dark text-xs">
                  <Badge variant={t.priority === 'high' ? 'pink' : 'yellow'}>{t.priority.toUpperCase()}</Badge>
                </td>
                <td className="px-4 py-3 border-r-2 border-neo-dark text-xs">
                  <Badge variant={t.status === 'resolved' ? 'mint' : 'yellow'}>{t.status.toUpperCase()}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    onClick={() => {
                      setSelectedTicket(t);
                      setReplyText(t.reply || '');
                      setIsReplyModalOpen(true);
                    }}
                    variant="primary"
                    size="sm"
                    icon={<MessageSquare size={14} />}
                  >
                    {t.status === 'resolved' ? 'Lihat Balasan' : 'Balas Tiket'}
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* TAB 2: BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border-3">
            <h3 className="font-space font-extrabold text-base text-neo-dark mb-4 flex items-center gap-2">
              <Send size={18} /> Form Kirim Broadcast Pesan
            </h3>
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="font-space font-extrabold text-xs text-neo-dark block mb-1">Target Penerima:</label>
                <select
                  value={targetAudience}
                  onChange={(e: any) => setTargetAudience(e.target.value)}
                  className="w-full p-2.5 bg-white border-2.5 border-neo-dark rounded-xl font-space font-bold text-xs"
                >
                  <option value="all_users">Semua Pengguna & Panitia Platform</option>
                  <option value="all_organizers">Khusus Seluruh Panitia / Instansi</option>
                  <option value="all_customers">Khusus Seluruh Customer / Peserta</option>
                </select>
              </div>

              <Input label="Judul Pengumuman" placeholder="e.g. Pembaharuan Kebijakan Pembatalan Tiket" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} required />

              <div>
                <label className="font-space font-extrabold text-xs text-neo-dark block mb-1">Isi Pesan Pengumuman:</label>
                <textarea
                  required
                  rows={5}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Tuliskan detail pengumuman yang akan dikirimkan ke email/notifikasi penerima..."
                  className="w-full p-3 bg-white border-2.5 border-neo-dark rounded-xl font-jakarta text-xs focus:outline-none"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full" icon={<Send size={18} />}>
                Kirim Broadcast Pengumuman Now
              </Button>
            </form>
          </Card>

          {/* Log Broadcast */}
          <Card className="bg-white border-3">
            <h3 className="font-space font-extrabold text-base text-neo-dark mb-4 flex items-center gap-2">
              <Clock size={18} /> Riwayat Broadcast Terkirim
            </h3>
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <div key={b.id} className="p-3 bg-neo-bg rounded-xl border-2 border-neo-dark space-y-1 text-xs">
                  <div className="flex justify-between font-space font-extrabold text-neo-dark">
                    <span>{b.title}</span>
                    <Badge variant="toska">{b.sent_count} Penerima</Badge>
                  </div>
                  <p className="font-jakarta text-gray-600 font-semibold">{b.message}</p>
                  <p className="font-jakarta text-[10px] text-gray-500">{new Date(b.created_at).toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: TEMPLATE EMAIL */}
      {activeTab === 'templates' && (
        <Card className="bg-white border-3">
          <Table headers={['Kode Template', 'Nama Notifikasi', 'Subjek Email', 'Variabel Tersedia', 'Aksi Editor']}>
            {templates.map((tpl) => (
              <tr key={tpl.id} className="hover:bg-neo-yellow/15 transition-colors">
                <td className="px-4 py-3 border-r-2 border-neo-dark font-space font-extrabold text-xs">{tpl.code}</td>
                <td className="px-4 py-3 border-r-2 border-neo-dark font-space font-bold text-xs">{tpl.name}</td>
                <td className="px-4 py-3 border-r-2 border-neo-dark font-jakarta text-xs font-semibold">{tpl.subject}</td>
                <td className="px-4 py-3 border-r-2 border-neo-dark text-xs">
                  <div className="flex flex-wrap gap-1">
                    {tpl.variables.map((v) => (
                      <Badge key={v} variant="yellow">{v}</Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button variant="secondary" size="sm">Edit Template</Button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* MODAL BALAS TIKET SUPPORT */}
      <Modal isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)} title={`Balas Tiket Support (${selectedTicket?.ticket_code})`}>
        {selectedTicket && (
          <form onSubmit={handleReplyTicket} className="space-y-4">
            <div className="p-3 bg-neo-yellow/30 rounded-xl border-2 border-neo-dark text-xs space-y-1">
              <p><strong>Dari:</strong> {selectedTicket.sender_name} ({selectedTicket.sender_email})</p>
              <p><strong>Subjek:</strong> {selectedTicket.subject}</p>
              <p><strong>Pesan Keluhan:</strong> {selectedTicket.message}</p>
            </div>

            <div>
              <label className="font-space font-extrabold text-xs text-neo-dark block mb-1">Tulis Balasan Official Admin:</label>
              <textarea
                required
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Ketikan balasan resmi untuk menginfokan penyelesaian masalah ke user..."
                className="w-full p-3 bg-white border-2.5 border-neo-dark rounded-xl font-jakarta text-xs focus:outline-none"
              />
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Kirim Balasan & Set status Resolved
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
};
