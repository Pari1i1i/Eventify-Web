import React, { useState, useEffect } from 'react';
import { eventifyApi } from '../services/api';
import type { DashboardStats } from '../types';
import {
  Calendar,
  Users,
  DollarSign,
  Ticket,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const DashboardOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await eventifyApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Gagal mengambil data dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Format ringkas buat label sumbu Y, misal 600000 -> "600rb", 2500000 -> "2.5jt"
  const formatCompactRupiah = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(num % 1000000 === 0 ? 0 : 1)}jt`;
    if (num >= 1000) return `${Math.round(num / 1000)}rb`;
    return num.toString();
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="p-4 bg-neo-yellow border-3 border-neo-dark rounded-xl shadow-neo font-space font-extrabold flex items-center gap-3 animate-pulse">
          <span>Memuat Dashboard Overview...</span>
        </div>
      </div>
    );
  }

  const chartData = stats.daily_transactions || [];
  const hasSparseData = chartData.length > 0 && chartData.length < 3;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-neo-yellow rounded-2xl border-3 border-neo-dark shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-space font-extrabold text-2xl md:text-3xl text-neo-dark">
            Dashboard System
          </h1>
        </div>

        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-white text-neo-dark rounded-xl border-2.5 border-neo-dark shadow-neo-sm font-space font-extrabold text-xs uppercase hover:bg-neo-mint transition-all flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
        >
          Refresh Data
        </button>
      </div>

      {/* Metric Cards & Action Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Event Aktif"
          value={stats.active_events.toString()}
          icon={<Calendar size={24} />}
          badgeText="Event"
          color="mint"
        />
        <StatCard
          title="Total Pendapatan"
          value={formatRupiah(stats.total_revenue)}
          icon={<DollarSign size={24} />}
          badgeText="Finansial"
          color="yellow"
        />
        <StatCard
          title="Tiket Terjual"
          value={stats.tickets_sold.toLocaleString('id-ID')}
          icon={<Ticket size={24} />}
          badgeText="Tiket"
          color="toska"
        />
        <StatCard
          title="Pengguna & Panitia"
          value={stats.total_users.toString()}
          subtitle={`${Math.max(0, stats.total_users - stats.total_organizers)} Pembeli, ${stats.total_organizers} Panitia`}
          icon={<Users size={24} />}
          badgeText="Pengguna"
          color="pink"
        />
      </div>

      {/* Grafik Pendapatan & Penjualan Tiket */}
      <Card className="bg-white border-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-neo-mint border-2 border-neo-dark inline-block" />
            <h3 className="font-space font-extrabold text-lg text-neo-dark">
              Grafik Pendapatan & Penjualan Tiket
            </h3>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-neo-bg rounded-xl border-2 border-neo-dark">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg font-space font-extrabold text-xs uppercase transition-all cursor-pointer ${period === p
                    ? 'bg-neo-yellow text-neo-dark shadow-neo-sm border-1.5 border-neo-dark'
                    : 'text-gray-600 hover:text-neo-dark'
                  }`}
              >
                {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </button>
            ))}
          </div>
        </div>

        {hasSparseData && (
          <p className="font-jakarta text-[11px] text-gray-500 font-semibold mb-3">
            Grafik akan makin detail begitu ada transaksi di lebih banyak tanggal.
          </p>
        )}

        <div className="h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 16, right: 16, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#30E3B2" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#30E3B2" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#2B2630"
                  fontSize={12}
                  tick={{ fontWeight: 700 }}
                  tickLine={false}
                  axisLine={{ stroke: '#2B2630', strokeWidth: 2 }}
                  padding={{ left: 24, right: 24 }}
                />
                <YAxis
                  stroke="#2B2630"
                  fontSize={12}
                  tick={{ fontWeight: 700 }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  domain={[0, (max: number) => Math.max(max * 1.3, 200000)]}
                  tickFormatter={(val) => formatCompactRupiah(Number(val))}
                />
                <Tooltip
                  formatter={(val: any) => [formatRupiah(Number(val)), 'Pendapatan']}
                  labelStyle={{ fontWeight: 800, color: '#2B2630', marginBottom: 4 }}
                  cursor={{ stroke: '#2B2630', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                  contentStyle={{
                    backgroundColor: '#FFFDF5',
                    borderColor: '#2B2630',
                    borderWidth: '2px',
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    boxShadow: '3px 3px 0px #2B2630',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2B2630"
                  strokeWidth={3}
                  strokeLinecap="round"
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  dot={{ r: 5, fill: '#30E3B2', stroke: '#2B2630', strokeWidth: 2 }}
                  activeDot={{ r: 7, fill: '#FFDC00', stroke: '#2B2630', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-neo-bg/50 rounded-xl border-2 border-dashed border-neo-dark/40 text-center p-6">
              <p className="font-space font-extrabold text-sm text-neo-dark uppercase">Belum Ada Data Grafik</p>
            </div>
          )}
        </div>
      </Card>



      {/* Section: Pesanan Tiket Terbaru */}
      <Card className="bg-white border-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-space font-extrabold text-base text-neo-dark">
            Order Tiket Terbaru
          </h3>
        </div>
        <div className="space-y-3">
          {stats.recent_orders && stats.recent_orders.length > 0 ? (
            stats.recent_orders.map((ord) => {
              const isPaid = ord.status === 'paid';
              const isPending = ord.status === 'pending';
              return (
                <div
                  key={ord.id}
                  className="p-3 bg-neo-bg rounded-xl border-2 border-neo-dark flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-space font-extrabold text-neo-dark">{ord.order_code}</p>
                    <p className="font-jakarta font-semibold text-gray-600 truncate max-w-[300px]">
                      {ord.user_name} • {ord.event_title}
                    </p>
                  </div>
                  {/* <div className="text-right flex flex-col items-end gap-1">
                    <p className="font-space font-bold text-neo-dark">{formatRupiah(ord.total_amount)}</p>
                    <Badge variant={isPaid ? 'mint' : isPending ? 'yellow' : 'pink'}>
                      {ord.status ? ord.status.toUpperCase() : 'PENDING'}
                    </Badge>
                  </div> */}
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs font-semibold text-gray-500">
              Belum ada transaksi order tiket.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};