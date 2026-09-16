import type {
  User,
  EventItem,
  Order,
  DashboardStats,
  SystemConfig,
  Participant,
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

export const INITIAL_MOCK_USERS: User[] = [];

export const INITIAL_MOCK_CATEGORIES: EventCategory[] = [];

export const INITIAL_MOCK_EVENTS: EventItem[] = [];

export const INITIAL_MOCK_ORDERS: Order[] = [];

export const INITIAL_MOCK_PARTICIPANTS: Participant[] = [];

export const INITIAL_MOCK_APPROVAL_LOGS: ApprovalLog[] = [];

export const INITIAL_MOCK_REFUNDS: RefundRequest[] = [];

export const INITIAL_MOCK_PAYOUTS: PayoutRecord[] = [];

export const INITIAL_MOCK_TICKETS_SUPPORT: SupportTicket[] = [];

export const INITIAL_MOCK_BROADCASTS: BroadcastMessage[] = [];

export const INITIAL_MOCK_EMAIL_TEMPLATES: EmailTemplate[] = [];

export const INITIAL_MOCK_AUDIT_LOGS: AuditTrailLog[] = [];

export const INITIAL_MOCK_SESSIONS: ActiveSession[] = [];

export const INITIAL_MOCK_ROLES: SubAdminRole[] = [];

export const INITIAL_MOCK_PAGES: StaticPage[] = [];

export const INITIAL_SYSTEM_CONFIG: SystemConfig = {
  maintenance_mode: false,
  maintenance_message: '',
  platform_name: 'Eventify Indonesia',
  platform_logo_url: '/eventify-logo.png',
  support_email: '',
  support_phone: '',
  refund_policy_text: '',
  payment_gateway: {
    midtrans_client_key: '',
    midtrans_server_key: '',
    xendit_secret_key: '',
    is_production: false,
  },
  platform_fee: {
    percentage_fee: 0,
    flat_fee_per_ticket: 0,
  },
  smtp: {
    host: '',
    port: 587,
    username: '',
    from_email: '',
    from_name: '',
    is_enabled: false,
  },
};

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  active_events: 0,
  pending_approval_events: 0,
  total_users: 0,
  total_organizers: 0,
  tickets_sold: 0,
  gate_scans: 0,
  total_revenue: 0,
  pending_tickets_count: 0,
  pending_refunds_count: 0,
  daily_transactions: [],
  recent_orders: [],
  recent_events: [],
  recent_activities: [],
};
