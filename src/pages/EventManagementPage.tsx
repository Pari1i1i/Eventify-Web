import React, { useState, useEffect } from 'react';
import { eventifyApi } from '../services/api';
import type { EventItem, EventCategory } from '../types';
import {
  Search,
  CheckCircle2,
  Eye,
  Trash2,
  Filter,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../components/common/Toast';

export const EventManagementPage: React.FC = () => {
  const toast = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [, setCategories] = useState<EventCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [notification, setNotification] = useState<string | null>(null);

  const [pendingConfirm, setPendingConfirm] = useState<{
    action: () => Promise<void> | void;
    title: string;
    message: string;
    confirmText: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [evtData, catData] = await Promise.all([
        eventifyApi.getEvents(),
        eventifyApi.getCategories(),
      ]);
      setEvents(evtData);
      setCategories(catData);
    } catch (err) {
      console.error(err);
    }
  };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleToggleEventStatus = (evt: EventItem) => {
    const nextStatus = evt.status === 'published' ? 'draft' : 'published';
    const actionLabel = nextStatus === 'draft' ? 'menonaktifkan (Draft)' : 'mempublikasikan (Published)';
    setPendingConfirm({
      title: 'Konfirmasi Perubahan Status Event',
      message: `Apakah Anda yakin ingin ${actionLabel} event "${evt.title}"?`,
      confirmText: 'Ya, Lanjutkan',
      action: async () => {
        try {
          await eventifyApi.updateEventStatus(evt.id, nextStatus);
          showNotif(`Event "${evt.title}" berhasil di-${nextStatus === 'draft' ? 'nonaktifkan (DRAFT)' : 'publikasikan (PUBLISHED)'}.`);
          await loadData();
        } catch (err: any) {
          toast.error(err.message || 'Gagal mengubah status event');
        }
      },
    });
  };

  const handleDelete = (id: string, title: string) => {
    setPendingConfirm({
      title: 'Konfirmasi Hapus Event',
      message: `Hapus (soft delete) event "${title}"? Event akan masuk ke status ENDED.`,
      confirmText: 'Ya, Hapus',
      action: async () => {
        try {
          await eventifyApi.deleteEvent(id);
          showNotif(`Event "${title}" telah dihapus dan dialihkan ke status ENDED.`);
          await loadData();
        } catch (err: any) {
          toast.error(err.message || 'Gagal menghapus event');
        }
      },
    });
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.organizer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || evt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-jakarta">
      {/* Header Notification */}
      {notification && (
        <div className="p-4 bg-neo-mint border-3 border-neo-dark rounded-xl shadow-neo font-space font-extrabold text-sm flex items-center justify-between animate-bounce">
          <span>{notification}</span>
          <CheckCircle2 size={20} />
        </div>
      )}

      {/* Banner Header */}
      <div className="p-6 bg-neo-yellow rounded-2xl border-3 border-neo-dark shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space font-extrabold text-2xl md:text-3xl text-neo-dark">
            Manajemen Event
          </h1>
        </div>
      </div>

      {/* LIST EVENT */}
      <Card className="bg-white border-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Input
            placeholder="Cari judul event atau nama penyelenggara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={18} />}
            className="max-w-md w-full"
          />

          <div className="flex items-center gap-2 min-w-[220px]">
            <Filter size={18} className="text-neo-dark shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2.5 bg-white rounded-xl border-2.5 border-neo-dark font-space font-bold text-xs shadow-neo-sm focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status</option>
              <option value="published">Published (Tayang)</option>
              <option value="draft">Draft (Konsep)</option>
              <option value="ended">Ended (Selesai)</option>
            </select>
          </div>
        </div>

        <Table
          headers={[
            { label: 'Event & Poster', align: 'left', className: 'w-[28%]' },
            { label: 'Penyelenggara', align: 'left', className: 'w-[20%]' },
            { label: 'Kategori', align: 'center', className: 'w-[14%]' },
            { label: 'Jadwal & Lokasi', align: 'center', className: 'w-[18%]' },
            { label: 'Status Event', align: 'center', className: 'w-[10%]' },
            { label: 'Aksi', align: 'center', className: 'w-[10%]' },
          ]}
        >
          {filteredEvents.map((evt, idx) => (
            <tr key={evt.id || `evt-${idx}`} className="hover:bg-neo-yellow/10 transition-colors border-b border-neo-dark/20">
              <td className="px-4 py-3.5 border-r-2 border-neo-dark align-middle max-w-[220px]">
                <div className="flex items-center gap-3">
                  <img
                    src={evt.poster_url}
                    alt={evt.title}
                    className="w-12 h-12 rounded-lg border-2 border-neo-dark object-cover shrink-0 shadow-neo-sm"
                  />
                  <div>
                    <h4 className="font-space font-bold text-xs md:text-sm text-neo-dark line-clamp-1">{evt.title}</h4>
                    <span className="font-jakarta text-[10px] text-gray-500 font-semibold">ID: {evt.id}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark font-jakarta text-xs font-extrabold align-middle">
                {evt.organizer_name}
              </td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle">
                <Badge variant="toska">{evt.category}</Badge>
              </td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle font-jakarta text-[11px] font-semibold">
                <p>{new Date(evt.start_date).toLocaleDateString('id-ID')}</p>
                <p className="text-gray-500 truncate max-w-[150px] mx-auto">{evt.location}</p>
              </td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle">
                <Badge
                  variant={
                    evt.status === 'published'
                      ? 'mint'
                      : evt.status === 'draft'
                      ? 'yellow'
                      : evt.status === 'ended'
                      ? 'gray'
                      : 'pink'
                  }
                  className="inline-flex justify-center min-w-[85px]"
                >
                  {(evt.status || 'published').toUpperCase()}
                </Badge>
              </td>
              <td className="px-4 py-3.5 text-center align-middle">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedEvent(evt);
                      setIsPreviewOpen(true);
                    }}
                    title="Pratinjau & Detail Event"
                    className="p-2 bg-white rounded-xl border-2 border-neo-dark shadow-neo-sm hover:bg-neo-toska transition-all cursor-pointer"
                  >
                    <Eye size={16} />
                  </button>
                  {evt.status === 'published' && (
                    <button
                      onClick={() => handleToggleEventStatus(evt)}
                      title="Nonaktifkan Event (Ubah ke Draft)"
                      className="p-2 bg-neo-yellow text-neo-dark rounded-xl border-2 border-neo-dark shadow-neo-sm hover:bg-yellow-300 transition-all cursor-pointer"
                    >
                      <PauseCircle size={16} />
                    </button>
                  )}
                  {evt.status === 'draft' && (
                    <button
                      onClick={() => handleToggleEventStatus(evt)}
                      title="Aktifkan / Publikasikan Event"
                      className="p-2 bg-neo-mint text-neo-dark rounded-xl border-2 border-neo-dark shadow-neo-sm hover:bg-emerald-300 transition-all cursor-pointer"
                    >
                      <PlayCircle size={16} />
                    </button>
                  )}
                  {evt.status !== 'ended' && (
                    <button
                      onClick={() => handleDelete(evt.id, evt.title)}
                      title="Hapus (Soft Delete ke Ended)"
                      className="p-2 bg-neo-pink text-neo-dark rounded-xl border-2 border-neo-dark shadow-neo-sm hover:bg-red-300 transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* MODAL REVIEW DETAIL EVENT */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title={`Detail Event: ${selectedEvent?.title}`}>
        {selectedEvent && (
          <div className="space-y-4">
            <img src={selectedEvent.poster_url} alt={selectedEvent.title} className="w-full h-48 object-cover rounded-xl border-2.5 border-neo-dark" />
            <div className="p-4 bg-neo-bg rounded-xl border-2.5 border-neo-dark space-y-2 text-xs">
              <p><strong>Deskripsi:</strong> {selectedEvent.description}</p>
              <p><strong>Penyelenggara:</strong> {selectedEvent.organizer_name}</p>
              <p><strong>Jadwal:</strong> {new Date(selectedEvent.start_date).toLocaleString('id-ID')} - {new Date(selectedEvent.end_date).toLocaleString('id-ID')}</p>
              <p><strong>Lokasi:</strong> {selectedEvent.location}</p>
              <p><strong>Status Saat Ini:</strong> {(selectedEvent.status || 'published').toUpperCase()}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Konfirmasi Aksi Event */}
      <ConfirmModal
        isOpen={!!pendingConfirm}
        onClose={() => setPendingConfirm(null)}
        onConfirm={() => {
          pendingConfirm?.action();
          setPendingConfirm(null);
        }}
        title={pendingConfirm?.title || 'Konfirmasi'}
        message={pendingConfirm?.message || ''}
        confirmText={pendingConfirm?.confirmText}
        variant="danger"
      />
    </div>
  );
};