export type UserRole = 'admin' | 'organizer' | 'customer';
export type UserStatus = 'active' | 'suspended' | 'blocked' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  created_at: string;
  status: UserStatus;
  organization?: string;
  managed_events_count?: number;
}

export type EventStatus =
  | 'published'
  | 'draft'
  | 'pending_approval'
  | 'rejected'
  | 'ongoing'
  | 'ended'
  | 'cancelled'
  | 'completed'
  | 'suspended';

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  quota: number;
  sold: number;
  description?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags?: string[];
  organizer_id: string;
  organizer_name: string;
  poster_url: string;
  start_date: string;
  end_date: string;
  location: string;
  is_online: boolean;
  status: EventStatus;
  total_quota: number;
  sold_tickets: number;
  ticket_tiers: TicketTier[];
  created_at: string;
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface ApprovalLog {
  id: string;
  event_id: string;
  event_title: string;
  organizer_name: string;
  action: 'approve' | 'reject' | 'force_unpublish';
  admin_name: string;
  reason?: string;
  timestamp: string;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  event_count: number;
}

export type OrderStatus = 'paid' | 'pending' | 'cancelled' | 'refunded';

export interface OrderItemTicket {
  id: string;
  code: string;
  status: string;
  checked_in_at?: string | null;
}

export interface OrderItem {
  ticket_tier_id: string;
  ticket_tier_name: string;
  quantity: number;
  price_per_item: number;
  subtotal: number;
  tickets?: OrderItemTicket[];
}

export interface Order {
  id: string;
  order_code: string;
  user_id: string;
  user_name: string;
  user_email: string;
  event_id: string;
  event_title: string;
  total_amount: number;
  payment_method: 'qris' | 'bca_va' | 'mandiri_va' | 'gopay' | 'credit_card';
  status: OrderStatus;
  created_at: string;
  payment_details: {
    qris_url?: string;
    va_number?: string;
    expiry_time?: string;
  };
  items: OrderItem[];
}

export interface ParticipantTicketItem {
  id: string;
  ticket_code: string;
  ticket_tier_name: string;
  is_checked_in: boolean;
  check_in_time?: string;
}

export interface Participant {
  id: string;
  event_id: string;
  event_title: string;
  user_name: string;
  user_email: string;
  ticket_tier_name: string;
  registration_status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in';
  check_in_time?: string;
  registered_at: string;
  tickets?: ParticipantTicketItem[];
}

export interface RefundRequest {
  id: string;
  order_code: string;
  user_name: string;
  user_email: string;
  event_title: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at?: string;
}

export interface PayoutRecord {
  id: string;
  organizer_id: string;
  organizer_name: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: 'pending' | 'transferred' | 'rejected';
  requested_at: string;
  processed_at?: string;
}

export interface PaymentGatewayConfig {
  midtrans_client_key: string;
  midtrans_server_key: string;
  xendit_secret_key: string;
  is_production: boolean;
}

export interface PlatformFeeConfig {
  percentage_fee: number; // e.g. 5%
  flat_fee_per_ticket: number; // e.g. Rp 2.500
}

export interface SupportTicket {
  id: string;
  ticket_code: string;
  sender_name: string;
  sender_email: string;
  sender_role: UserRole;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  reply?: string;
}

export interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  target_audience: 'all_users' | 'all_organizers' | 'all_customers' | 'event_participants';
  event_id?: string;
  sent_count: number;
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  code: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface AuditTrailLog {
  id: string;
  user_name: string;
  user_role: string;
  action: string;
  target: string;
  ip_address: string;
  timestamp: string;
  details?: string;
}

export interface ActiveSession {
  id: string;
  user_name: string;
  device: string;
  browser: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
}

export interface SubAdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

export interface SMTPConfig {
  host: string;
  port: number;
  username: string;
  from_email: string;
  from_name: string;
  is_enabled: boolean;
}

export interface DailyTransaction {
  date: string;
  revenue: number;
  tickets: number;
  iso_date?: string;
}

export interface DashboardStats {
  active_events: number;
  pending_approval_events: number;
  total_users: number;
  total_organizers: number;
  tickets_sold: number;
  gate_scans: number;
  total_revenue: number;
  pending_tickets_count: number;
  pending_refunds_count: number;
  daily_transactions: DailyTransaction[];
  recent_orders: Order[];
  recent_events: EventItem[];
  recent_activities: AuditTrailLog[];
}

export interface SystemConfig {
  maintenance_mode: boolean;
  maintenance_message: string;
  platform_name: string;
  platform_logo_url: string;
  support_email: string;
  support_phone: string;
  refund_policy_text: string;
  payment_gateway: PaymentGatewayConfig;
  platform_fee: PlatformFeeConfig;
  smtp: SMTPConfig;
}

export interface LoginResponse {
  token: string;
  user: User;
}
