import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/api';
import { Loader2, AlertTriangle, CheckCircle, RefreshCw, Send, Plus } from 'lucide-react';

interface EventItem {
  id: string;
  title: string;
  category: string;
  price: number;
  status: string;
}

export const ApiDemoComponent: React.FC = () => {
  // State untuk GET Data
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingGet, setLoadingGet] = useState<boolean>(false);
  const [errorGet, setErrorGet] = useState<string | null>(null);

  // State untuk POST Data (Form)
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Teknologi');
  const [price, setPrice] = useState(150000);
  const [loadingPost, setLoadingPost] = useState<boolean>(false);
  const [errorPost, setErrorPost] = useState<string | null>(null);
  const [successPost, setSuccessPost] = useState<string | null>(null);

  // 1. Fungsi GET Data dari API Golang
  const fetchEvents = async () => {
    setLoadingGet(true);
    setErrorGet(null);

    try {
      const response = await apiClient.get('/admin/events');
      // Format response backend biasanya: { success: true, data: [...] } atau array langsung
      const resultData = response.data.data || response.data;
      setEvents(Array.isArray(resultData) ? resultData : []);
    } catch (err: any) {
      if (err.response) {
        // Response error dari server (4xx, 5xx)
        const status = err.response.status;
        const msg = err.response.data?.message || err.response.data?.error || 'Gagal mengambil data dari server.';
        
        if (status === 401) {
          setErrorGet('401 Unauthorized: Sesi login berakhir. Silakan login kembali.');
        } else if (status === 500) {
          setErrorGet('500 Server Error: Terjadi kesalahan internal pada backend Golang.');
        } else {
          setErrorGet(`Error [${status}]: ${msg}`);
        }
      } else if (err.request) {
        // Tidak ada response (Koneksi putus / CORS blocked / Server Down)
        setErrorGet('Gagal terhubung ke API VPS (Koneksi terputus atau masalah CORS).');
      } else {
        setErrorGet(err.message || 'Terjadi kesalahan tidak terduga.');
      }
    } finally {
      setLoadingGet(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 2. Fungsi POST Data ke API Golang
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoadingPost(true);
    setErrorPost(null);
    setSuccessPost(null);

    const payload = {
      title,
      category,
      price: Number(price),
      status: 'published',
    };

    try {
      const response = await apiClient.post('/admin/events', payload);
      setSuccessPost(`Event "${title}" berhasil ditambahkan ke API Golang!`);
      setTitle('');

      // Update state lokal atau refetch
      const createdItem = response.data.data || response.data;
      if (createdItem && createdItem.id) {
        setEvents((prev) => [createdItem, ...prev]);
      } else {
        fetchEvents();
      }
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        const msg = err.response.data?.message || err.response.data?.error || 'Gagal menyimpan data.';
        setErrorPost(`[${status}] ${msg}`);
      } else if (err.request) {
        setErrorPost('Gagal mengirim data: Server backend tidak merespon (Network / CORS Error).');
      } else {
        setErrorPost(err.message || 'Terjadi kesalahan saat submit form.');
      }
    } finally {
      setLoadingPost(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-800">
      <header className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <span>⚡</span> Integrasi API Backend Golang (Eventify)
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Endpoint VPS: <code className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded text-xs">http://139.190.96.203:8093/api/v1</code>
        </p>
      </header>

      {/* SECTION 1: Form POST Data */}
      <section className="bg-slate-800/50 p-5 rounded-lg border border-slate-700/60">
        <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
          <Plus className="w-5 h-5 text-emerald-400" /> Form Tambah Event (POST Method)
        </h3>

        {/* Success Alert */}
        {successPost && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successPost}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorPost && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-500/50 text-rose-300 text-sm rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <span>{errorPost}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Judul Event</label>
            <input
              type="text"
              required
              placeholder="Contoh: Golang & React Conference"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Kategori</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Teknologi">Teknologi</option>
              <option value="Musik">Musik</option>
              <option value="Bisnis">Bisnis</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Harga (IDR)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={loadingPost}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loadingPost ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Kirim Data (POST)
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* SECTION 2: Table Data GET */}
      <section className="bg-slate-800/50 p-5 rounded-lg border border-slate-700/60">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>📋</span> Daftar Event (GET Method)
          </h3>
          <button
            onClick={fetchEvents}
            disabled={loadingGet}
            className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingGet ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Loading State */}
        {loadingGet && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="text-sm font-medium">Mengambil data dari API VPS Golang...</span>
          </div>
        )}

        {/* Error State */}
        {!loadingGet && errorGet && (
          <div className="p-4 bg-rose-950/80 border border-rose-500/50 text-rose-300 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Gagal Memuat Data</p>
              <p className="text-xs mt-1 text-rose-200/80">{errorGet}</p>
            </div>
          </div>
        )}

        {/* Data Success State */}
        {!loadingGet && !errorGet && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/60 text-xs text-slate-400 uppercase">
                  <th className="p-3">ID</th>
                  <th className="p-3">Judul Event</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Harga</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-6 text-slate-500 text-sm">
                      Belum ada data event dari API.
                    </td>
                  </tr>
                ) : (
                  events.map((item) => (
                    <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-xs text-cyan-400">{item.id}</td>
                      <td className="p-3 font-medium text-white">{item.title}</td>
                      <td className="p-3 text-slate-300">{item.category}</td>
                      <td className="p-3 text-slate-300">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price || 0)}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-xs rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {item.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
