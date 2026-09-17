import React, { useState, useEffect } from 'react';
import { eventifyApi } from '../services/api';
import type { Participant, ParticipantTicketItem, EventItem } from '../types';
import {
  Search,
  Download,
  CheckCircle2,
  UserCheck,
  Plus,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/common/Toast';

export const ParticipantTicketPage: React.FC = () => {
  const toast = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Multi-Ticket Gate Modal State
  const [selectedParticipantModal, setSelectedParticipantModal] = useState<Participant | null>(null);

  // Add Ticket Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newEventId, setNewEventId] = useState('');

  // Items for tickets being purchased
  const [ticketItems, setTicketItems] = useState<{ ticket_tier_name: string; quantity: number }[]>([
    { ticket_tier_name: 'VIP FRONTSTAGE', quantity: 1 },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ptData, evtData] = await Promise.all([
        eventifyApi.getParticipants(),
        eventifyApi.getEvents(),
      ]);
      setParticipants(ptData);
      setEvents(evtData);
      if (evtData.length > 0 && !newEventId) {
        setNewEventId(evtData[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCheckInSingleTicket = async (pt: Participant, ticketId: string) => {
    try {
      const updatedPt = await eventifyApi.updateCheckIn(pt.id, ticketId);
      showNotif(`Check-in berhasil untuk tiket ${ticketId} (${pt.user_name})!`);
      loadData();
      if (selectedParticipantModal?.id === pt.id) {
        setSelectedParticipantModal(updatedPt);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCheckInAllTickets = async (pt: Participant) => {
    try {
      const updatedPt = await eventifyApi.updateCheckIn(pt.id);
      showNotif(`Check-in SEMUA tiket berhasil untuk ${pt.user_name}!`);
      loadData();
      if (selectedParticipantModal?.id === pt.id) {
        setSelectedParticipantModal(updatedPt);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAddTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.warning('Nama dan Email peserta wajib diisi!');
      return;
    }
    const selectedEvt = events.find((e) => e.id === newEventId) || events[0];

    try {
      await (eventifyApi as any).addParticipant({
        event_id: selectedEvt ? selectedEvt.id : 'EVT-001',
        event_title: selectedEvt ? selectedEvt.title : 'Soundfest Music Festival 2026',
        user_name: newUserName,
        user_email: newUserEmail,
        tickets: ticketItems,
      });

      showNotif(`Tiket berhasil dibeli/ditambahkan untuk ${newUserName}!`);
      setIsAddModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setTicketItems([{ ticket_tier_name: 'VIP FRONTSTAGE', quantity: 1 }]);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const addTicketRow = () => {
    setTicketItems([...ticketItems, { ticket_tier_name: 'REGULAR FESTIVAL', quantity: 1 }]);
  };

  const removeTicketRow = (index: number) => {
    if (ticketItems.length <= 1) return;
    setTicketItems(ticketItems.filter((_, idx) => idx !== index));
  };

  const updateTicketRow = (index: number, field: 'ticket_tier_name' | 'quantity', val: any) => {
    const updated = [...ticketItems];
    updated[index] = { ...updated[index], [field]: val };
    setTicketItems(updated);
  };

  const exportParticipantsExcel = () => {
    const xmlRows = filteredParticipants.map((p) => {
      const ticketsInfo = getParticipantTicketSummary(p)
        .map((cat) => `${cat.count}x ${cat.tierName}`)
        .join(', ');
      const checkInStatusText = getCheckInStatusInfo(p).statusLabel;

      return `
      <Row>
        <Cell><Data ss:Type="String">${p.id}</Data></Cell>
        <Cell><Data ss:Type="String">${p.user_name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>
        <Cell><Data ss:Type="String">${p.user_email}</Data></Cell>
        <Cell><Data ss:Type="String">${p.event_title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>
        <Cell><Data ss:Type="String">${ticketsInfo}</Data></Cell>
        <Cell><Data ss:Type="String">${checkInStatusText}</Data></Cell>
        <Cell><Data ss:Type="String">${new Date(p.registered_at).toLocaleDateString('id-ID')}</Data></Cell>
      </Row>`;
    }).join('');

    const excelTemplate = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1F2937" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Data Peserta Tiket">
  <Table>
   <Column ss:Width="100"/>
   <Column ss:Width="180"/>
   <Column ss:Width="200"/>
   <Column ss:Width="220"/>
   <Column ss:Width="220"/>
   <Column ss:Width="140"/>
   <Column ss:Width="140"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">ID Peserta</Data></Cell>
    <Cell><Data ss:Type="String">Nama Peserta</Data></Cell>
    <Cell><Data ss:Type="String">Email</Data></Cell>
    <Cell><Data ss:Type="String">Event Terdaftar</Data></Cell>
    <Cell><Data ss:Type="String">Kategori Tiket</Data></Cell>
    <Cell><Data ss:Type="String">Tanggal Daftar</Data></Cell>
   </Row>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Eventify_Data_Peserta_${Date.now()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper untuk menghitung jumlah tiket per kategori untuk satu peserta
  const getParticipantTicketSummary = (p: Participant) => {
    if (!p.tickets || p.tickets.length === 0) {
      return [{ tierName: (p.ticket_tier_name || 'REGULAR').toUpperCase(), count: 1 }];
    }
    const counts: Record<string, number> = {};
    p.tickets.forEach((t) => {
      const tier = t.ticket_tier_name.toUpperCase();
      counts[tier] = (counts[tier] || 0) + 1;
    });
    return Object.keys(counts).map((tierName) => ({
      tierName,
      count: counts[tierName],
    }));
  };

  // Helper untuk statistik Check-in per peserta
  const getCheckInStatusInfo = (p: Participant) => {
    if (!p.tickets || p.tickets.length === 0) {
      const isChecked = p.registration_status === 'checked_in';
      return {
        total: 1,
        checkedIn: isChecked ? 1 : 0,
        statusLabel: isChecked ? '1/1 Checked-in' : '0/1 Checked-in',
        badgeVariant: isChecked ? ('mint' as const) : ('pink' as const),
        isAllCheckedIn: isChecked,
      };
    }

    const total = p.tickets.length;
    const checkedIn = p.tickets.filter((t) => t.is_checked_in).length;

    let badgeVariant: 'mint' | 'yellow' | 'pink' = 'pink';
    if (checkedIn === total) badgeVariant = 'mint';
    else if (checkedIn > 0) badgeVariant = 'yellow';

    return {
      total,
      checkedIn,
      statusLabel: `${checkedIn}/${total} Checked-in`,
      badgeVariant,
      isAllCheckedIn: checkedIn === total,
    };
  };

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.event_title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = selectedEventId === 'all' || p.event_id === selectedEventId;

    const statusInfo = getCheckInStatusInfo(p);
    let matchesStatus = true;
    if (statusFilter === 'checked_in') matchesStatus = statusInfo.isAllCheckedIn;
    if (statusFilter === 'partial') matchesStatus = statusInfo.checkedIn > 0 && !statusInfo.isAllCheckedIn;
    if (statusFilter === 'unscanned') matchesStatus = statusInfo.checkedIn === 0;

    return matchesSearch && matchesEvent && matchesStatus;
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

      {/* Header Banner Clean */}
      <div className="p-6 bg-neo-toska rounded-2xl border-3 border-neo-dark shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-space font-extrabold text-2xl md:text-3xl text-neo-dark">
            Pendaftaran & Tiket
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={exportParticipantsExcel} variant="secondary" icon={<Download size={18} />} className="shrink-0">
            Export Data Excel
          </Button>
        </div>
      </div>

      {/* Filters & Directory Table */}
      <Card className="bg-white border-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Cari nama peserta, email, atau event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={18} />}
          />

          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="p-2.5 bg-white rounded-xl border-2.5 border-neo-dark font-space font-bold text-xs shadow-neo-sm focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Event</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>{e.title}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2.5 bg-white rounded-xl border-2.5 border-neo-dark font-space font-bold text-xs shadow-neo-sm focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Status Check-in</option>
            <option value="checked_in">Sudah Masuk Semua</option>
            <option value="partial">Sebagian Masuk</option>
            <option value="unscanned">Belum Scan (0 Masuk)</option>
          </select>
        </div>

        {/* Neo-brutalism Directory Table */}
        <Table
          headers={[
            { label: 'Nama Peserta', align: 'left', className: 'w-[24%]' },
            { label: 'Event Terdaftar', align: 'left', className: 'w-[22%]' },
            { label: 'Kategori Tiket', align: 'left', className: 'w-[26%]' },
            { label: 'Tanggal Daftar', align: 'center', className: 'w-[12%]' },
            // { label: 'Status Check-in', align: 'center', className: 'w-[12%]' },
            // { label: 'Aksi Gate', align: 'center', className: 'w-[14%]' },
          ]}
        >
          {filteredParticipants.map((p) => {
            const ticketSummary = getParticipantTicketSummary(p);

            return (
              <tr key={p.id} className="hover:bg-neo-yellow/10 transition-colors border-b border-neo-dark/20">
                {/* Nama Peserta */}
                <td className="px-4 py-3.5 border-r-2 border-neo-dark align-middle">
                  <p className="text-neo-dark font-space font-extrabold text-xs md:text-sm">{p.user_name}</p>
                  <p className="font-jakarta text-[11px] text-gray-500 font-semibold">{p.user_email}</p>
                </td>

                {/* Event Terdaftar */}
                <td className="px-4 py-3.5 border-r-2 border-neo-dark font-space font-bold text-xs align-middle">
                  {p.event_title}
                </td>

                {/* Kategori Tiket (Dukungan Banyak Tiket Per Peserta) */}
                <td className="px-4 py-3.5 border-r-2 border-neo-dark align-middle">
                  <ul className="space-y-1">
                    {ticketSummary.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 font-jakarta text-[11px] text-neo-dark">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.tierName.includes('VIP') ? 'bg-neo-mint' : 'bg-neo-dark'}`} />
                        <span className="font-space font-extrabold shrink-0">{item.count}x</span>
                        <span className="font-semibold uppercase truncate max-w-[160px]" title={item.tierName}>{item.tierName}</span>
                      </li>
                    ))}
                  </ul>
                </td>

                {/* Tanggal Daftar */}
                <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle font-jakarta text-xs font-semibold text-gray-700">
                  {new Date(p.registered_at).toLocaleDateString('id-ID')}
                </td>

                {/* Status Check-in Multi-Tiket */}
             

                {/* Aksi Gate Management */}
              
              </tr>
            );
          })}
        </Table>
      </Card>

      {/* MODAL TAMBAH TIKET / PESERTA BARU */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah Tiket / Pembelian Peserta Baru">
        <form onSubmit={handleAddTicketSubmit} className="space-y-4 font-jakarta text-xs">
          <Input
            label="Nama Lengkap Peserta *"
            placeholder="Masukkan nama pembeli..."
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            required
          />

          <Input
            label="Email Peserta *"
            type="email"
            placeholder="contoh: pembeli@gmail.com"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            required
          />

          <div>
            <label className="block font-space font-extrabold text-xs text-neo-dark mb-1">Pilih Event *</label>
            <select
              value={newEventId}
              onChange={(e) => setNewEventId(e.target.value)}
              className="w-full p-2.5 bg-white rounded-xl border-2.5 border-neo-dark font-space font-bold text-xs shadow-neo-sm focus:outline-none cursor-pointer"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>{evt.title}</option>
              ))}
            </select>
          </div>

          <hr className="border-t-2 border-neo-dark my-3" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-space font-extrabold text-xs text-neo-dark uppercase">Kategori & Kuantitas Tiket Dibeli:</label>
              <Button type="button" onClick={addTicketRow} variant="secondary" size="sm" icon={<Plus size={14} />}>
                Tambah Kategori
              </Button>
            </div>

            {ticketItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-neo-bg/60 rounded-xl border-2 border-neo-dark flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Nama Kategori (contoh: VIP FRONTSTAGE)"
                    value={item.ticket_tier_name}
                    onChange={(e) => updateTicketRow(idx, 'ticket_tier_name', e.target.value)}
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateTicketRow(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                  />
                </div>
                {ticketItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTicketRow(idx)}
                    className="px-2.5 py-2 bg-neo-pink text-neo-dark font-space font-black rounded-lg border-2 border-neo-dark shadow-neo-sm hover:opacity-80"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3">
            <Button type="submit" variant="primary" className="w-full justify-center">
              Simpan & Beli Tiket
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL KELOLA TIKET & GATE MULTI-TIKET */}
      <Modal
        isOpen={!!selectedParticipantModal}
        onClose={() => setSelectedParticipantModal(null)}
        title={`Kelola Gate: ${selectedParticipantModal?.user_name}`}
      >
        {selectedParticipantModal && (
          <div className="p-4 bg-white rounded-xl border-2.5 border-neo-dark space-y-4 font-jakarta text-xs">
            {/* Participant Info Banner */}
            <div className="p-3 bg-neo-toska/30 rounded-xl border-2 border-neo-dark flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-space font-black text-sm text-neo-dark">{selectedParticipantModal.user_name}</h4>
                <p className="text-gray-600 font-semibold">{selectedParticipantModal.user_email}</p>
                <p className="font-space font-bold text-xs text-neo-dark mt-1">Event: {selectedParticipantModal.event_title}</p>
              </div>

              {!getCheckInStatusInfo(selectedParticipantModal).isAllCheckedIn && (
                <Button
                  onClick={() => handleCheckInAllTickets(selectedParticipantModal)}
                  variant="primary"
                  size="sm"
                  icon={<UserCheck size={14} />}
                  className="whitespace-nowrap shrink-0"
                >
                  Check-in Semua Tiket
                </Button>
              )}
            </div>

            {/* List Tiket Individu */}
            <div className="space-y-2.5">
              <h5 className="font-space font-extrabold text-xs uppercase text-neo-dark tracking-wide">
                Rincian Tiket Peserta ({selectedParticipantModal.tickets?.length || 1} Tiket):
              </h5>

              {selectedParticipantModal.tickets && selectedParticipantModal.tickets.length > 0 ? (
                selectedParticipantModal.tickets.map((t: ParticipantTicketItem, idx: number) => (
                  <div
                    key={t.id || idx}
                    className={`p-3 rounded-xl border-2 border-neo-dark flex items-center justify-between gap-3 ${
                      t.is_checked_in ? 'bg-neo-mint/20' : 'bg-neo-bg/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="yellow" className="text-[10px] font-space font-black px-2 py-0.5">
                          {t.ticket_tier_name}
                        </Badge>
                        <span className="font-space font-extrabold text-xs text-neo-dark">{t.ticket_code}</span>
                      </div>
                      {t.is_checked_in ? (
                        <p className="text-[11px] font-bold text-emerald-800">
                          ✓ Masuk: {t.check_in_time ? new Date(t.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Sudah Validasi'}
                        </p>
                      ) : (
                        <p className="text-[11px] font-semibold text-gray-500">Belum dipindai di Gate</p>
                      )}
                    </div>

                    {!t.is_checked_in ? (
                      <Button
                        onClick={() => handleCheckInSingleTicket(selectedParticipantModal, t.id)}
                        variant="secondary"
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        Scan / Masuk
                      </Button>
                    ) : (
                      <Badge variant="mint" className="text-[10px] uppercase">TERVERIFIKASI</Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 bg-neo-bg rounded-xl border-2 border-neo-dark flex items-center justify-between">
                  <div>
                    <span className="font-space font-extrabold text-xs">{selectedParticipantModal.ticket_tier_name}</span>
                    <p className="text-gray-500 text-[11px]">Single Ticket Participant</p>
                  </div>
                  {selectedParticipantModal.registration_status !== 'checked_in' ? (
                    <Button
                      onClick={() => handleCheckInAllTickets(selectedParticipantModal)}
                      variant="primary"
                      size="sm"
                    >
                      Scan / Masuk
                    </Button>
                  ) : (
                    <Badge variant="mint">TERVERIFIKASI</Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
