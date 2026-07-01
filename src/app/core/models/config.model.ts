// Configuration model interfaces
export interface TenantConfig {
  id: string;
  tenantId: string;
  dataSchema: DataSchema;
  processingRules: ProcessingRule[];
  alertRules: AlertRule[];
  features: FeatureFlags;
  createdAt: Date;
  updatedAt: Date;
}

// Data Schema Configuration
export interface DataSchema {
  fields: DataField[];
  version: string;
}

export interface DataField {
  id: string;
  name: string;
  type: DataFieldType;
  required: boolean;
  defaultValue?: any;
  validation?: FieldValidation;
  description?: string;
  unit?: string;
  order: number;
}

export enum DataFieldType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  ARRAY = 'array',
  OBJECT = 'object',
  GPS = 'gps',
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  PRESSURE = 'pressure',
  VOLTAGE = 'voltage',
  CURRENT = 'current',
  CUSTOM = 'custom'
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  enum?: string[];
  minLength?: number;
  maxLength?: number;
}

// Processing Rules Configuration
export interface ProcessingRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number;
  condition: RuleCondition;
  actions: RuleAction[];
}

export interface RuleCondition {
  type: ConditionType;
  field?: string;
  operator?: ConditionOperator;
  value?: any;
  conditions?: RuleCondition[];
}

export enum ConditionType {
  SIMPLE = 'simple',
  AND = 'and',
  OR = 'or',
  NOT = 'not'
}

export enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  IN = 'in',
  NOT_IN = 'not_in',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null'
}

export interface RuleAction {
  type: ActionType;
  config: { [key: string]: any };
}

export enum ActionType {
  TRANSFORM = 'transform',
  FILTER = 'filter',
  AGGREGATE = 'aggregate',
  ENRICH = 'enrich',
  FORWARD = 'forward',
  STORE = 'store',
  WEBHOOK = 'webhook',
  EMAIL = 'email',
  SMS = 'sms'
}

// Alert Rules Configuration
export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  severity: AlertSeverity;
  condition: RuleCondition;
  notification: AlertNotification;
  cooldown: number; // seconds
  threshold?: AlertThreshold;
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface AlertNotification {
  channels: NotificationChannel[];
  template?: string;
  recipients?: string[];
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  WEBHOOK = 'webhook',
  PUSH = 'push',
  SLACK = 'slack',
  TEAMS = 'teams'
}

export interface AlertThreshold {
  count: number;
  window: number; // seconds
}

// Feature Flags Configuration
export interface FeatureFlags {
  realTimeProcessing: boolean;
  dataRetention: boolean;
  dataRetentionDays: number;
  alerting: boolean;
  webhooks: boolean;
  apiAccess: boolean;
  customDashboards: boolean;
  multiUser: boolean;
  maxUsers: number;
  maxBoards: number;
  maxDataPoints: number;
  advancedAnalytics: boolean;
  exportData: boolean;
  auditLog: boolean;
}

// Alert Instance (triggered alerts)
export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  message: string;
  boardId?: string;
  boardName?: string;
  data?: any;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
  resolvedAt?: Date;
}

// Request/Response types
export interface SaveConfigRequest {
  dataSchema?: DataSchema;
  processingRules?: ProcessingRule[];
  alertRules?: AlertRule[];
  features?: FeatureFlags;
}

export interface ConfigResponse {
  success: boolean;
  message: string;
  config?: TenantConfig;
}