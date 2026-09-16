import React, { useState, useEffect } from 'react';
import { eventifyApi } from '../services/api';
import type { AuditTrailLog, ActiveSession, SubAdminRole } from '../types';
import {
  ShieldCheck,
  Laptop,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

export const SecurityAuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditTrailLog[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [roles, setRoles] = useState<SubAdminRole[]>([]);
  const [activeTab, setActiveTab] = useState<'audit' | 'sessions' | 'roles'>('audit');

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [logData, sesData, roleData] = await Promise.all([
        eventifyApi.getAuditLogs(),
        eventifyApi.getSessions(),
        eventifyApi.getSubAdminRoles(),
      ]);
      setLogs(logData);
      setSessions(sesData);
      setRoles(roleData);
    } catch (err) {
      console.error(err);
    }
  };

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRevokeSession = async (id: string, device: string) => {
    if (!window.confirm(`Paksa logout perangkat "${device}"?`)) return;
    try {
      await eventifyApi.revokeSession(id);
      showNotif(`Sesi pada perangkat "${device}" telah DILOGOUT paksa.`);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName) return;
    try {
      await eventifyApi.saveSubAdminRole({
        name: roleName,
        description: roleDescription,
        permissions: ['view_events', 'manage_tickets'],
      });
      showNotif(`Role sub-admin "${roleName}" berhasil dibuat!`);
      setRoleName('');
      setRoleDescription('');
      setIsRoleModalOpen(false);
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
      <div className="p-6 bg-neo-mint rounded-2xl border-3 border-neo-dark shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-space font-extrabold text-2xl md:text-3xl text-neo-dark flex items-center gap-3">
            <ShieldCheck size={32} /> Hak Akses, Keamanan & Audit Log
          </h1>
          <p className="font-jakarta font-semibold text-xs md:text-sm text-neo-dark/80 mt-1">
            Log jejak audit keamanan sistem, manajemen perizinan sub-admin, dan kontrol sesi login perangkat.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b-3 border-neo-dark pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl font-space font-extrabold text-xs uppercase cursor-pointer border-2.5 border-neo-dark ${
            activeTab === 'audit' ? 'bg-neo-yellow shadow-neo' : 'bg-white hover:bg-neo-bg'
          }`}
        >
          Audit Trail System ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-xl font-space font-extrabold text-xs uppercase cursor-pointer border-2.5 border-neo-dark ${
            activeTab === 'sessions' ? 'bg-neo-toska shadow-neo' : 'bg-white hover:bg-neo-bg'
          }`}
        >
          Sesi Login Aktif ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl font-space font-extrabold text-xs uppercase cursor-pointer border-2.5 border-neo-dark ${
            activeTab === 'roles' ? 'bg-neo-pink shadow-neo' : 'bg-white hover:bg-neo-bg'
          }`}
        >
          Role & Perizinan Sub-Admin ({roles.length})
        </button>
      </div>

      {/* TAB 1: AUDIT LOG */}
      {activeTab === 'audit' && (
        <Card className="bg-white border-3">
          <Table headers={['Waktu', 'Pengguna', 'Role', 'Tindakan Action', 'Target Objek', 'IP Address', 'Detail Log']}>
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-neo-yellow/15 transition-colors">
                <td className="px-4 py-3 border-r-2 border-neo-dark font-jakarta text-xs font-semibold">
                  {new Date(l.timestamp).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3 border-r-2 border-neo-dark font-space font-extrabold text-xs">{l.user_name}</td>
                <td className="px-4 py-3 border-r-2 border-neo-dark text-xs">
                  <Badge variant="yellow">{l.user_role}</Badge>
                </td>
                <td className="px-4 py-3 border-r-2 border-neo-dark font-space font-black text-xs uppercase">{l.action}</td>
                <td className="px-4 py-3 border-r-2 border-neo-dark font-jakarta text-xs font-bold">{l.target}</td>
                <td className="px-4 py-3 border-r-2 border-neo-dark font-jakarta text-xs">{l.ip_address}</td>
                <td className="px-4 py-3 font-jakarta text-xs text-gray-600">{l.details || '-'}</td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* TAB 2: SESI LOGIN AKTIF */}
      {activeTab === 'sessions' && (
        <Card className="bg-white border-3">
          <Table headers={['Perangkat & Browser', 'User Admin', 'IP Address & Lokasi', 'Aktivitas Terakhir', 'Status Sesi', 'Aksi Log Out']}>
            {sessions.map((s) => (
              <tr key={s.id} className="hover:bg-neo-yellow/15 transition-colors">
                <td className="px-4 py-3 border-r-2 border-neo-dark font-space font-extrabold text-xs flex items-center gap-2">
                  <Laptop size={18} /> {s.device}
                </td>
                <td className="px-4 py-3 border-r-2 border-neo-dark font-jakarta text-xs font-bold">{s.user_name}</td>
                <td className="px-4 py-3 border-r-2 border-neo-dark font-jakarta text-xs">{s.ip_address}</td>
                <td className="px-4 py-3 border-r-2 border-neo-dark font-jakarta text-xs">{s.last_active}</td>
                <td className="px-4 py-3 border-r-2 border-neo-dark text-xs">
                  <Badge variant={s.is_current ? 'mint' : 'yellow'}>{s.is_current ? 'PERANGKAT INI' : 'AKTIF'}</Badge>
                </td>
                <td className="px-4 py-3">
                  {!s.is_current && (
                    <Button onClick={() => handleRevokeSession(s.id, s.device)} variant="danger" size="sm" icon={<LogOut size={14} />}>
                      Force Logout
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {/* TAB 3: ROLE & PERMISSION */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsRoleModalOpen(true)} variant="primary">Tambah Sub-Admin Role</Button>
          </div>

          <Card className="bg-white border-3">
            <Table headers={['Nama Role', 'Deskripsi Matriks Perizinan', 'Akses Modul', 'Aksi Editor']}>
              {roles.map((r) => (
                <tr key={r.id} className="hover:bg-neo-yellow/15 transition-colors">
                  <td className="px-4 py-3 border-r-2 border-neo-dark font-space font-black text-xs">{r.name}</td>
                  <td className="px-4 py-3 border-r-2 border-neo-dark font-jakarta text-xs">{r.description}</td>
                  <td className="px-4 py-3 border-r-2 border-neo-dark text-xs">
                    <div className="flex flex-wrap gap-1">
                      {r.permissions.map((p) => (
                        <Badge key={p} variant="mint">{p}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="secondary" size="sm">Edit Perizinan</Button>
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )}

      {/* MODAL TAMBAH ROLE */}
      <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title="Tambah Role Sub-Admin Baru">
        <form onSubmit={handleAddRole} className="space-y-4">
          <Input label="Nama Role Sub-Admin" placeholder="e.g. Finance & Audit Admin" value={roleName} onChange={(e) => setRoleName(e.target.value)} required />
          <Input label="Deskripsi Wewenang" placeholder="e.g. Khusus mengakses laporan keuangan & payout" value={roleDescription} onChange={(e) => setRoleDescription(e.target.value)} required />
          <Button type="submit" variant="primary" className="w-full">Simpan Sub-Admin Role</Button>
        </form>
      </Modal>
    </div>
  );
};
