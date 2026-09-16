import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Eye,
  CreditCard,
  QrCode,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { Order } from '../types';
import { eventifyApi } from '../services/api';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

export const OrderMonitoringPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Selected order for detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await eventifyApi.getOrders();
      setOrders(data);
    } catch (e) {
      console.error('Failed fetching orders', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.event_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || ord.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // CSV Export Feature
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;

    const headers = [
      'Kode Order',
      'Nama Pembeli',
      'Email Pembeli',
      'Judul Event',
      'Total Harga (IDR)',
      'Metode Pembayaran',
      'Status Pembayaran',
      'Waktu Transaksi',
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.order_code}"`,
      `"${o.user_name}"`,
      `"${o.user_email}"`,
      `"${o.event_title.replace(/"/g, '""')}"`,
      o.total_amount,
      `"${o.payment_method.toUpperCase()}"`,
      `"${o.status.toUpperCase()}"`,
      `"${new Date(o.created_at).toLocaleString('id-ID')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Eventify_Order_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-jakarta">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-space font-extrabold text-2xl lg:text-3xl text-neo-dark tracking-tight flex items-center gap-3">
            <Receipt size={32} className="text-neo-dark" /> MONITORING TRANSAKSI TIKET
          </h1>
          <p className="font-jakarta text-xs font-semibold text-gray-600 mt-1">
            Pengawasan pesanan real-time, rincian pembayaran QRIS/VA, & ekspor laporan CSV
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Download size={18} />}
          onClick={handleExportCSV}
          disabled={filteredOrders.length === 0}
        >
          Export CSV ({filteredOrders.length})
        </Button>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-white rounded-2xl border-3 border-neo-dark shadow-neo flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="w-full md:w-80">
          <Input
            placeholder="Cari kode order, nama pembeli, event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="font-space font-extrabold text-xs uppercase text-neo-dark shrink-0 flex items-center gap-1">
            <Filter size={14} /> Status:
          </span>
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'paid', label: 'Paid' },
            { id: 'pending', label: 'Pending' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg border-2 border-neo-dark font-space font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-neo-pink shadow-neo-sm text-neo-dark translate-y-[-1px]'
                  : 'bg-white hover:bg-neo-gray text-neo-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="p-8 text-center bg-white rounded-xl border-3 border-neo-dark shadow-neo font-space font-extrabold animate-pulse">
          Memuat Daftar Pesanan Tiket...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border-3 border-neo-dark shadow-neo">
          <Receipt size={48} className="mx-auto text-gray-400 mb-2" />
          <h3 className="font-space font-extrabold text-lg text-neo-dark">
            Tidak ada transaksi yang cocok
          </h3>
          <p className="font-jakarta text-xs text-gray-500 mt-1">
            Silakan ubah filter status atau pencarian kata kunci.
          </p>
        </div>
      ) : (
        <Table
          headers={[
            'Kode Order & Waktu',
            'Pembeli',
            'Judul Event',
            'Total Harga',
            'Metode Bayar',
            'Status',
            'Rincian',
          ]}
        >
          {filteredOrders.map((ord) => (
            <tr key={ord.id} className="hover:bg-neo-pink/10 transition-colors">
              {/* Kode Order & Waktu */}
              <td className="px-4 py-3 font-jakarta text-xs border-r-2 border-neo-dark">
                <span className="font-space font-extrabold text-xs text-neo-dark block">
                  {ord.order_code}
                </span>
                <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">
                  {new Date(ord.created_at).toLocaleString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </td>

              {/* Pembeli */}
              <td className="px-4 py-3 font-jakarta text-xs text-neo-dark border-r-2 border-neo-dark">
                <p className="font-bold">{ord.user_name}</p>
                <span className="text-[11px] text-gray-500 font-medium">
                  {ord.user_email}
                </span>
              </td>

              {/* Judul Event */}
              <td className="px-4 py-3 font-jakarta text-xs font-bold text-neo-dark border-r-2 border-neo-dark max-w-[200px] truncate">
                {ord.event_title}
              </td>

              {/* Total Harga */}
              <td className="px-4 py-3 font-space font-extrabold text-xs text-neo-dark border-r-2 border-neo-dark">
                {formatRupiah(ord.total_amount)}
              </td>

              {/* Metode Bayar */}
              <td className="px-4 py-3 border-r-2 border-neo-dark">
                <span className="font-space font-extrabold text-xs px-2.5 py-1 rounded bg-neo-gray border border-neo-dark uppercase flex items-center gap-1.5 w-max">
                  {ord.payment_method === 'qris' ? (
                    <QrCode size={14} />
                  ) : (
                    <Building2 size={14} />
                  )}
                  {ord.payment_method.replace('_', ' ')}
                </span>
              </td>

              {/* Status Badge */}
              <td className="px-4 py-3 border-r-2 border-neo-dark">
                <Badge
                  variant={
                    ord.status === 'paid'
                      ? 'mint'
                      : ord.status === 'pending'
                      ? 'yellow'
                      : 'pink'
                  }
                >
                  {ord.status.toUpperCase()}
                </Badge>
              </td>

              {/* Rincian Modal Button */}
              <td className="px-4 py-3">
                <button
                  onClick={() => {
                    setSelectedOrder(ord);
                    setShowDetailModal(true);
                  }}
                  className="p-1.5 bg-neo-yellow rounded-lg border-2 border-neo-dark hover:bg-yellow-300 transition-all cursor-pointer shadow-neo-sm"
                  title="Lihat Detail Transaksi"
                >
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Detail Transaksi: ${selectedOrder?.order_code || ''}`}
        maxWidth="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            {/* Status Header Banner */}
            <div
              className={`p-4 rounded-xl border-2.5 border-neo-dark flex items-center justify-between ${
                selectedOrder.status === 'paid'
                  ? 'bg-neo-mint'
                  : selectedOrder.status === 'pending'
                  ? 'bg-neo-yellow'
                  : 'bg-neo-pink'
              }`}
            >
              <div>
                <span className="font-space font-extrabold text-xs uppercase tracking-wider text-neo-dark">
                  Status Pembayaran:
                </span>
                <h4 className="font-space font-extrabold text-xl text-neo-dark uppercase flex items-center gap-2">
                  {selectedOrder.status === 'paid' ? (
                    <CheckCircle size={22} />
                  ) : selectedOrder.status === 'pending' ? (
                    <Clock size={22} />
                  ) : (
                    <XCircle size={22} />
                  )}
                  {selectedOrder.status.toUpperCase()}
                </h4>
              </div>
              <div className="text-right">
                <span className="font-space font-bold text-xs text-neo-dark">
                  Total Tagihan:
                </span>
                <p className="font-space font-extrabold text-xl text-neo-dark">
                  {formatRupiah(selectedOrder.total_amount)}
                </p>
              </div>
            </div>

            {/* Buyer & Event Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-white rounded-xl border-2 border-neo-dark shadow-neo-sm">
                <h5 className="font-space font-extrabold text-xs uppercase text-neo-dark mb-1">
                  👤 Informasi Pembeli
                </h5>
                <p className="font-jakarta text-sm font-bold text-neo-dark">
                  {selectedOrder.user_name}
                </p>
                <p className="font-jakarta text-xs text-gray-600 font-semibold">
                  {selectedOrder.user_email}
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border-2 border-neo-dark shadow-neo-sm">
                <h5 className="font-space font-extrabold text-xs uppercase text-neo-dark mb-1">
                  🎉 Event Terkait
                </h5>
                <p className="font-jakarta text-sm font-bold text-neo-dark">
                  {selectedOrder.event_title}
                </p>
                <span className="font-jakarta text-xs text-gray-600 font-semibold">
                  Waktu: {new Date(selectedOrder.created_at).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Ticket Items Breakdown Table */}
            <div>
              <h5 className="font-space font-extrabold text-xs uppercase text-neo-dark mb-2">
                🎟️ Rincian Item Tiket Dibeli
              </h5>
              <div className="space-y-2">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neo-bg rounded-lg border-2 border-neo-dark flex items-center justify-between font-jakarta text-xs"
                  >
                    <div>
                      <span className="font-bold text-neo-dark text-sm block">
                        {item.ticket_tier_name}
                      </span>
                      <span className="text-gray-600 font-semibold">
                        {item.quantity} x {formatRupiah(item.price_per_item)}
                      </span>
                    </div>
                    <span className="font-space font-extrabold text-sm text-neo-dark">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Gateway Information (QRIS / Virtual Account) */}
            <div className="p-4 bg-neo-yellow/25 rounded-xl border-2 border-neo-dark space-y-2">
              <h5 className="font-space font-extrabold text-xs uppercase text-neo-dark flex items-center gap-1.5">
                <CreditCard size={16} /> Data Pembayaran ({selectedOrder.payment_method.toUpperCase()})
              </h5>
              {selectedOrder.payment_details.qris_url && (
                <div className="flex items-center gap-4 pt-2">
                  <img
                    src={selectedOrder.payment_details.qris_url}
                    alt="QRIS Code"
                    className="w-24 h-24 rounded border-2 border-neo-dark bg-white"
                  />
                  <div>
                    <span className="font-space font-extrabold text-xs text-neo-dark block">
                      Kode QRIS Aktif
                    </span>
                    <p className="font-jakarta text-xs text-gray-600 font-semibold mt-1">
                      Peserta melakukan pemindaian melalui aplikasi m-banking atau e-wallet.
                    </p>
                  </div>
                </div>
              )}

              {selectedOrder.payment_details.va_number && (
                <div className="pt-2">
                  <span className="font-space font-extrabold text-xs text-neo-dark">
                    Nomor Virtual Account:
                  </span>
                  <p className="font-space font-extrabold text-lg bg-white px-3 py-1.5 rounded border-2 border-neo-dark w-max mt-1 text-neo-dark tracking-wider">
                    {selectedOrder.payment_details.va_number}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t-2 border-neo-dark flex justify-end">
              <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                Tutup Detail Transaksi
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
