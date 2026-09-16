import React, { useState, useEffect } from 'react';
import { eventifyApi } from '../services/api';
import type { User } from '../types';
import {
  Plus,
  Search,
  KeyRound,
  Edit2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const OrganizerManagementPage: React.FC = () => {
  const [organizers, setOrganizers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const allUsers = await eventifyApi.getUsers();
      setOrganizers(allUsers.filter((u) => u.role === 'organizer'));
    } catch (err) {
      console.error(err);
    }
  };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleAddOrganizer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    try {
      await eventifyApi.createUser({
        name,
        email,
        phone,
        organization: organization || 'Instansi Panitia',
        role: 'organizer',
        password: password || '123456',
      } as any);
      showNotif(`Berhasil menambahkan akun panitia "${name}"!`);
      setIsAddModalOpen(false);
      resetForm();
      fetchOrganizers();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat panitia');
    }
  };

  const handleEditOrganizer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await eventifyApi.updateUser(selectedUser.id, {
        name,
        email,
        phone,
        organization,
      });
      showNotif(`Data panitia "${name}" berhasil diperbarui!`);
      setIsEditModalOpen(false);
      fetchOrganizers();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui panitia');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !selectedUser) return;
    try {
      await eventifyApi.resetUserPassword(selectedUser.email, newPassword, selectedUser.id);
      showNotif(`Password akun panitia "${selectedUser.name}" berhasil di-reset!`);
      setIsResetPassModalOpen(false);
      setNewPassword('');
    } catch (err: any) {
      alert(err.message || 'Gagal mereset password');
    }
  };

  const toggleStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await eventifyApi.updateUser(user.id, { status: nextStatus });
      showNotif(`Status panitia ${user.name} diubah menjadi ${nextStatus.toUpperCase()}`);
      await fetchOrganizers();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setOrganization('');
  };

  const openEditModal = (u: User) => {
    setSelectedUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone);
    setOrganization(u.organization || '');
    setIsEditModalOpen(true);
  };

  const openResetPassModal = (u: User) => {
    setSelectedUser(u);
    setNewPassword('');
    setIsResetPassModalOpen(true);
  };

  const filteredOrganizers = organizers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.organization && u.organization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 font-jakarta">
      {/* Header Notification */}
      {notification && (
        <div className="p-4 bg-neo-mint border-3 border-neo-dark rounded-xl shadow-neo font-space font-extrabold text-sm flex items-center justify-between animate-bounce">
          <span>{notification}</span>
          <CheckCircle2 size={20} />
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 bg-neo-toska/80 rounded-2xl border-3 border-neo-dark shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space font-extrabold text-2xl md:text-3xl text-neo-dark">
            Manajemen Instansi Panitia
          </h1>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          variant="primary"
          icon={<Plus size={18} />}
          className="shrink-0"
        >
          Tambah Akun Panitia
        </Button>
      </div>

      {/* Filters & Directory Table */}
      <Card className="bg-white border-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <Input
            placeholder="Cari nama panitia, email, atau organisasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={18} />}
            className="max-w-md"
          />
          <div className="font-space font-extrabold text-xs text-gray-600">
            Total Panitia: <strong>{filteredOrganizers.length} Instansi</strong>
          </div>
        </div>

        <Table
          headers={[
            { label: 'Informasi Panitia', align: 'left', className: 'w-[28%]' },
            { label: 'Organisasi / Instansi', align: 'center', className: 'w-[20%]' },
            { label: 'No. Handphone', align: 'center', className: 'w-[16%]' },
            { label: 'Event Dikelola', align: 'center', className: 'w-[12%]' },
            { label: 'Status Akun', align: 'center', className: 'w-[12%]' },
            { label: 'Aksi Admin', align: 'center', className: 'w-[12%]' },
          ]}
        >
          {filteredOrganizers.map((u) => (
            <tr key={u.id} className="hover:bg-neo-yellow/10 transition-colors border-b border-neo-dark/20">
              <td className="px-4 py-3.5 border-r-2 border-neo-dark align-middle">
                <p className="text-neo-dark font-space font-extrabold text-sm">{u.name}</p>
                <p className="font-jakarta text-[11px] text-gray-500 font-semibold">{u.email}</p>
              </td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-md font-space font-extrabold text-[11px]">
                  {u.organization || 'Instansi Umum'}
                </span>
              </td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle font-jakarta text-xs font-semibold text-gray-700">
                {u.phone && u.phone !== '-' ? u.phone : '-'}
              </td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle font-space font-extrabold text-xs">
                {u.managed_events_count ?? 0} Event
              </td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle">
                <Badge variant={u.status === 'active' ? 'mint' : 'pink'} className="inline-flex justify-center min-w-[85px]">
                  {u.status ? u.status.toUpperCase() : 'ACTIVE'}
                </Badge>
              </td>
              <td className="px-4 py-3.5 text-center align-middle">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => openEditModal(u)}
                    title="Edit Panitia"
                    className="p-2 bg-white rounded-xl border-2 border-neo-dark shadow-neo-sm hover:bg-neo-yellow transition-all cursor-pointer"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => openResetPassModal(u)}
                    title="Reset Password"
                    className="p-2 bg-white rounded-xl border-2 border-neo-dark shadow-neo-sm hover:bg-neo-toska transition-all cursor-pointer"
                  >
                    <KeyRound size={16} />
                  </button>
                  <button
                    onClick={() => toggleStatus(u)}
                    title={u.status === 'active' ? 'Nonaktifkan / Suspend' : 'Aktifkan Akun'}
                    className="p-2 bg-white rounded-xl border-2 border-neo-dark shadow-neo-sm hover:bg-neo-pink transition-all cursor-pointer"
                  >
                    {u.status === 'active' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Modal Tambah Panitia */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Tambah Akun Panitia Baru">
        <form onSubmit={handleAddOrganizer} className="space-y-4">
          <Input label="Nama Penanggung Jawab" placeholder="e.g. Siti Rahma" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email Resmi Panitia" type="email" placeholder="e.g. siti@soundwave.co.id" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Kata Sandi / Password Akun" type="password" placeholder="e.g. aluna123" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input label="No. Handphone / WhatsApp" placeholder="e.g. 081234567890" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <Input label="Organisasi / Nama Instansi" placeholder="e.g. Soundwave Indonesia" value={organization} onChange={(e) => setOrganization(e.target.value)} required />
          <Button type="submit" variant="primary" className="w-full">Simpan & Buat Akun</Button>
        </form>
      </Modal>

      {/* Modal Edit Panitia */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Data Panitia">
        <form onSubmit={handleEditOrganizer} className="space-y-4">
          <Input label="Nama Penanggung Jawab" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email Official" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="No. Handphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Nama Instansi" value={organization} onChange={(e) => setOrganization(e.target.value)} />
          <Button type="submit" variant="primary" className="w-full">Update Data Panitia</Button>
        </form>
      </Modal>

      {/* Modal Reset Password */}
      <Modal isOpen={isResetPassModalOpen} onClose={() => setIsResetPassModalOpen(false)} title={`Reset Password (${selectedUser?.name})`}>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <p className="font-jakarta text-xs font-semibold text-gray-600">
            Masukkan password baru untuk akun panitia <strong>{selectedUser?.email}</strong>.
          </p>
          <Input label="Password Baru" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Button type="submit" variant="secondary" className="w-full">Reset Password Sekarang</Button>
        </form>
      </Modal>
    </div>
  );
};
