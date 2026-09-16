import React, { useState, useEffect } from 'react';
import { eventifyApi } from '../services/api';
import type { Order } from '../types';
import {
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

export const FinancePaymentPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [notification] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const ordData = await eventifyApi.getOrders();
      setOrders(ordData);
    } catch (err) {
      console.error(err);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  // Order gratis (total 0) dianggap otomatis PAID, gak perlu nunggu status dari backend
  const getDisplayStatus = (o: Order) => (o.total_amount === 0 ? 'paid' : o.status);

  return (
    <div className="space-y-6 font-jakarta">
      {/* Notification */}
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
            Keuangan & Transaksi
          </h1>
        </div>
      </div>

      {/* TABLE TRANSAKSI */}
      <Card className="bg-white border-3">
        <Table
          headers={[
            { label: 'Kode Order', align: 'left', className: 'w-[16%]' },
            { label: 'Customer', align: 'left', className: 'w-[22%]' },
            { label: 'Event', align: 'left', className: 'w-[22%]' },
            { label: 'Metode Bayar', align: 'center', className: 'w-[12%]' },
            { label: 'Total Pembayaran', align: 'center', className: 'w-[14%]' },
            { label: 'Status', align: 'center', className: 'w-[10%]' },
            { label: 'Aksi', align: 'center', className: 'w-[10%]' },
          ]}
        >
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-neo-yellow/10 transition-colors border-b border-neo-dark/20">
              <td className="px-4 py-3.5 border-r-2 border-neo-dark font-space font-extrabold text-xs align-middle">{o.order_code}</td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark align-middle font-jakarta text-xs">
                <p className="font-bold text-neo-dark">{o.user_name}</p>
                <p className="text-[11px] text-gray-500 font-semibold">{o.user_email}</p>
              </td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark font-space font-bold text-xs align-middle">{o.event_title}</td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle font-space font-bold text-xs uppercase">{o.payment_method}</td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle font-space font-black text-xs text-neo-dark">{formatRupiah(o.total_amount)}</td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle">
                <Badge
                  variant={getDisplayStatus(o) === 'paid' ? 'mint' : getDisplayStatus(o) === 'refunded' ? 'pink' : 'yellow'}
                  className="inline-flex justify-center min-w-[80px]"
                >
                  {getDisplayStatus(o).toUpperCase()}
                </Badge>
              </td>
              <td className="px-4 py-3.5 text-center align-middle">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => {
                      setSelectedOrder(o);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="p-1.5 px-3 bg-white rounded-xl border-2 border-neo-dark shadow-neo-sm hover:bg-neo-toska transition-all cursor-pointer flex items-center gap-1 font-space text-[11px] font-extrabold"
                  >
                    <Eye size={14} /> Pratinjau
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {/* MODAL PRATINJAU INVOICE */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title={`Invoice: ${selectedOrder?.order_code}`}>
        {selectedOrder && (
          <div className="p-4 bg-white rounded-xl border-2.5 border-neo-dark space-y-4 font-jakarta text-xs">
            <div className="flex justify-between items-center border-b-2 border-neo-dark pb-3">
              <div>
                <h4 className="font-space font-black text-base text-neo-dark">EVENTIFY OFFICIAL INVOICE</h4>
                <p className="text-gray-500">No. Inv: {selectedOrder.order_code}</p>
              </div>
              <Badge variant="mint">LUNAS / PAID</Badge>
            </div>
            <div className="space-y-1">
              <p><strong>Customer:</strong> {selectedOrder.user_name} ({selectedOrder.user_email})</p>
              <p><strong>Event:</strong> {selectedOrder.event_title}</p>
              <p><strong>Metode Bayar:</strong> {selectedOrder.payment_method.toUpperCase()}</p>
              <p><strong>Waktu Bayar:</strong> {new Date(selectedOrder.created_at).toLocaleString('id-ID')}</p>
            </div>
            <div className="p-3 bg-neo-bg rounded-lg border-2 border-neo-dark font-space font-bold flex justify-between">
              <span>TOTAL DIBAYAR:</span>
              <span className="text-sm text-neo-dark">{formatRupiah(selectedOrder.total_amount)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};