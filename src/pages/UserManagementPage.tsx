import React, { useState, useEffect } from 'react';
import { eventifyApi } from '../services/api';
import type { User, UserStatus } from '../types';
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Download,
  Eye,
  Ticket,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await eventifyApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Gagal mengambil data user:', err);
    }
  };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleStatusChange = async (userId: string, newStatus: UserStatus) => {
    try {
      await eventifyApi.updateUser(userId, { status: newStatus });
      showNotif(`Status akun user diubah menjadi ${newStatus.toUpperCase()}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const exportUsersToExcel = () => {
    // Buat file Excel XML (Format Spreadsheet XML asli yang rapih di Excel tanpa kolom terpotong)
    const xmlRows = filteredUsers.map((u) => `
      <Row>
        <Cell><Data ss:Type="String">${u.id}</Data></Cell>
        <Cell><Data ss:Type="String">${u.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>
        <Cell><Data ss:Type="String">${u.email}</Data></Cell>
        <Cell><Data ss:Type="String">${u.phone && u.phone !== '-' ? u.phone : '-'}</Data></Cell>
        <Cell><Data ss:Type="String">${u.role.toUpperCase()}</Data></Cell>
        <Cell><Data ss:Type="String">${(u.status || 'active').toUpperCase()}</Data></Cell>
        <Cell><Data ss:Type="String">${new Date(u.created_at).toLocaleDateString('id-ID')}</Data></Cell>
      </Row>`).join('');

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
 <Worksheet ss:Name="Data Akun Eventify">
  <Table>
   <Column ss:Width="100"/>
   <Column ss:Width="180"/>
   <Column ss:Width="200"/>
   <Column ss:Width="130"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="120"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">ID User</Data></Cell>
    <Cell><Data ss:Type="String">Nama Lengkap</Data></Cell>
    <Cell><Data ss:Type="String">Email</Data></Cell>
    <Cell><Data ss:Type="String">No. Handphone</Data></Cell>
    <Cell><Data ss:Type="String">Role</Data></Cell>
    <Cell><Data ss:Type="String">Status Akun</Data></Cell>
    <Cell><Data ss:Type="String">Tanggal Pendaftaran</Data></Cell>
   </Row>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Eventify_Data_Akun_${Date.now()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (u.status || 'active') === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
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
      <div className="p-6 bg-neo-yellow rounded-2xl border-3 border-neo-dark shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-space font-extrabold text-2xl md:text-3xl text-neo-dark">
            Manajemen Akun
          </h1>
        </div>

        <Button onClick={exportUsersToExcel} variant="secondary" icon={<Download size={18} />} className="shrink-0">
          Export Data Excel
        </Button>
      </div>

      {/* Filters & Search Controls */}
      <Card className="bg-white border-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Cari berdasarkan nama atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={18} />}
          />
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-neo-dark shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2.5 bg-white rounded-xl border-2.5 border-neo-dark font-space font-bold text-xs shadow-neo-sm focus:outline-none"
            >
              <option value="all">Semua Role</option>
              <option value="customer">Customer / Peserta</option>
              <option value="organizer">Panitia / Organizer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2.5 bg-white rounded-xl border-2.5 border-neo-dark font-space font-bold text-xs shadow-neo-sm focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="active">Active (Aktif)</option>
              <option value="suspended">Suspended (Ditangguhkan)</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        <Table
          headers={[
            { label: 'Profil User', align: 'left', className: 'w-[28%]' },
            { label: 'No. Handphone', align: 'center', className: 'w-[16%]' },
            { label: 'Role Sistem', align: 'center', className: 'w-[16%]' },
            { label: 'Tanggal Registrasi', align: 'center', className: 'w-[16%]' },
            { label: 'Status Akun', align: 'center', className: 'w-[12%]' },
            { label: 'Aksi Kontrol', align: 'center', className: 'w-[12%]' },
          ]}
        >
          {filteredUsers.map((u) => (
            <tr key={u.id} className="hover:bg-neo-yellow/10 transition-colors border-b border-neo-dark/20">
              <td className="px-4 py-3.5 border-r-2 border-neo-dark align-middle">
                <p className="text-neo-dark font-space font-extrabold text-xs md:text-sm leading-tight">{u.name}</p>
                <p className="font-jakarta text-[11px] text-gray-500 font-semibold">{u.email}</p>
              </td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle font-jakarta text-xs font-semibold text-gray-700">
                {u.phone && u.phone !== '-' ? u.phone : '-'}
              </td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle">
                <Badge variant={u.role === 'admin' ? 'pink' : u.role === 'organizer' ? 'yellow' : 'mint'} className="inline-flex justify-center min-w-[95px]">
                  {u.role.toUpperCase()}
                </Badge>
              </td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle font-jakarta text-xs font-semibold text-gray-700">
                {new Date(u.created_at).toLocaleDateString('id-ID')}
              </td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle">
                <Badge variant={(u.status || 'active') === 'active' ? 'mint' : 'pink'} className="inline-flex justify-center min-w-[85px]">
                  {(u.status || 'active').toUpperCase()}
                </Badge>
              </td>
              <td className="px-4 py-3.5 text-center align-middle">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setIsDetailModalOpen(true);
                    }}
                    title="Detail Profil & Riwayat"
                    className="p-2 bg-white rounded-xl border-2 border-neo-dark shadow-neo-sm hover:bg-neo-toska transition-all cursor-pointer"
                  >
                    <Eye size={16} />
                  </button>
                  {u.status !== 'suspended' ? (
                    <button
                      onClick={() => handleStatusChange(u.id, 'suspended')}
                      title="Suspend / Nonaktifkan Akun"
                      className="p-2 bg-white rounded-xl border-2 border-neo-dark shadow-neo-sm hover:bg-neo-yellow transition-all cursor-pointer"
                    >
                      <UserX size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(u.id, 'active')}
                      title="Aktifkan Akun"
                      className="p-2 bg-white rounded-xl border-2 border-neo-dark shadow-neo-sm hover:bg-neo-mint transition-all cursor-pointer"
                    >
                      <UserCheck size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* Modal Detail Profil User */}
      <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title={`Detail Profil (${selectedUser?.name})`}>
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-neo-yellow/30 rounded-xl border-2.5 border-neo-dark space-y-2 text-xs">
              <p><strong>Nama Lengkap:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Handphone:</strong> {selectedUser.phone || '-'}</p>
              <p><strong>Role:</strong> {selectedUser.role.toUpperCase()}</p>
              <p><strong>Status Akun:</strong> {(selectedUser.status || 'active').toUpperCase()}</p>
              <p><strong>Terdaftar Sejak:</strong> {new Date(selectedUser.created_at).toLocaleString('id-ID')}</p>
            </div>

            <div>
              <h4 className="font-space font-extrabold text-sm text-neo-dark mb-2 flex items-center gap-2">
                <Ticket size={16} /> Riwayat Partisipasi & Tiket
              </h4>
              <div className="p-3 bg-white rounded-xl border-2 border-neo-dark text-xs font-semibold text-gray-600">
                • Nusantara Soundwave Music Fest 2026 (Regular Festival) - <span className="text-emerald-700 font-bold">LUNAS</span>
                <br />
                • IndoTech Summit & AI Expo 2026 (Executive VIP) - <span className="text-emerald-700 font-bold">LUNAS</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};