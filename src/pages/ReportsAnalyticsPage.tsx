import React, { useState, useEffect } from 'react';
import { eventifyApi } from '../services/api';
import type { EventItem, User } from '../types';
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

export const ReportsAnalyticsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [organizers, setOrganizers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [evtData, userData] = await Promise.all([
        eventifyApi.getEvents(),
        eventifyApi.getUsers(),
      ]);
      setEvents(evtData);
      setOrganizers(userData.filter((u) => u.role === 'organizer'));
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
          <h3 className="font-space font-extrabold text-base text-neo-dark mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Penjualan Tiket Per Event
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={events.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" fontSize={10} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="sold_tickets" fill="#FFDC00" stroke="#2B2630" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
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
            { label: 'Peringkat', align: 'center', className: 'w-[12%]' },
            { label: 'Nama Instansi Panitia', align: 'left', className: 'w-[30%]' },
            { label: 'Penanggung Jawab', align: 'left', className: 'w-[28%]' },
            { label: 'Total Event Dikelola', align: 'center', className: 'w-[16%]' },
            { label: 'Tingkat Kehadiran', align: 'center', className: 'w-[14%]' },
          ]}
        >
          {organizers.map((o, idx) => (
            <tr key={o.id} className="hover:bg-neo-yellow/10 transition-colors border-b border-neo-dark/20">
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle font-space font-black text-xs">#{idx + 1}</td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark align-middle font-space font-extrabold text-xs">{o.organization || 'Instansi Panitia'}</td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark align-middle font-jakarta text-xs font-bold text-neo-dark">{o.name}</td>
              <td className="px-4 py-3.5 border-r-2 border-neo-dark text-center align-middle font-space font-bold text-xs">{o.managed_events_count ?? 0} Event</td>
              <td className="px-4 py-3.5 text-center align-middle">
                <Badge variant="mint" className="inline-flex justify-center min-w-[85px]">96.4% OK</Badge>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};