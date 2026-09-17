import React, { useState, useEffect } from 'react';
import { eventifyApi, orderTicketQty, orderCheckedInQty, isActiveOrder } from '../services/api';
import type { EventItem } from '../types';
import {
  PieChart as PieIcon,
  Award,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table } from '../components/ui/Table';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface LeaderboardRow {
  id: string;
  organization: string;
  name: string;
  managedEvents: number;
  totalTickets: number;
  checkedIn: number;
  attendanceRate: number;
  topEvent: { title: string; checkedIn: number } | null;
}

export const ReportsAnalyticsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventSales, setEventSales] = useState<{ title: string; sold_tickets: number }[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [evtData, userData, orderData] = await Promise.all([
        eventifyApi.getEvents(),
        eventifyApi.getUsers(),
        eventifyApi.getOrders(),
      ]);

      // Hitung tiket terjual & tiket HADIR (check-in) per event dari ORDER AKTIF.
      // Dikelompokkan langsung dari order, jadi totalnya PASTI sama dengan Dashboard.
      const titleByEvent: Record<string, string> = {};
      evtData.forEach((e) => { titleByEvent[e.id] = e.title; });

      const soldByEvent: Record<string, { title: string; sold_tickets: number }> = {};
      const attendanceByEvent: Record<string, { total: number; checkedIn: number }> = {};
      orderData.filter(isActiveOrder).forEach((o) => {
        const key = o.event_id || 'unknown';
        if (!soldByEvent[key]) {
          soldByEvent[key] = { title: titleByEvent[key] || o.event_title || 'Event', sold_tickets: 0 };
        }
        soldByEvent[key].sold_tickets += orderTicketQty(o);

        if (!attendanceByEvent[key]) attendanceByEvent[key] = { total: 0, checkedIn: 0 };
        attendanceByEvent[key].total += orderTicketQty(o);
        attendanceByEvent[key].checkedIn += orderCheckedInQty(o);
      });

      setEventSales(
        Object.values(soldByEvent)
          .filter((s) => s.sold_tickets > 0)
          .sort((a, b) => b.sold_tickets - a.sold_tickets)
      );
      setEvents(evtData.map((e) => ({ ...e, sold_tickets: soldByEvent[e.id]?.sold_tickets ?? 0 })));

      // Leaderboard: tingkat kehadiran = tiket check-in / total tiket pada event milik organizer tsb.
      const rows: LeaderboardRow[] = userData
        .filter((u) => u.role === 'organizer')
        .map((org) => {
          const orgEvents = evtData.filter((e) => e.organizer_id === org.id);
          let totalTickets = 0;
          let checkedIn = 0;
          let topEvent: { title: string; checkedIn: number } | null = null;
          for (const e of orgEvents) {
            const stat = attendanceByEvent[e.id];
            if (!stat) continue;
            totalTickets += stat.total;
            checkedIn += stat.checkedIn;
            if (!topEvent || stat.checkedIn > topEvent.checkedIn) {
              topEvent = { title: e.title, checkedIn: stat.checkedIn };
            }
          }
          return {
            id: org.id,
            organization: org.organization || org.name || 'Instansi Panitia',
            name: org.name,
            managedEvents: orgEvents.length,
            totalTickets,
            checkedIn,
            attendanceRate: totalTickets > 0 ? (checkedIn / totalTickets) * 100 : 0,
            topEvent: topEvent && topEvent.checkedIn > 0 ? topEvent : null,
          };
        })
        .sort((a, b) => b.attendanceRate - a.attendanceRate || b.checkedIn - a.checkedIn);

      setLeaderboard(rows);
    } catch (err) {
      console.error(err);
    }
  };

  const escapeXml = (val: string) =>
    val.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const exportReportExcel = () => {
    // Format Spreadsheet XML asli biar rapi di Excel: header berwarna, lebar kolom diatur, tipe data benar
    const xmlRows = events
      .map(
        (e) => `
      <Row>
        <Cell><Data ss:Type="String">${escapeXml(e.title)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(e.organizer_name)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(e.category)}</Data></Cell>
        <Cell><Data ss:Type="Number">${e.sold_tickets}</Data></Cell>
        <Cell><Data ss:Type="Number">${e.total_quota}</Data></Cell>
        <Cell><Data ss:Type="Number">${e.sold_tickets * 150000}</Data></Cell>
      </Row>`
      )
      .join('');

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
 <Worksheet ss:Name="Laporan Analitik Eventify">
  <Table>
   <Column ss:Width="220"/>
   <Column ss:Width="180"/>
   <Column ss:Width="120"/>
   <Column ss:Width="110"/>
   <Column ss:Width="100"/>
   <Column ss:Width="130"/>
   <Row ss:StyleID="Header">
    <Cell><Data ss:Type="String">Judul Event</Data></Cell>
    <Cell><Data ss:Type="String">Penyelenggara</Data></Cell>
    <Cell><Data ss:Type="String">Kategori</Data></Cell>
    <Cell><Data ss:Type="String">Tiket Terjual</Data></Cell>
    <Cell><Data ss:Type="String">Total Quota</Data></Cell>
    <Cell><Data ss:Type="String">Omset Event</Data></Cell>
   </Row>
   ${xmlRows}
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Eventify_Laporan_Analitik_${Date.now()}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Hitung Distribusi Kategori Event secara dinamis dari data event riil
  const categoryCounts = events.reduce((acc, evt) => {
    const cat = evt.category || 'Lainnya';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryChartData = Object.keys(categoryCounts).map((catName) => ({
    name: catName,
    value: categoryCounts[catName],
  }));

  const COLORS = ['#30E3B2', '#FFDC00', '#FF80BF', '#4D96FF', '#A78BFA', '#F97316'];

  // Data penjualan tiket per event (semua event, urut terbanyak) — totalnya sama dengan Dashboard.
  const eventSalesData = eventSales;
  const totalSoldTickets = eventSalesData.reduce((sum, e) => sum + e.sold_tickets, 0);

  return (
    <div className="space-y-6 font-jakarta">
      {/* Header Banner Clean */}
      <div className="p-6 bg-neo-toska rounded-2xl border-3 border-neo-dark shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-space font-extrabold text-2xl md:text-3xl text-neo-dark">
            Laporan
          </h1>
        </div>

        <Button onClick={exportReportExcel} variant="secondary" icon={<FileSpreadsheet size={16} />}>
          Export Data Excel
        </Button>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Performa Penjualan Tiket Per Event */}
        <Card className="bg-white border-3">
          <h3 className="font-space font-extrabold text-base text-neo-dark mb-4 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2"><TrendingUp size={18} /> Penjualan Tiket Per Event</span>
            <span className="font-space font-extrabold text-xs px-2.5 py-1 rounded-full bg-neo-yellow border-2 border-neo-dark">
              Total {totalSoldTickets} Tiket
            </span>
          </h3>
          <div className="h-72 w-full">
            {eventSalesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={eventSalesData} layout="vertical" margin={{ top: 4, right: 28, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" fontSize={11} tickLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={158}
                    fontSize={10}
                    tickLine={false}
                    tick={{ fontWeight: 700 }}
                    tickFormatter={(v: string) => (v.length > 22 ? `${v.slice(0, 22)}…` : v)}
                  />
                  <Tooltip formatter={(val: any) => [`${val} Tiket`, 'Terjual']} />
                  <Bar dataKey="sold_tickets" fill="#FFDC00" stroke="#2B2630" strokeWidth={2} radius={[0, 6, 6, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <p className="font-space font-extrabold text-xs text-neo-dark uppercase">Belum Ada Penjualan Tiket</p>
              </div>
            )}
          </div>
        </Card>

        {/* Chart Demografi Kategori */}
        <Card className="bg-white border-3">
          <h3 className="font-space font-extrabold text-base text-neo-dark mb-4 flex items-center gap-2">
            <PieIcon size={18} /> Distribusi Kategori Event
          </h3>
          <div className="h-64 w-full flex items-center justify-center">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  >
                    {categoryChartData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#2B2630" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`${val} Event`, 'Jumlah Event']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <p className="font-space font-extrabold text-xs text-neo-dark uppercase">Belum Ada Data Kategori Event</p>
                <p className="font-jakarta text-[11px] text-gray-500 font-semibold mt-1">Diagram akan menghitung secara otomatis begitu event riil ditambahkan.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Leaderboard Panitia Terlaris */}
      <Card className="bg-white border-3">
        <h3 className="font-space font-extrabold text-base text-neo-dark mb-4 flex items-center gap-2">
          <Award size={20} className="text-neo-dark" /> Leaderboard Panitia / Organizer Terbaik
        </h3>
        <Table
          headers={[
            { label: 'Peringkat', align: 'center', className: 'w-[10%]' },
            { label: 'Nama Instansi Panitia', align: 'left', className: 'w-[26%]' },
            { label: 'Total Event Dikelola', align: 'center', className: 'w-[14%]' },
            { label: 'Event Paling Dihadiri', align: 'left', className: 'w-[18%]' },
            { label: 'Tingkat Kehadiran', align: 'center', className: 'w-[12%]' },
          ]}
        >
          {leaderboard.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-xs font-semibold text-gray-500">
                Belum ada data organizer.
              </td>
            </tr>
          ) : (
            leaderboard.map((row, idx) => (
              <tr key={row.id} className="hover:bg-neo-yellow/10 transition-colors border-b border-neo-dark/20">
                <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle font-space font-black text-xs">#{idx + 1}</td>
                <td className="px-4 py-3.5 border-r-2 border-neo-dark align-middle font-space font-extrabold text-xs">{row.organization}</td>
                <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle font-space font-bold text-xs">{row.managedEvents} Event</td>
                <td className="px-4 py-3.5 border-r-2 border-neo-dark align-middle font-jakarta text-[11px] text-gray-700">
                  {row.topEvent ? (
                    <>
                      <span className="font-bold text-neo-dark">{row.topEvent.title}</span>
                      <span className="block text-gray-500 font-semibold">{row.topEvent.checkedIn} tiket hadir</span>
                    </>
                  ) : (
                    <span className="text-gray-400 font-semibold">Belum ada kehadiran</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-center align-middle">
                  <div className="inline-flex flex-col items-center gap-1">
                    <Badge
                      variant={row.attendanceRate >= 50 ? 'mint' : row.attendanceRate > 0 ? 'yellow' : 'pink'}
                      className="min-w-[72px] justify-center"
                    >
                      {row.attendanceRate.toFixed(1)}%
                    </Badge>
                    <span className="font-jakarta text-[10px] font-semibold text-gray-500">
                      {row.checkedIn}/{row.totalTickets} tiket
                    </span>
                  </div>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </div>
  );
};