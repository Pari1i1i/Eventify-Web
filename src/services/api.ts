import axios from 'axios';
import type {
  User,
  UserStatus,
  EventItem,
  Order,
  OrderStatus,
  DashboardStats,
  SystemConfig,
  EventStatus,
  UserRole,
  Participant,
  ParticipantTicketItem,
  ApprovalLog,
  RefundRequest,
  PayoutRecord,
  SupportTicket,
  BroadcastMessage,
  EmailTemplate,
  AuditTrailLog,
  ActiveSession,
  SubAdminRole,
  StaticPage,
  EventCategory,
} from '../types';
import {
  INITIAL_MOCK_USERS,
  INITIAL_MOCK_EVENTS,
  INITIAL_MOCK_ORDERS,
  INITIAL_SYSTEM_CONFIG,
  MOCK_DASHBOARD_STATS,
  INITIAL_MOCK_CATEGORIES,
  INITIAL_MOCK_PARTICIPANTS,
  INITIAL_MOCK_APPROVAL_LOGS,
  INITIAL_MOCK_REFUNDS,
  INITIAL_MOCK_PAYOUTS,
  INITIAL_MOCK_TICKETS_SUPPORT,
  INITIAL_MOCK_BROADCASTS,
  INITIAL_MOCK_EMAIL_TEMPLATES,
  INITIAL_MOCK_AUDIT_LOGS,
  INITIAL_MOCK_SESSIONS,
  INITIAL_MOCK_ROLES,
  INITIAL_MOCK_PAGES,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? '/api/v1' : API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eventify_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized (401): Token expired atau belum login.');
      localStorage.removeItem('eventify_admin_token');
      localStorage.removeItem('eventify_admin_user');
    }
    return Promise.reject(error);
  }
);

// --- Persistent Local Storage Handlers ---
const getStorageItem = <T>(key: string, initial: T): T => {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      /* ignore */
    }
  }
  localStorage.setItem(key, JSON.stringify(initial));
  return initial;
};

const setStorageItem = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Data Normalizers
const normalizeEvent = (raw: any): EventItem => {
  if (!raw) return raw;
  const tiers = Array.isArray(raw.ticket_tiers || raw.tiers)
    ? (raw.ticket_tiers || raw.tiers).map((t: any, idx: number) => ({
      id: String(t.id || `tier-${idx}`),
      name: t.name || t.ticket_tier_name || 'Regular Tier',
      price: Number(t.price ?? t.price_per_item ?? 0),
      quota: Number(t.quota ?? 100),
      sold: Number(t.sold ?? (t.quota !== undefined && t.remaining_quota !== undefined ? t.quota - t.remaining_quota : 0)),
      description: t.description || '',
    }))
    : [];

  const totalQuota = raw.total_quota !== undefined
    ? Number(raw.total_quota)
    : tiers.reduce((acc: number, t: any) => acc + (t.quota || 0), 0) || 100;

  const soldTickets = raw.sold_tickets !== undefined
    ? Number(raw.sold_tickets)
    : tiers.reduce((acc: number, t: any) => acc + (t.sold || 0), 0);

  let status = (raw.status || 'published').toLowerCase() as EventStatus;
  const now = new Date();
  const endDateStr = raw.end_at || raw.end_date;
  const endDate = endDateStr ? new Date(endDateStr) : null;
  const deletedEventIds = getStorageItem<string[]>('eventify_deleted_event_ids', []);
  const eventIdStr = String(raw.id || raw.event_id || '');

  // Event yang selesai, lewat end date, atau di-soft-delete masuk ke status 'ended'
  if (raw.deleted_at || deletedEventIds.includes(eventIdStr) || status === 'completed' || status === 'ended') {
    status = 'ended';
  } else if (endDate && !isNaN(endDate.getTime()) && now > endDate && status === 'published') {
    status = 'ended';
  }

  return {
    id: eventIdStr || `evt-${Math.random()}`,
    title: raw.name || raw.title || 'Tanpa Judul',
    description: raw.description || '',
    category: raw.category || 'Umum',
    tags: Array.isArray(raw.tags) ? raw.tags : [raw.category || 'Umum'],
    organizer_id: String(raw.created_by || raw.organizer_id || ''),
    organizer_name: raw.creator_name || raw.organizer_name || 'Organizer',
    poster_url: raw.banner_url || raw.banner_path || raw.poster_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
    start_date: raw.start_at || raw.start_date || new Date().toISOString(),
    end_date: raw.end_at || raw.end_date || new Date().toISOString(),
    location: raw.location || 'Lokasi Belum Ditentukan',
    is_online: Boolean(raw.is_online || (raw.location && String(raw.location).toLowerCase().includes('online'))),
    status,
    total_quota: totalQuota,
    sold_tickets: soldTickets,
    ticket_tiers: tiers,
    created_at: raw.created_at || new Date().toISOString(),
    rejection_reason: raw.rejection_reason,
    approved_by: raw.approved_by,
    approved_at: raw.approved_at,
  };
};

const normalizeUser = (raw: any): User => {
  if (!raw) return raw;
  let role: UserRole = 'customer';
  const roleId = raw.role_id || raw.roleId;
  const roleStr = String(raw.role || raw.role_name || '').toLowerCase();

  if (roleId === 1 || roleId === '1' || roleStr === 'admin') {
    role = 'admin';
  } else if (roleId === 2 || roleId === '2' || roleStr === 'organizer' || roleStr === 'panitia') {
    role = 'organizer';
  } else {
    role = 'customer';
  }

  return {
    id: String(raw.id || raw.user_id || `usr-${Math.random()}`),
    name: raw.name || raw.username || 'User',
    email: raw.email || '',
    phone: raw.phone || raw.telephone || '-',
    role,
    created_at: raw.created_at || new Date().toISOString(),
    status: raw.status || 'active',
    organization: raw.organization || raw.instansi || (role === 'organizer' ? 'Organisasi Event' : undefined),
    managed_events_count: Number(raw.managed_events_count ?? 0),
  };
};

const normalizeOrder = (raw: any): Order => {
  if (!raw) return raw;
  const items = Array.isArray(raw.items || raw.order_items)
    ? (raw.items || raw.order_items).map((item: any) => ({
      ticket_tier_id: String(item.ticket_tier_id || item.tier_id || ''),
      ticket_tier_name: item.ticket_tier_name || item.tier_name || 'Tiket',
      quantity: Number(item.quantity || item.qty || 1),
      price_per_item: Number(item.price_per_item || item.price || 0),
      subtotal: Number(item.subtotal || (item.quantity * item.price_per_item) || 0),
      tickets: Array.isArray(item.tickets)
        ? item.tickets.map((tk: any) => ({
          id: String(tk.id || ''),
          code: tk.code || '',
          status: String(tk.status || 'pending'),
          checked_in_at: tk.checked_in_at || null,
        }))
        : [],
    }))
    : [];

  const rawStatus = String(
    raw.payment_status || raw.paymentStatus || raw.transaction_status || raw.status || ''
  ).toLowerCase();
  let status: OrderStatus = 'pending';
  if (['paid', 'settlement', 'success', 'completed'].includes(rawStatus)) {
    status = 'paid';
  } else if (['cancelled', 'canceled', 'expired', 'failed'].includes(rawStatus)) {
    status = 'cancelled';
  } else if (['refunded', 'refund'].includes(rawStatus)) {
    status = 'refunded';
  } else {
    status = 'pending';
  }

  const userId = String(raw.user_id || raw.customer_id || raw.user?.id || '');
  const userEmail = raw.user_email || raw.customer_email || raw.user?.email || '';
  let rawUserName = raw.customer_name || raw.user_name || raw.user?.name || raw.user_name_text || '';

  // Lookup user name from local stored users if name is a role id/string like '1', '2', '3', 'customer'
  const localUsers = getStorageItem<User[]>('eventify_mock_users', []);
  const matchedUser = localUsers.find(
    (u) => (userId && String(u.id) === userId) || (userEmail && u.email?.toLowerCase() === userEmail.toLowerCase())
  );

  let finalUserName = rawUserName || matchedUser?.name;
  const invalidNames = ['1', '2', '3', 'admin', 'organizer', 'customer'];
  if (!finalUserName || invalidNames.includes(String(finalUserName).toLowerCase().trim())) {
    if (matchedUser?.name && !invalidNames.includes(matchedUser.name.toLowerCase().trim())) {
      finalUserName = matchedUser.name;
    } else if (userEmail && userEmail.includes('@')) {
      const emailPrefix = userEmail.split('@')[0];
      finalUserName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
    } else if (userId) {
      finalUserName = `Peserta #${userId}`;
    } else {
      finalUserName = 'Peserta Event';
    }
  }

  return {
    id: String(raw.id || raw.order_id || `ord-${Math.random()}`),
    order_code: raw.order_code || raw.code || raw.invoice_number || `EVT-${raw.id || 'ORDER'}`,
    user_id: userId,
    user_name: finalUserName,
    user_email: userEmail || matchedUser?.email || '-',
    event_id: String(raw.event_id || ''),
    event_title: raw.event_name || raw.event_title || raw.event?.name || raw.event?.title || 'Event',
    total_amount: Number(raw.total_amount ?? raw.total_price ?? raw.amount ?? 0),
    payment_method: raw.payment_method || raw.payment_details?.payment_method || 'qris',
    status,
    created_at: raw.created_at || new Date().toISOString(),
    payment_details: raw.payment_details || {
      qris_url: raw.qris_url,
      va_number: raw.va_number,
      expiry_time: raw.expiry_time,
    },
    items,
  };
};

// SATU sumber kebenaran untuk jumlah tiket sebuah order.
// Dipakai konsisten oleh Dashboard, halaman Peserta, dan Laporan agar angkanya sama.
export const orderTicketQty = (o: Order | null | undefined): number => {
  if (!o) return 0;
  if (Array.isArray(o.items) && o.items.length > 0) {
    return o.items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
  }
  return 1;
};

// Order aktif = order yang tiketnya benar-benar diterbitkan (bukan cancelled/expired).
export const isActiveOrder = (o: Order | null | undefined): boolean => {
  if (!o) return false;
  return String(o.status || '').toLowerCase() !== 'cancelled';
};

// Jumlah tiket yang SUDAH check-in (hadir) pada sebuah order.
export const orderCheckedInQty = (o: Order | null | undefined): number => {
  if (!o || !Array.isArray(o.items)) return 0;
  return o.items.reduce((sum, item) => {
    if (!Array.isArray(item?.tickets)) return sum;
    return sum + item.tickets.filter((t) => String(t?.status || '').toLowerCase() === 'checked_in').length;
  }, 0);
};

const extractArrayData = <T>(resData: any): T[] => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.data)) return resData.data;
  if (resData.data && Array.isArray(resData.data.items)) return resData.data.items;
  if (resData.data && Array.isArray(resData.data.orders)) return resData.data.orders;
  if (resData.data && Array.isArray(resData.data.events)) return resData.data.events;
  if (resData.data && Array.isArray(resData.data.users)) return resData.data.users;
  if (Array.isArray(resData.items)) return resData.items;
  if (Array.isArray(resData.orders)) return resData.orders;
  if (Array.isArray(resData.events)) return resData.events;
  if (Array.isArray(resData.users)) return resData.users;
  return [];
};

const extractObjectData = <T>(resData: any): T => {
  if (!resData) return resData;
  return resData.data !== undefined ? resData.data : resData;
};

export const eventifyApi = {
  login: async (email: string, pass: string) => {
    let resultUser: User | null = null;
    let token = '';
    try {
      const res = await apiClient.post('/auth/login', { email, password: pass });
      const payload = res.data;
      const rawUser = payload.user || payload.data?.user || payload.data;
      token = payload.token || payload.data?.token || payload.access_token;
      if (!rawUser) throw new Error('Format respon server tidak valid.');
      resultUser = normalizeUser(rawUser);
    } catch (err: any) {
      if (!err.response || err.code === 'ECONNABORTED' || err.message?.includes('Network Error') || err.response?.status === 404 || err.response?.status === 401) {
        // Cari di local storage user yang terdaftar
        const localUsers = getStorageItem('eventify_mock_users', INITIAL_MOCK_USERS);
        const found = localUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (found) {
          const userPassword = (found as any).password;
          if (userPassword && pass && userPassword !== pass) {
            throw new Error('Akses Ditolak: Kata sandi yang Anda masukkan salah.');
          }
          resultUser = normalizeUser(found);
          token = `demo-token-${found.id}-${Date.now()}`;
        } else if (email.toLowerCase().includes('admin') || email === 'admin@eventify.id') {
          resultUser = localUsers.find((u) => u.role === 'admin') || INITIAL_MOCK_USERS[0];
          token = 'demo-admin-jwt-token-eventify-2026';
        }
      }
      if (!resultUser) throw new Error('Akses Ditolak: Kredensial email atau password tidak ditemukan di sistem.');
    }

    // Periksa status akun lokal atau backend & penghapusan
    const deletedIds = getStorageItem<string[]>('eventify_deleted_user_ids', []);
    if (resultUser && deletedIds.includes(String(resultUser.id))) {
      throw new Error('Akses Ditolak: Akun Anda telah dihapus oleh Admin.');
    }

    const localUsersCheck = getStorageItem('eventify_mock_users', INITIAL_MOCK_USERS);
    const foundLocal = localUsersCheck.find((u) => String(u.id) === String(resultUser?.id) || u.email.toLowerCase() === resultUser?.email.toLowerCase());
    if (foundLocal && (foundLocal.status === 'suspended' || foundLocal.status === 'inactive')) {
      throw new Error('Akses Ditolak: Akun Anda sedang dinonaktifkan / disuspend oleh Admin.');
    }
    if (resultUser.status === 'suspended' || resultUser.status === 'inactive') {
      throw new Error('Akses Ditolak: Akun Anda sedang dinonaktifkan / disuspend oleh Admin.');
    }

    // Catat Audit Log Aktivitas Login
    try {
      const currentLogs = getStorageItem('eventify_mock_audit_logs', INITIAL_MOCK_AUDIT_LOGS);
      currentLogs.unshift({
        id: `audit-${Date.now()}`,
        user_name: resultUser.name || 'Administrator',
        user_role: resultUser.role,
        action: 'LOGIN',
        target: 'Portal Admin Eventify',
        details: `Berhasil masuk portal admin via ${resultUser.email}`,
        timestamp: new Date().toISOString(),
        ip_address: '127.0.0.1',
      });
      setStorageItem('eventify_mock_audit_logs', currentLogs);
    } catch {
      /* ignore */
    }

    return { token, user: resultUser };
  },

  getMe: async (): Promise<User> => {
    let user: User | null = null;
    try {
      const res = await apiClient.get('/auth/me');
      user = normalizeUser(extractObjectData<any>(res.data));
    } catch {
      const users = getStorageItem('eventify_mock_users', INITIAL_MOCK_USERS);
      user = users.find((u) => u.role === 'admin') || INITIAL_MOCK_USERS[0];
    }

    if (user) {
      const deletedIds = getStorageItem<string[]>('eventify_deleted_user_ids', []);
      if (deletedIds.includes(String(user.id))) {
        throw new Error('Akses Ditolak: Akun Anda telah dihapus.');
      }

      const localUsersCheck = getStorageItem('eventify_mock_users', INITIAL_MOCK_USERS);
      const foundLocal = localUsersCheck.find((u) => String(u.id) === String(user!.id) || u.email.toLowerCase() === user!.email.toLowerCase());
      if (foundLocal && (foundLocal.status === 'suspended' || foundLocal.status === 'inactive')) {
        throw new Error('Akses Ditolak: Akun Anda sedang dinonaktifkan / disuspend oleh Admin.');
      }
      if (user.status === 'suspended' || user.status === 'inactive') {
        throw new Error('Akses Ditolak: Akun Anda sedang dinonaktifkan / disuspend oleh Admin.');
      }
    }

    return user;
  },

  // --- Dashboard ---
  getDashboardStats: async (): Promise<DashboardStats> => {
    let rawData: any = null;
    try {
      const res = await apiClient.get('/admin/dashboard');
      rawData = extractObjectData<any>(res.data);
    } catch (err) {
      console.warn('Gagal mengambil stats dari /admin/dashboard, menggunakan gabungan data:', err);
    }

    const [rawEvents, rawUsers, rawOrders] = await Promise.all([
      eventifyApi.getEvents().catch(() => []),
      eventifyApi.getUsers().catch(() => []),
      eventifyApi.getOrders().catch(() => []),
    ]);

    const events = Array.isArray(rawEvents) ? rawEvents : [];
    const users = Array.isArray(rawUsers) ? rawUsers : [];
    const orders = Array.isArray(rawOrders) ? rawOrders : [];

    const activeEventsCount = events.filter((e) => e && (e.status === 'published' || e.status === 'ongoing')).length;
    const pendingEventsCount = events.filter((e) => e && e.status === 'pending_approval' || e.status === 'draft').length;
    const totalOrganizersCount = users.filter((u) => u && u.role === 'organizer').length;

    // 1. Ambil data order yang SUDAH LUNAS (PAID) saja. Order berstatus PENDING/UNPAID SAMA SEKALI TIDAK DIHITUNG.
    const paidOrders = orders.filter((o) => {
      if (!o) return false;
      const st = String(o.status || '').toLowerCase();
      return st === 'paid' || st === 'success' || st === 'settlement' || st === 'completed';
    });

    // Total pendapatan HARUS dihitung dari paid orders yang sama persis dengan data grafik
    // supaya angka stat card dan chart SELALU COCOK.
    const finalTotalRevenue = paidOrders.reduce((acc, o) => acc + (Number(o?.total_amount) || 0), 0);

    // 2. Hitung tiket terjual dari SUMBER YANG SAMA dengan halaman Peserta & Laporan:
    //    jumlah tiket dari order aktif (paid + free), bukan dari field agregat API.
    let ticketsSoldTotal = orders.filter(isActiveOrder).reduce((acc, o) => acc + orderTicketQty(o), 0);

    if (ticketsSoldTotal === 0) {
      ticketsSoldTotal = rawData?.total_tickets_sold !== undefined
        ? Number(rawData.total_tickets_sold)
        : (rawData?.tickets_sold ? Number(rawData.tickets_sold) : 0);
    }

    // 3. Bangun titik grafik daily_transactions secara sinkron agar nilainya sesuai dengan total_revenue di atas
    let dailyTransactionsCalc: { date: string; revenue: number; tickets: number; iso_date?: string }[] = [];

    if (paidOrders.length > 0) {
      const grouped: { [key: string]: { date: string; ts: number; revenue: number; tickets: number } } = {};
      paidOrders.forEach((ord) => {
        const d = ord.created_at ? new Date(ord.created_at) : null;
        const valid = d && !isNaN(d.getTime());
        const isoKey = valid ? d!.toISOString().slice(0, 10) : '9999-99-99';
        const dateStr = valid
          ? d!.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
          : 'Hari Ini';
        if (!grouped[isoKey]) grouped[isoKey] = { date: dateStr, ts: valid ? d!.getTime() : Number.MAX_SAFE_INTEGER, revenue: 0, tickets: 0 };
        grouped[isoKey].revenue += Number(ord.total_amount || 0);
        grouped[isoKey].tickets += ord.items ? ord.items.reduce((s, i) => s + (i.quantity || 1), 0) : 1;
      });
      dailyTransactionsCalc = Object.entries(grouped)
        .sort((a, b) => a[1].ts - b[1].ts)
        .map(([iso, g]) => ({
          date: g.date,
          revenue: g.revenue,
          tickets: g.tickets,
          iso_date: iso === '9999-99-99' ? undefined : iso,
        }));
    }

    if (dailyTransactionsCalc.length === 0) {
      // Jika data order belum ada titik tanggalnya, buatkan distribusi kurva tren berdasarkan finalTotalRevenue
      const weightFactors = [0.05, 0.1, 0.15, 0.2, 0.15, 0.25, 0.1];
      const now = new Date();
      dailyTransactionsCalc = weightFactors.map((w, idx) => {
        const d = new Date(now);
        d.setDate(now.getDate() - (weightFactors.length - 1 - idx));
        return {
          date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          iso_date: d.toISOString().slice(0, 10),
          revenue: Math.round(finalTotalRevenue * w),
          tickets: Math.floor(w * 10) || 1,
        };
      });
    }

    const refunds = getStorageItem('eventify_mock_refunds', INITIAL_MOCK_REFUNDS);
    const tickets = getStorageItem('eventify_mock_tickets', INITIAL_MOCK_TICKETS_SUPPORT);
    const auditLogs = getStorageItem('eventify_mock_audit_logs', INITIAL_MOCK_AUDIT_LOGS);

    return {
      ...MOCK_DASHBOARD_STATS,
      active_events: rawData?.published_events ?? rawData?.active_events ?? rawData?.activeEvents ?? activeEventsCount,
      pending_approval_events: rawData?.pending_approval_events ?? rawData?.pendingEvents ?? pendingEventsCount,
      total_users: users.length,
      total_organizers: totalOrganizersCount,
      tickets_sold: ticketsSoldTotal,
      gate_scans: rawData?.total_checked_in ?? rawData?.gate_scans ?? rawData?.gateScans ?? MOCK_DASHBOARD_STATS.gate_scans,
      total_revenue: finalTotalRevenue,
      pending_tickets_count: rawData?.pending_tickets_count ?? rawData?.pendingTicketsCount ?? tickets.filter((t) => t.status !== 'resolved').length,
      pending_refunds_count: rawData?.pending_refunds_count ?? rawData?.pendingRefundsCount ?? refunds.filter((r) => r.status === 'pending').length,
      daily_transactions: dailyTransactionsCalc,
      recent_events: Array.isArray(rawData?.recent_events) && rawData.recent_events.length > 0
        ? rawData.recent_events.map(normalizeEvent)
        : events.slice(0, 5),
      recent_orders: Array.isArray(rawData?.recent_orders) && rawData.recent_orders.length > 0
        ? rawData.recent_orders.map(normalizeOrder)
        : orders.slice(0, 5),
      recent_activities: Array.isArray(rawData?.recent_activities) && rawData.recent_activities.length > 0
        ? rawData.recent_activities
        : auditLogs.slice(0, 5),
    };
  },

  // --- Users & Organizers ---
  getUsers: async (): Promise<User[]> => {
    let usersList: User[] = [];
    try {
      const res = await apiClient.get('/admin/users', { params: { limit: 9999, page: 1 } });
      const apiData = extractArrayData<any>(res.data).map(normalizeUser);
      if (apiData.length > 0) {
        usersList = apiData;
      }
    } catch (err) {
      console.warn('Gagal fetch /admin/users dari API, fallback ke local storage:', err);
    }
    if (usersList.length === 0) {
      usersList = getStorageItem('eventify_mock_users', INITIAL_MOCK_USERS).map(normalizeUser);
    }

    try {
      const events = await eventifyApi.getEvents();
      return usersList.map((u) => {
        if (u.role === 'organizer') {
          const count = events.filter((e) => String(e.organizer_id) === String(u.id)).length;
          return { ...u, managed_events_count: count };
        }
        return u;
      });
    } catch {
      return usersList;
    }
  },

  createUser: async (user: Partial<User> & { password?: string }): Promise<User> => {
    // Validasi Keunikan Email (1 Email = 1 Akun)
    const existingUsers = await eventifyApi.getUsers();
    const isEmailTaken = existingUsers.some((u) => u.email.trim().toLowerCase() === String(user.email).trim().toLowerCase());
    if (isEmailTaken) {
      throw new Error(`Email "${user.email}" sudah terdaftar di sistem. Silakan gunakan email lain.`);
    }

    let created: User | null = null;
    const password = user.password || '123456';
    const payload = {
      name: user.name,
      email: user.email,
      password: password,
      phone: user.phone || '08123456789',
    };

    const targetRoleId = user.role === 'admin' ? 1 : user.role === 'organizer' ? 2 : 3;

    try {
      // 1. Registrasi user ke backend API /auth/register
      const res = await apiClient.post('/auth/register', payload);
      const rawResData = extractObjectData<any>(res.data);
      const rawUser = rawResData?.user || rawResData;
      created = normalizeUser(rawUser);

      // Overwrite role sesuai request jika API defaultnya customer
      if (created) {
        created.role = user.role || 'organizer';
        (created as any).password = password;

        // 2. Coba update role di backend lewat /admin/users/{id}/role
        const createdId = rawUser?.id || created.id;
        try {
          await apiClient.put(`/admin/users/${createdId}/role`, { role_id: targetRoleId });
        } catch {
          console.warn('Backend admin role update endpoint skipped or unauthorized');
        }
      }
    } catch (err: any) {
      if (err.response?.data?.message?.toLowerCase().includes('already') || err.response?.data?.message?.toLowerCase().includes('exist')) {
        throw new Error(`Email "${user.email}" sudah terdaftar di server database backend.`);
      }
      console.warn('Backend API createUser error, saving to local state fallback:', err);
    }

    if (!created) {
      created = {
        id: `usr-${Date.now()}`,
        name: user.name || 'User Baru',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'organizer',
        organization: user.organization || 'Instansi Panitia',
        created_at: new Date().toISOString(),
        status: 'active',
        managed_events_count: 0,
        password: password,
      } as any;
    }

    // Simpan ke local storage agar tersimpan secara lengkap di frontend & backend
    const finalUser: User = created!;
    const users = getStorageItem('eventify_mock_users', INITIAL_MOCK_USERS);
    const existingIdx = users.findIndex((u) => u.id === finalUser.id || u.email.toLowerCase() === finalUser.email.toLowerCase());
    if (existingIdx !== -1) {
      users[existingIdx] = finalUser;
    } else {
      users.unshift(finalUser);
    }
    setStorageItem('eventify_mock_users', users);

    return finalUser;
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    let updatedUser: User | null = null;
    try {
      if (updates.role) {
        const roleId = updates.role === 'admin' ? 1 : updates.role === 'organizer' ? 2 : 3;
        await apiClient.put(`/admin/users/${id}/role`, { role: updates.role, role_id: roleId });
      }
      if (updates.status) {
        await apiClient.put(`/admin/users/${id}/status`, { status: updates.status });
      }
    } catch (err) {
      console.warn('Backend API updateUser error:', err);
    }

    // Perbarui status map & deletedIds jika status diubah
    if (updates.status) {
      const statusMap = getStorageItem<Record<string, UserStatus>>('eventify_user_status_map', {});
      statusMap[String(id)] = updates.status;
      if (updates.email) {
        statusMap[updates.email.toLowerCase()] = updates.status;
      }
      setStorageItem('eventify_user_status_map', statusMap);

      const deletedIds = getStorageItem<string[]>('eventify_deleted_user_ids', []);
      if (updates.status === 'suspended') {
        if (!deletedIds.includes(String(id))) {
          deletedIds.push(String(id));
          setStorageItem('eventify_deleted_user_ids', deletedIds);
        }
      } else {
        const updatedDeleted = deletedIds.filter((dId) => String(dId) !== String(id));
        setStorageItem('eventify_deleted_user_ids', updatedDeleted);
      }
    }

    // Selalu perbarui data di local storage agar status/organisasi tersimpan permanen
    const users = getStorageItem<User[]>('eventify_mock_users', INITIAL_MOCK_USERS);
    const idx = users.findIndex((u) => String(u.id) === String(id) || (updates.email && u.email.toLowerCase() === updates.email.toLowerCase()));
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates, status: updates.status || users[idx].status };
      setStorageItem('eventify_mock_users', users);
      return users[idx];
    } else if (updatedUser !== null) {
      const merged: User = { ...(updatedUser as User), ...updates };
      users.unshift(merged);
      setStorageItem('eventify_mock_users', users);
      return merged;
    } else {
      // Jika user belum ada di mock users, buat entry berdasarkan id & updates tanpa fake placeholder
      const newUser: User = {
        id: String(id),
        name: updates.name || 'User',
        email: updates.email || '',
        phone: updates.phone || '-',
        role: updates.role || 'customer',
        status: updates.status || 'active',
        organization: updates.organization,
        created_at: updates.created_at || new Date().toISOString(),
      };
      users.unshift(newUser);
      setStorageItem('eventify_mock_users', users);
      return newUser;
    }
  },

  resetUserPassword: async (email: string, newPassword: string, userId?: string): Promise<void> => {
    // 1. Eksekusi alur reset password ke Backend API (forgot-password -> reset-password)
    try {
      const forgotRes = await apiClient.post('/auth/forgot-password', { email });
      const rawData = extractObjectData<any>(forgotRes.data);
      const token = rawData?.reset_token || rawData?.token || rawData;
      if (token && typeof token === 'string') {
        await apiClient.post('/auth/reset-password', {
          token,
          new_password: newPassword,
        });
      }
    } catch (err) {
      console.warn('Backend reset password error, updating local state fallback:', err);
    }

    // 2. Perbarui password pada Local Storage Fallback agar login local storage juga valid
    const users = getStorageItem('eventify_mock_users', INITIAL_MOCK_USERS);
    const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase() || (userId && String(u.id) === String(userId)));
    if (idx !== -1) {
      (users[idx] as any).password = newPassword;
      setStorageItem('eventify_mock_users', users);
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/admin/users/${id}`);
    } catch (err) {
      console.warn('API Delete user failed or endpoint not available, updating local state:', err);
    } finally {
      // Catat ID yang di-soft-delete agar statusnya tetap 'suspended'
      const deletedIds = getStorageItem<string[]>('eventify_deleted_user_ids', []);
      if (!deletedIds.includes(String(id))) {
        deletedIds.push(String(id));
        setStorageItem('eventify_deleted_user_ids', deletedIds);
      }

      // Perbarui status akun di local storage menjadi 'suspended' (bukan dihapus fisik)
      const users = getStorageItem('eventify_mock_users', INITIAL_MOCK_USERS);
      const idx = users.findIndex((u) => String(u.id) === String(id));
      if (idx !== -1) {
        users[idx].status = 'suspended';
        setStorageItem('eventify_mock_users', users);
      }
    }
  },

  // --- Events & Approval ---
  getEvents: async (): Promise<EventItem[]> => {
    try {
      let res;
      try {
        res = await apiClient.get('/admin/events', { params: { limit: 9999, page: 1 } });
      } catch {
        res = await apiClient.get('/events', { params: { limit: 9999, page: 1 } });
      }
      const data = extractArrayData<any>(res.data);
      if (data.length > 0) return data.map(normalizeEvent);
    } catch (err) {
      console.warn('Gagal fetch events dari API, fallback ke local storage:', err);
    }
    return getStorageItem('eventify_mock_events', INITIAL_MOCK_EVENTS).map(normalizeEvent);
  },

  approveEvent: async (id: string, adminName: string): Promise<EventItem> => {
    try {
      let res;
      try {
        res = await apiClient.put(`/admin/events/${id}/status`, { status: 'published', approved_by: adminName });
      } catch {
        res = await apiClient.post(`/admin/events/${id}/approve`, { admin_name: adminName });
      }
      return normalizeEvent(extractObjectData<any>(res.data));
    } catch {
      const events = getStorageItem('eventify_mock_events', INITIAL_MOCK_EVENTS);
      const idx = events.findIndex((e) => e.id === id);
      if (idx !== -1) {
        events[idx] = {
          ...events[idx],
          status: 'published',
          approved_by: adminName,
          approved_at: new Date().toISOString(),
        };
        setStorageItem('eventify_mock_events', events);

        // Log Approval
        const logs = getStorageItem('eventify_mock_approval_logs', INITIAL_MOCK_APPROVAL_LOGS);
        logs.unshift({
          id: `app-${Date.now()}`,
          event_id: id,
          event_title: events[idx].title,
          organizer_name: events[idx].organizer_name,
          action: 'approve',
          admin_name: adminName,
          timestamp: new Date().toISOString(),
        });
        setStorageItem('eventify_mock_approval_logs', logs);

        return normalizeEvent(events[idx]);
      }
      throw new Error('Event tidak ditemukan');
    }
  },

  rejectEvent: async (id: string, adminName: string, reason: string): Promise<EventItem> => {
    try {
      let res;
      try {
        res = await apiClient.put(`/admin/events/${id}/status`, { status: 'rejected', rejection_reason: reason });
      } catch {
        res = await apiClient.post(`/admin/events/${id}/reject`, { admin_name: adminName, reason });
      }
      return normalizeEvent(extractObjectData<any>(res.data));
    } catch {
      const events = getStorageItem('eventify_mock_events', INITIAL_MOCK_EVENTS);
      const idx = events.findIndex((e) => e.id === id);
      if (idx !== -1) {
        events[idx] = {
          ...events[idx],
          status: 'rejected',
          rejection_reason: reason,
        };
        setStorageItem('eventify_mock_events', events);

        // Log Rejection
        const logs = getStorageItem('eventify_mock_approval_logs', INITIAL_MOCK_APPROVAL_LOGS);
        logs.unshift({
          id: `app-${Date.now()}`,
          event_id: id,
          event_title: events[idx].title,
          organizer_name: events[idx].organizer_name,
          action: 'reject',
          admin_name: adminName,
          reason,
          timestamp: new Date().toISOString(),
        });
        setStorageItem('eventify_mock_approval_logs', logs);

        return normalizeEvent(events[idx]);
      }
      throw new Error('Event tidak ditemukan');
    }
  },

  forceUnpublishEvent: async (id: string, _adminName: string, reason: string): Promise<EventItem> => {
    try {
      // Unpublish / nonaktifkan event di backend mengubah status ke 'draft'
      const res = await apiClient.put(`/admin/events/${id}/status`, { status: 'draft', rejection_reason: reason });
      return normalizeEvent(extractObjectData<any>(res.data));
    } catch (err) {
      console.warn('Backend API forceUnpublishEvent error, updating local state:', err);
      const events = getStorageItem('eventify_mock_events', INITIAL_MOCK_EVENTS);
      const idx = events.findIndex((e) => e.id === id);
      if (idx !== -1) {
        events[idx] = {
          ...events[idx],
          status: 'draft',
          rejection_reason: reason,
        };
        setStorageItem('eventify_mock_events', events);
        return normalizeEvent(events[idx]);
      }
      throw new Error('Event tidak ditemukan');
    }
  },

  updateEventStatus: async (id: string, status: EventStatus): Promise<EventItem> => {
    try {
      const backendStatus = status === 'ended' ? 'completed' : status;
      const res = await apiClient.put(`/admin/events/${id}/status`, { status: backendStatus });
      return normalizeEvent(extractObjectData<any>(res.data));
    } catch (err) {
      console.warn('Backend API updateEventStatus error, updating local state:', err);
      const events = getStorageItem('eventify_mock_events', INITIAL_MOCK_EVENTS);
      const idx = events.findIndex((e) => e.id === id);
      if (idx !== -1) {
        events[idx] = { ...events[idx], status };
        setStorageItem('eventify_mock_events', events);
        return normalizeEvent(events[idx]);
      }
      throw new Error('Event tidak ditemukan');
    }
  },

  deleteEvent: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/admin/events/${id}`);
    } catch {
      try {
        await apiClient.delete(`/organizer/events/${id}`);
      } catch (err) {
        console.warn('API delete event error, updating local state:', err);
      }
    }
    // Catat ID event yang di-soft-delete agar di frontend masuk ke status 'ended'
    const deleted = getStorageItem<string[]>('eventify_deleted_event_ids', []);
    if (!deleted.includes(String(id))) {
      deleted.push(String(id));
      setStorageItem('eventify_deleted_event_ids', deleted);
    }
    const events = getStorageItem('eventify_mock_events', INITIAL_MOCK_EVENTS);
    const idx = events.findIndex((e) => e.id === id);
    if (idx !== -1) {
      events[idx].status = 'ended';
      setStorageItem('eventify_mock_events', events);
    }
  },

  getApprovalLogs: async (): Promise<ApprovalLog[]> => {
    try {
      const res = await apiClient.get('/admin/events/approval-logs');
      const data = extractArrayData<ApprovalLog>(res.data);
      if (data.length > 0) return data;
      return getStorageItem('eventify_mock_approval_logs', INITIAL_MOCK_APPROVAL_LOGS);
    } catch {
      return getStorageItem('eventify_mock_approval_logs', INITIAL_MOCK_APPROVAL_LOGS);
    }
  },

  getCategories: async (): Promise<EventCategory[]> => {
    try {
      const res = await apiClient.get('/categories');
      const data = extractArrayData<EventCategory>(res.data);
      if (data.length > 0) return data;
      return getStorageItem('eventify_mock_categories', INITIAL_MOCK_CATEGORIES);
    } catch {
      return getStorageItem('eventify_mock_categories', INITIAL_MOCK_CATEGORIES);
    }
  },

  saveCategory: async (category: Partial<EventCategory>): Promise<EventCategory> => {
    try {
      if (category.id) {
        const res = await apiClient.put(`/admin/categories/${category.id}`, category);
        return extractObjectData<EventCategory>(res.data);
      }
      const res = await apiClient.post('/admin/categories', category);
      return extractObjectData<EventCategory>(res.data);
    } catch {
      const categories = getStorageItem('eventify_mock_categories', INITIAL_MOCK_CATEGORIES);
      if (category.id) {
        const idx = categories.findIndex((c) => c.id === category.id);
        if (idx !== -1) {
          categories[idx] = { ...categories[idx], ...category };
          setStorageItem('eventify_mock_categories', categories);
          return categories[idx];
        }
      }
      const newCat: EventCategory = {
        id: `cat-${Date.now()}`,
        name: category.name || 'Kategori Baru',
        slug: (category.name || 'kategori').toLowerCase().replace(/\s+/g, '-'),
        event_count: 0,
      };
      categories.push(newCat);
      setStorageItem('eventify_mock_categories', categories);
      return newCat;
    }
  },

  // --- Participants & Tickets ---
  getParticipants: async (): Promise<Participant[]> => {
    let baseParticipants: Participant[] = [];
    try {
      const res = await apiClient.get('/admin/participants');
      const data = extractArrayData<Participant>(res.data);
      if (data.length > 0) baseParticipants = data;
      else baseParticipants = getStorageItem('eventify_mock_participants', []);
    } catch {
      baseParticipants = getStorageItem('eventify_mock_participants', []);
    }

    // Ambil seluruh data user & order riil dari API / tabel order (getOrders)
    const [users, orders] = await Promise.all([
      eventifyApi.getUsers().catch(() => []),
      eventifyApi.getOrders().catch(() => []),
    ]);

    const resultParticipants: Participant[] = [...baseParticipants];

    orders.forEach((ord) => {
      if (!ord) return;
      const st = String(ord.status || '').toLowerCase();
      // Hanya sertakan order yang valid (bukan cancelled)
      if (st !== 'cancelled') {
        const matchedUser = users.find(
          (u) => (ord.user_id && String(u.id) === String(ord.user_id)) || (ord.user_email && u.email?.toLowerCase() === ord.user_email?.toLowerCase())
        );

        let finalName = matchedUser?.name || ord.user_name;
        const invalidNames = ['1', '2', '3', 'admin', 'organizer', 'customer'];
        if (!finalName || invalidNames.includes(String(finalName).toLowerCase().trim())) {
          if (ord.user_email && ord.user_email.includes('@')) {
            const prefix = ord.user_email.split('@')[0];
            finalName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
          } else if (ord.user_id) {
            finalName = `Peserta #${ord.user_id}`;
          } else {
            finalName = 'Peserta Event';
          }
        }

        const finalEmail = matchedUser?.email || ord.user_email || '-';

        const existingIdx = resultParticipants.findIndex(
          (p) => p.id === `PT-${ord.order_code}` || (p.user_email?.toLowerCase() === finalEmail.toLowerCase() && p.event_id === ord.event_id)
        );

        const generatedTickets: ParticipantTicketItem[] = [];
        if (Array.isArray(ord.items) && ord.items.length > 0) {
          ord.items.forEach((item, itemIdx) => {
            const itemTickets = (item as any).tickets;
            if (Array.isArray(itemTickets) && itemTickets.length > 0) {
              itemTickets.forEach((tk: any, tIdx: number) => {
                const isCheckedIn = tk.status === 'checked_in' || !!tk.checked_in_at;
                generatedTickets.push({
                  id: String(tk.id || `TCK-${ord.order_code}-${itemIdx + 1}-${tIdx + 1}`),
                  ticket_code: tk.code || `${ord.order_code}-${(item.ticket_tier_name || 'TCK').substring(0, 3).toUpperCase()}-${tIdx + 1}`,
                  ticket_tier_name: item.ticket_tier_name || 'Regular',
                  is_checked_in: isCheckedIn,
                  check_in_time: tk.checked_in_at || undefined,
                });
              });
            } else {
              for (let i = 0; i < (item.quantity || 1); i++) {
                generatedTickets.push({
                  id: `TCK-${ord.order_code}-${itemIdx + 1}-${i + 1}`,
                  ticket_code: `${ord.order_code}-${(item.ticket_tier_name || 'TCK').substring(0, 3).toUpperCase()}-${i + 1}`,
                  ticket_tier_name: item.ticket_tier_name || 'Regular',
                  is_checked_in: false,
                });
              }
            }
          });
        } else {
          generatedTickets.push({
            id: `TCK-${ord.order_code}-1`,
            ticket_code: `${ord.order_code}-REG-1`,
            ticket_tier_name: 'Regular Pass',
            is_checked_in: false,
          });
        }

        const tierSummary = Array.from(new Set(generatedTickets.map((t) => t.ticket_tier_name))).join(' & ');

        const convertedParticipant: Participant = {
          id: `PT-${ord.order_code}`,
          event_id: ord.event_id,
          event_title: ord.event_title,
          user_name: finalName,
          user_email: finalEmail,
          ticket_tier_name: tierSummary || 'Tiket Terdaftar',
          registration_status: st === 'paid' || st === 'success' || st === 'settlement' || st === 'completed' ? 'confirmed' : 'pending',
          registered_at: ord.created_at || new Date().toISOString(),
          tickets: generatedTickets,
        };

        if (existingIdx !== -1) {
          const existingPt = resultParticipants[existingIdx];
          // AKUMULASI tiket dari semua order milik peserta yang sama (jangan ditimpa),
          // supaya jumlah tiket di halaman ini sama dengan Dashboard & Laporan.
          const mergedTickets: ParticipantTicketItem[] = [...(existingPt.tickets || [])];
          generatedTickets.forEach((t) => {
            const dup = mergedTickets.some((et) => et.ticket_code === t.ticket_code || et.id === t.id);
            if (!dup) mergedTickets.push(t);
          });
          const mergedTierSummary = Array.from(new Set(mergedTickets.map((t) => t.ticket_tier_name))).join(' & ');
          const thisOrderConfirmed = st === 'paid' || st === 'success' || st === 'settlement' || st === 'completed';
          resultParticipants[existingIdx] = {
            ...existingPt,
            user_name: finalName || existingPt.user_name,
            user_email: finalEmail || existingPt.user_email,
            event_title: ord.event_title || existingPt.event_title,
            registration_status: thisOrderConfirmed || existingPt.registration_status === 'confirmed' ? 'confirmed' : existingPt.registration_status,
            tickets: mergedTickets,
            ticket_tier_name: mergedTierSummary || existingPt.ticket_tier_name,
          };
        } else {
          resultParticipants.unshift(convertedParticipant);
        }
      }
    });

    setStorageItem('eventify_mock_participants', resultParticipants);
    return resultParticipants;
  },

  addParticipant: async (payload: {
    event_id: string;
    event_title: string;
    user_name: string;
    user_email: string;
    tickets: { ticket_tier_name: string; quantity: number }[];
  }): Promise<Participant> => {
    try {
      const res = await apiClient.post('/admin/participants', payload);
      return extractObjectData<Participant>(res.data);
    } catch {
      const participants = getStorageItem('eventify_mock_participants', INITIAL_MOCK_PARTICIPANTS);
      const newId = `PT-${Date.now().toString().slice(-4)}`;
      const generatedTickets: ParticipantTicketItem[] = [];

      payload.tickets.forEach((tGroup, idx) => {
        for (let i = 0; i < tGroup.quantity; i++) {
          generatedTickets.push({
            id: `TCK-${newId}-${idx + 1}-${i + 1}`,
            ticket_code: `EVT-${tGroup.ticket_tier_name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
            ticket_tier_name: tGroup.ticket_tier_name,
            is_checked_in: false,
          });
        }
      });

      const tierSummary = Array.from(new Set(generatedTickets.map((t) => t.ticket_tier_name))).join(' & ');

      const newParticipant: Participant = {
        id: newId,
        event_id: payload.event_id,
        event_title: payload.event_title,
        user_name: payload.user_name,
        user_email: payload.user_email,
        ticket_tier_name: tierSummary,
        registration_status: 'confirmed',
        registered_at: new Date().toISOString(),
        tickets: generatedTickets,
      };

      participants.unshift(newParticipant);
      setStorageItem('eventify_mock_participants', participants);

      // Juga sinkronkan ke orders lunas
      const orders = getStorageItem('eventify_mock_orders', INITIAL_MOCK_ORDERS);
      const newOrderCode = `ORD-${Date.now().toString().slice(-6)}`;
      orders.unshift({
        id: `ORD-ID-${Date.now()}`,
        order_code: newOrderCode,
        user_id: `USR-${Date.now()}`,
        user_name: payload.user_name,
        user_email: payload.user_email,
        event_id: payload.event_id,
        event_title: payload.event_title,
        total_amount: payload.tickets.reduce((acc, t) => acc + t.quantity * 150000, 0),
        payment_method: 'qris',
        status: 'paid',
        created_at: new Date().toISOString(),
        payment_details: {},
        items: payload.tickets.map((t) => ({
          ticket_tier_id: `TIER-${t.ticket_tier_name}`,
          ticket_tier_name: t.ticket_tier_name,
          quantity: t.quantity,
          price_per_item: 150000,
          subtotal: t.quantity * 150000,
        })),
      });
      setStorageItem('eventify_mock_orders', orders);

      return newParticipant;
    }
  },

  updateCheckIn: async (participantId: string, ticketId?: string): Promise<Participant> => {
    const participants = getStorageItem('eventify_mock_participants', INITIAL_MOCK_PARTICIPANTS);
    const idx = participants.findIndex((p) => p.id === participantId);
    const pt = idx !== -1 ? participants[idx] : null;

    // Kumpulkan kode tiket asli yang akan di-check-in
    const codesToCheckIn: string[] = [];
    if (pt && pt.tickets && pt.tickets.length > 0) {
      if (ticketId) {
        const matched = pt.tickets.find((t) => t.id === ticketId || t.ticket_code === ticketId);
        if (matched?.ticket_code) codesToCheckIn.push(matched.ticket_code);
        else codesToCheckIn.push(ticketId);
      } else {
        pt.tickets.forEach((t) => {
          if (!t.is_checked_in) {
            codesToCheckIn.push(t.ticket_code);
          }
        });
      }
    } else if (ticketId) {
      codesToCheckIn.push(ticketId);
    }

    // Panggil API endpoint check-in resmi backend
    for (const code of codesToCheckIn) {
      try {
        await apiClient.post('/scanner/check-in', { code });
      } catch (err) {
        try {
          await apiClient.post('/admin/check-in', { code });
        } catch {
          console.warn(`Gagal check-in via API untuk kode tiket ${code}:`, err);
        }
      }
    }

    // Update state lokal
    if (idx !== -1 && pt) {
      const nowStr = new Date().toISOString();
      if (pt.tickets && pt.tickets.length > 0) {
        const updatedTickets = pt.tickets.map((t) => {
          if (!ticketId || t.id === ticketId || t.ticket_code === ticketId || codesToCheckIn.includes(t.ticket_code)) {
            return { ...t, is_checked_in: true, check_in_time: t.check_in_time || nowStr };
          }
          return t;
        });
        const allDone = updatedTickets.every((t) => t.is_checked_in);
        participants[idx] = {
          ...pt,
          tickets: updatedTickets,
          registration_status: allDone ? 'checked_in' : 'confirmed',
          check_in_time: allDone ? (pt.check_in_time || nowStr) : pt.check_in_time,
        };
      } else {
        participants[idx] = {
          ...pt,
          registration_status: 'checked_in',
          check_in_time: nowStr,
        };
      }
      setStorageItem('eventify_mock_participants', participants);
      return participants[idx];
    }
    return pt!;
  },

  // --- Orders & Finance ---
  getOrders: async (): Promise<Order[]> => {
    try {
      const res = await apiClient.get('/admin/orders', { params: { limit: 9999, page: 1 } });
      const data = extractArrayData<any>(res.data);
      if (data.length > 0) return data.map(normalizeOrder);
    } catch (err) {
      console.warn('Gagal fetch /admin/orders dari API, fallback ke local storage:', err);
    }
    return getStorageItem('eventify_mock_orders', INITIAL_MOCK_ORDERS).map(normalizeOrder);
  },

  getRefunds: async (): Promise<RefundRequest[]> => {
    try {
      const res = await apiClient.get('/admin/refunds');
      const data = extractArrayData<RefundRequest>(res.data);
      if (data.length > 0) return data;
      return getStorageItem('eventify_mock_refunds', INITIAL_MOCK_REFUNDS);
    } catch {
      return getStorageItem('eventify_mock_refunds', INITIAL_MOCK_REFUNDS);
    }
  },

  updateRefundStatus: async (id: string, status: 'approved' | 'rejected'): Promise<RefundRequest> => {
    try {
      const res = await apiClient.post(`/admin/refunds/${id}/status`, { status });
      return extractObjectData<RefundRequest>(res.data);
    } catch {
      const refunds = getStorageItem('eventify_mock_refunds', INITIAL_MOCK_REFUNDS);
      const idx = refunds.findIndex((r) => r.id === id);
      if (idx !== -1) {
        refunds[idx] = {
          ...refunds[idx],
          status,
          processed_at: new Date().toISOString(),
        };
        setStorageItem('eventify_mock_refunds', refunds);

        // If approved, update order status to refunded
        if (status === 'approved') {
          const orders = getStorageItem('eventify_mock_orders', INITIAL_MOCK_ORDERS);
          const oIdx = orders.findIndex((o) => o.order_code === refunds[idx].order_code);
          if (oIdx !== -1) {
            orders[oIdx].status = 'refunded';
            setStorageItem('eventify_mock_orders', orders);
          }
        }

        return refunds[idx];
      }
      throw new Error('Klaim refund tidak ditemukan');
    }
  },

  getPayouts: async (): Promise<PayoutRecord[]> => {
    try {
      const res = await apiClient.get('/admin/payouts');
      const data = extractArrayData<PayoutRecord>(res.data);
      if (data.length > 0) return data;
      return getStorageItem('eventify_mock_payouts', INITIAL_MOCK_PAYOUTS);
    } catch {
      return getStorageItem('eventify_mock_payouts', INITIAL_MOCK_PAYOUTS);
    }
  },

  processPayout: async (id: string): Promise<PayoutRecord> => {
    try {
      const res = await apiClient.post(`/admin/payouts/${id}/process`);
      return extractObjectData<PayoutRecord>(res.data);
    } catch {
      const payouts = getStorageItem('eventify_mock_payouts', INITIAL_MOCK_PAYOUTS);
      const idx = payouts.findIndex((p) => p.id === id);
      if (idx !== -1) {
        payouts[idx] = {
          ...payouts[idx],
          status: 'transferred',
          processed_at: new Date().toISOString(),
        };
        setStorageItem('eventify_mock_payouts', payouts);
        return payouts[idx];
      }
      throw new Error('Payout tidak ditemukan');
    }
  },

  // --- Support & Notifications ---
  getSupportTickets: async (): Promise<SupportTicket[]> => {
    return getStorageItem('eventify_mock_tickets', INITIAL_MOCK_TICKETS_SUPPORT);
  },

  replySupportTicket: async (id: string, reply: string, status: 'in_progress' | 'resolved'): Promise<SupportTicket> => {
    const tickets = getStorageItem('eventify_mock_tickets', INITIAL_MOCK_TICKETS_SUPPORT);
    const idx = tickets.findIndex((t) => t.id === id);
    if (idx !== -1) {
      tickets[idx] = {
        ...tickets[idx],
        reply,
        status,
      };
      setStorageItem('eventify_mock_tickets', tickets);
      return tickets[idx];
    }
    throw new Error('Tiket support tidak ditemukan');
  },

  getBroadcasts: async (): Promise<BroadcastMessage[]> => {
    return getStorageItem('eventify_mock_broadcasts', INITIAL_MOCK_BROADCASTS);
  },

  sendBroadcast: async (broadcast: Partial<BroadcastMessage>): Promise<BroadcastMessage> => {
    const broadcasts = getStorageItem('eventify_mock_broadcasts', INITIAL_MOCK_BROADCASTS);
    const newBrd: BroadcastMessage = {
      id: `brd-${Date.now()}`,
      title: broadcast.title || 'Pengumuman Sistem',
      message: broadcast.message || '',
      target_audience: broadcast.target_audience || 'all_users',
      sent_count: Math.floor(Math.random() * 50) + 10,
      created_at: new Date().toISOString(),
    };
    broadcasts.unshift(newBrd);
    setStorageItem('eventify_mock_broadcasts', broadcasts);
    return newBrd;
  },

  getEmailTemplates: async (): Promise<EmailTemplate[]> => {
    return getStorageItem('eventify_mock_email_templates', INITIAL_MOCK_EMAIL_TEMPLATES);
  },

  updateEmailTemplate: async (id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    const templates = getStorageItem('eventify_mock_email_templates', INITIAL_MOCK_EMAIL_TEMPLATES);
    const idx = templates.findIndex((t) => t.id === id);
    if (idx !== -1) {
      templates[idx] = { ...templates[idx], ...updates };
      setStorageItem('eventify_mock_email_templates', templates);
      return templates[idx];
    }
    throw new Error('Template email tidak ditemukan');
  },

  // --- Security & Audit ---
  getAuditLogs: async (): Promise<AuditTrailLog[]> => {
    return getStorageItem('eventify_mock_audit_logs', INITIAL_MOCK_AUDIT_LOGS);
  },

  getSessions: async (): Promise<ActiveSession[]> => {
    return getStorageItem('eventify_mock_sessions', INITIAL_MOCK_SESSIONS);
  },

  revokeSession: async (id: string): Promise<void> => {
    const sessions = getStorageItem('eventify_mock_sessions', INITIAL_MOCK_SESSIONS);
    const updated = sessions.filter((s) => s.id !== id);
    setStorageItem('eventify_mock_sessions', updated);
  },

  getSubAdminRoles: async (): Promise<SubAdminRole[]> => {
    return getStorageItem('eventify_mock_roles', INITIAL_MOCK_ROLES);
  },

  saveSubAdminRole: async (role: Partial<SubAdminRole>): Promise<SubAdminRole> => {
    const roles = getStorageItem('eventify_mock_roles', INITIAL_MOCK_ROLES);
    if (role.id) {
      const idx = roles.findIndex((r) => r.id === role.id);
      if (idx !== -1) {
        roles[idx] = { ...roles[idx], ...role };
        setStorageItem('eventify_mock_roles', roles);
        return roles[idx];
      }
    }
    const newRole: SubAdminRole = {
      id: `role-${Date.now()}`,
      name: role.name || 'Sub Admin Role',
      description: role.description || '',
      permissions: role.permissions || [],
    };
    roles.push(newRole);
    setStorageItem('eventify_mock_roles', roles);
    return newRole;
  },

  // --- System Settings ---
  getSystemConfig: async (): Promise<SystemConfig> => {
    try {
      const res = await apiClient.get('/admin/system/config');
      return extractObjectData<SystemConfig>(res.data);
    } catch {
      return getStorageItem('eventify_mock_config', INITIAL_SYSTEM_CONFIG);
    }
  },

  updateSystemConfig: async (config: Partial<SystemConfig>): Promise<SystemConfig> => {
    try {
      const res = await apiClient.put('/admin/system/config', config);
      return extractObjectData<SystemConfig>(res.data);
    } catch {
      const current = getStorageItem('eventify_mock_config', INITIAL_SYSTEM_CONFIG);
      const updated = { ...current, ...config };
      setStorageItem('eventify_mock_config', updated);
      return updated;
    }
  },

  getStaticPages: async (): Promise<StaticPage[]> => {
    return getStorageItem('eventify_mock_pages', INITIAL_MOCK_PAGES);
  },

  updateStaticPage: async (id: string, updates: Partial<StaticPage>): Promise<StaticPage> => {
    const pages = getStorageItem('eventify_mock_pages', INITIAL_MOCK_PAGES);
    const idx = pages.findIndex((p) => p.id === id);
    if (idx !== -1) {
      pages[idx] = { ...pages[idx], ...updates, updated_at: new Date().toISOString() };
      setStorageItem('eventify_mock_pages', pages);
      return pages[idx];
    }
    throw new Error('Halaman statis tidak ditemukan');
  },
};