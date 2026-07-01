// Billing model interfaces
export interface Bill {
  id: string;
  tenantId: string;
  periodStart: Date;
  periodEnd: Date;
  status: BillStatus;
  lineItems: BillLineItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  invoiceNumber: string;
  breakdown?: BillBreakdown;
}

export enum BillStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

export interface BillLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  type: BillItemType;
  metadata?: { [key: string]: any };
}

export enum BillItemType {
  SUBSCRIPTION = 'subscription',
  USAGE = 'usage',
  OVERAGE = 'overage',
  ADDON = 'addon',
  DISCOUNT = 'discount',
  CREDIT = 'credit'
}

export interface BillBreakdown {
  boards: BoardUsageDetail[];
  users: UserUsageDetail[];
  dataPoints: DataPointsUsage;
  storage: StorageUsage;
  apiCalls: ApiCallsUsage;
}

export interface BoardUsageDetail {
  boardId: string;
  boardName: string;
  daysActive: number;
  dataPointsSent: number;
  cost: number;
}

export interface UserUsageDetail {
  userId: string;
  userName: string;
  daysActive: number;
  cost: number;
}

export interface DataPointsUsage {
  total: number;
  included: number;
  overage: number;
  overageRate: number;
  overageCost: number;
}

export interface StorageUsage {
  totalGb: number;
  includedGb: number;
  overageGb: number;
  overageRate: number;
  overageCost: number;
}

export interface ApiCallsUsage {
  total: number;
  included: number;
  overage: number;
  overageRate: number;
  overageCost: number;
}

// Request/Response types
export interface CalculateBillRequest {
  periodStart: Date;
  periodEnd: Date;
  includeBreakdown?: boolean;
}

export interface CalculateBillResponse {
  success: boolean;
  bill: Bill;
  message?: string;
}

export interface BillHistoryResponse {
  bills: Bill[];
  total: number;
  page: number;
  pageSize: number;
}

// Device Token
export interface DeviceToken {
  token: string;
  maskedToken: string;
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
}

export interface RegenerateTokenResponse {
  success: boolean;
  token: DeviceToken;
  message: string;
}