import { apiClient } from './api';
import type { User, EventItem, Order, DashboardStats, SystemConfig, EventStatus, UserRole } from '../types';

export const mockService = {
  // --- USER API ---
  getUsers: async (): Promise<User[]> => {
    const res = await apiClient.get('/admin/users');
    // Menyesuaikan struktur response API Go kamu (misal: res.data.data atau res.data)
    return res.data?.data || res.data || [];
  },

  updateUserRole: async (userId: string, newRole: UserRole): Promise<User> => {
    const res = await apiClient.put(`/admin/users/${userId}/role`, { role: newRole });
    return res.data?.data || res.data;
  },

  // --- EVENT API ---
  getEvents: async (): Promise<EventItem[]> => {
    const res = await apiClient.get('/events');
    return res.data?.data || res.data || [];
  },

  updateEventStatus: async (eventId: string, newStatus: EventStatus): Promise<EventItem> => {
    const res = await apiClient.patch(`/admin/events/${eventId}/status`, { status: newStatus });
    return res.data?.data || res.data;
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    await apiClient.delete(`/admin/events/${eventId}`);
  },

  // --- ORDER API ---
  getOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get('/admin/orders');
    return res.data?.data || res.data || [];
  },

  // --- DASHBOARD API ---
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get('/admin/dashboard/stats');
    return res.data?.data || res.data;
  },

  // --- SYSTEM CONFIG API ---
  getSystemConfig: async (): Promise<SystemConfig> => {
    const res = await apiClient.get('/admin/system/config');
    return res.data?.data || res.data;
  },

  updateSystemConfig: async (config: Partial<SystemConfig>): Promise<SystemConfig> => {
    const res = await apiClient.put('/admin/system/config', config);
    return res.data?.data || res.data;
  }
};