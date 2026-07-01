export const INDUSTRIES = [
  { value: 'electricity_billing', label: 'Electricity Billing', icon: 'bolt' },
  { value: 'agriculture', label: 'Agriculture', icon: 'grass' },
  { value: 'manufacturing', label: 'Manufacturing', icon: 'factory' },
  { value: 'smart_building', label: 'Smart Building', icon: 'business' },
  { value: 'other', label: 'Other', icon: 'device_hub' }
];

export const BOARD_TYPES = [
  { value: 'type_a', label: 'Type A (32 users)' },
  { value: 'type_b', label: 'Type B (16 users)' },
  { value: 'type_c', label: 'Type C (8 users)' }
];

export const FIELD_TYPES = [
  { value: 'number', label: 'Number' },
  { value: 'string', label: 'String' },
  { value: 'boolean', label: 'Boolean' }
];

export const PROCESSING_ACTIONS = [
  { value: 'accumulate', label: 'Accumulate' },
  { value: 'average', label: 'Average' },
  { value: 'max', label: 'Maximum' },
  { value: 'min', label: 'Minimum' },
  { value: 'sum', label: 'Sum' },
  { value: 'count', label: 'Count' }
];

export const ALERT_SEVERITIES = [
  { value: 'info', label: 'Info', color: 'blue' },
  { value: 'warning', label: 'Warning', color: 'yellow' },
  { value: 'critical', label: 'Critical', color: 'red' }
];

export const ALERT_ACTIONS = [
  { value: 'notify', label: 'Send Notification' },
  { value: 'disable_user', label: 'Disable User' },
  { value: 'send_command', label: 'Send Command to Board' }
];

export const FEATURES = [
  { value: 'billing', label: 'Billing System', description: 'Generate and manage bills' },
  { value: 'user_management', label: 'User Management', description: 'Manage end users' },
  { value: 'ota_updates', label: 'OTA Updates', description: 'Remote firmware updates' },
  { value: 'notifications', label: 'Notifications', description: 'Email/SMS alerts' },
  { value: 'api_access', label: 'API Access', description: 'External API integration' },
  { value: 'data_export', label: 'Data Export', description: 'Export data to CSV/PDF' },
  { value: 'custom_dashboards', label: 'Custom Dashboards', description: 'Customizable dashboards' }
];

export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'JPY', label: 'Japanese Yen (¥)' },
  { value: 'INR', label: 'Indian Rupee (₹)' }
];