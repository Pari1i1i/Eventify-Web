# Eventify Web Admin

Dashboard manajemen berbasis web untuk platform **Eventify** — mengelola organizer, user, event, tiket, kehadiran, keuangan, laporan, notifikasi, keamanan, dan pengaturan sistem.

Dibangun dengan **React + TypeScript + Vite**, Tailwind CSS gaya **Neobrutalism**, menggunakan Axios untuk komunikasi API backend (EventifyApi).

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — build tool & dev server
- **Tailwind CSS** — styling neobrutalism
- **React Router DOM** — routing SPA
- **Axios** — HTTP client
- **Recharts** — grafik dashboard
- **Lucide React** — ikon
- **Oxlint** — linter

## Modul (10 Halaman)

| # | Route                   | Fungsi                                                     |
| - | ----------------------- | ---------------------------------------------------------- |
| 1 | `/admin/dashboard`      | Statistik utama: pendapatan, tiket terjual, kehadiran, grafik |
| 2 | `/admin/organizers`     | Manajemen instansi panitia / organizer                      |
| 3 | `/admin/users`          | Manajemen user & peserta                                   |
| 4 | `/admin/events`         | Manajemen event & approval (publish/draft/ended)           |
| 5 | `/admin/tickets`        | Pendaftaran & tiket, check-in peserta                      |
| 6 | `/admin/finance`        | Keuangan & pembayaran / monitoring order                   |
| 7 | `/admin/reports`        | Laporan & analitik, leaderboard kehadiran organizer         |
| 8 | `/admin/notifications`  | Broadcast pengumuman, tiket support                         |
| 9 | `/admin/security`       | Audit log, sesi login, role sub-admin                       |
| 10 | `/admin/settings`      | Identitas platform, halaman statis, SMTP, maintenance       |

## Mulai Cepat

1. **Install dependensi**:

   ```bash
   npm install
   ```

2. **Siapkan environment**:

   Salin `.env.example` menjadi `.env` (untuk development). Saat development, request `/api/v1` di-proxy otomatis ke target di `vite.config.ts`.

3. **Jalankan dev server**:

   ```bash
   npm run dev
   ```

   Buka `http://localhost:5173` — login dengan akun admin.

4. **Build produksi**:

   ```bash
   npm run build
   ```

   Hasil build masuk ke folder `dist/`.

5. **Lint**:

   ```bash
   npm run lint
   ```

## Konfigurasi Environment

Untuk production, isi `.env.production` dengan URL API backend:

```env
VITE_API_BASE_URL=http://<IP_ATAU_DOMAIN_SERVER>:8093/api/v1
```

| Variabel            | Deskripsi                                    |
| ------------------- | -------------------------------------------- |
| `VITE_API_BASE_URL` | Base URL API (contoh: `http://host:8093/api/v1`). Fallback-nya `/api/v1`. |

> Catatan: nilai env hanya dibaca saat **build** (di-inline oleh Vite ke bundel). Setiap ubah `.env`, wajib build ulang.

## Struktur Proyek

```
Ev-web/
├── src/
│   ├── components/
│   │   ├── common/     # ConfirmModal, ProtectedRoute, Toast, dsb.
│   │   ├── layout/     # AdminLayout, Header, Sidebar
│   │   └── ui/         # Badge, Button, Card, Input, Modal, Table, dll.
│   ├── context/        # AuthContext, SystemContext
│   ├── pages/          # 10 halaman modul admin
│   ├── services/       # api.ts (axios + normalizer), mockService
│   ├── types/          # TypeScript types
│   └── App.tsx         # Routing utama
├── .env / .env.production / .env.example
├── netlify.toml        # Konfigurasi deploy Netlify (+ redirect API)
├── vite.config.ts
└── package.json
```

## Deployment

### Opsi A — Static Hosting (Netlify)

- Build command: `npm run build`, publish folder: `dist`.
- `netlify.toml` menyediakan redirect `/api/v1/*` ke backend VPS, dan fallback SPA.

### Opsi B — Server Sendiri (VPS / Hosting web)

1. Build: `npm run build` (pastikan `VITE_API_BASE_URL` menunjuk API yang benar).
2. Upload isi folder `dist` ke server (mis. `~/web/Eventify-Web/dist`).
3. Jalankan build di server jika memakai source code langsung: `npm run build`.
4. Verifikasi URL API sudah tertanam di bundel:

   ```bash
   grep -o "<IP_ATAU_DOMAIN_SERVER>:8093" dist/assets/index-*.js | head -1
   ```

5. Akses via domain & port server (contoh: `http://boothcamp.dyadev.com:9083`).

## Akun Awal (Seed)

| Role  | Email               | Password   |
| ----- | ------------------- | ---------- |
| Admin | `admin@eventify.id` | `admin123` |

## Lisensi

MIT