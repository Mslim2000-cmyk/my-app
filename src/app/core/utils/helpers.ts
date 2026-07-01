export function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(date: Date | string): string {
  if (!date) return 'Never';
  
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return formatDate(d);
}

export function maskToken(token: string): string {
  if (!token || token.length < 10) return token;
  return token.substring(0, 6) + '******' + token.substring(token.length - 4);
}

export function formatNumber(value: number, unit?: string): string {
  if (value === undefined || value === null) return '0';
  
  let formatted = value.toFixed(2);
  if (unit) {
    formatted += ` ${unit}`;
  }
  return formatted;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'online':
    case 'active':
    case 'enabled':
    case 'paid':
      return 'green';
    case 'offline':
    case 'disabled':
    case 'suspended':
      return 'red';
    case 'pending':
      return 'yellow';
    case 'overdue':
      return 'orange';
    default:
      return 'gray';
  }
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}